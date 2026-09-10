#!/usr/bin/env node
/**
 * Renders a German application into one PDF.
 *
 *   node tools/mappe.mjs <job-folder>     build the Bewerbungsmappe
 *   node tools/mappe.mjs --selftest       render a fixture and assert
 *
 * Zero npm dependencies. Uses headless Chrome for A4 rendering, and
 * pdfunite or qpdf to append existing Zeugnis scans when present.
 *
 * German applications are submitted as PDFs, and frequently as ONE PDF in a
 * fixed order. This produces that artifact, and reports every check rather
 * than silently emitting something incomplete.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const MAX_BYTES = 5 * 1024 * 1024; // portals commonly cap here

const CHROME_CANDIDATES = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
];

// Resolve a binary by scanning PATH directly. Avoids spawning a shell, which
// Node 26 deprecates for argument-passing and which is an injection surface.
const which = (cmd) => {
  for (const dir of (process.env.PATH || "").split(":")) {
    if (!dir) continue;
    const full = join(dir, cmd);
    try {
      if (statSync(full).isFile()) return full;
    } catch { /* not here */ }
  }
  return null;
};

const findChrome = () =>
  CHROME_CANDIDATES.find((p) => existsSync(p)) || which("google-chrome") || which("chromium") || null;

/* ---------- markdown -> html -------------------------------------------
 * Purpose-built for the documents these skills emit: headings, bold, italic,
 * lists, tables, rules, and paragraphs. Single newlines become hard breaks,
 * because address and sender blocks are line-per-line in a German letter.
 */
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const inline = (s) =>
  esc(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");

// DIN 5008: the Ort/Datum line sits right-aligned, and the Grussformel is
// followed by blank space for a signature. Both apply to the letter only -
// a Lebenslauf's trailing Ort/Datum line stays left-aligned above the
// signature, so these transforms are scoped by the caller.
const DATE_LINE = /^(?:[^,\n]{2,40},\s*)?(?:\d{1,2}\.\s*\p{L}+\s*\d{4}|\d{1,2}\.\d{1,2}\.\d{4})$/u;
const SIGNOFF = /^(?:(?:Mit\s+)?(?:freundlichen|besten|herzlichen)\s+Gr(?:ü|ue)(?:ß|ss)en|(?:Viele|Beste|Herzliche|Liebe|Schöne|Freundliche)\s+Gr(?:ü|ue)(?:ß|ss)e|Hochachtungsvoll|(?:Best|Kind|Warm)\s+regards|Regards|Sincerely|Yours\s+(?:sincerely|faithfully))[,.]?$/;

function mdToHtml(md, { letter = false } = {}) {
  const out = [];
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (/^\s*$/.test(line)) { i++; continue; }

    if (/^```/.test(line)) { // fenced block: emit contents as plain paragraphs
      i++;
      const buf = [];
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++;
      if (buf.length) out.push(`<p>${buf.map((l) => inline(l)).join("<br>")}</p>`);
      continue;
    }

    if (/^(-{3,}|_{3,}|\*{3,})\s*$/.test(line)) { out.push("<hr>"); i++; continue; }

    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) { const n = h[1].length; out.push(`<h${n}>${inline(h[2])}</h${n}>`); i++; continue; }

    if (/^\s*\|.*\|\s*$/.test(line)) { // table
      const rows = [];
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
        const cells = lines[i].trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
        if (!cells.every((c) => /^:?-{2,}:?$/.test(c))) rows.push(cells);
        i++;
      }
      if (rows.length) {
        const [head, ...body] = rows;
        out.push("<table>");
        out.push(`<tr>${head.map((c) => `<th>${inline(c)}</th>`).join("")}</tr>`);
        for (const r of body) out.push(`<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`);
        out.push("</table>");
      }
      continue;
    }

    if (/^\s*[-*+]\s+/.test(line)) { // list
      out.push("<ul>");
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        out.push(`<li>${inline(lines[i].replace(/^\s*[-*+]\s+/, ""))}</li>`);
        i++;
      }
      out.push("</ul>");
      continue;
    }

    const buf = []; // paragraph: single newlines are hard breaks
    while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^(#{1,4}\s|\s*\||\s*[-*+]\s|```)/.test(lines[i])) {
      buf.push(lines[i++]);
    }
    const text = buf.join("\n").trim();
    let cls = "";
    if (letter && buf.length === 1 && DATE_LINE.test(text)) cls = ' class="date"';
    else if (letter && buf.length === 1 && SIGNOFF.test(text)) cls = ' class="signoff"';
    out.push(`<p${cls}>${buf.map((l) => inline(l)).join("<br>")}</p>`);
  }
  return out.join("\n");
}

/* ---------- pdf helpers ------------------------------------------------ */

// Chrome-generated PDFs are uncompressed enough at the object level that
// counting page objects is reliable. Falls back to null rather than lying.
function pageCount(pdfPath) {
  try {
    const buf = readFileSync(pdfPath).toString("latin1");
    const n = (buf.match(/\/Type\s*\/Page[^s]/g) || []).length;
    return n > 0 ? n : null;
  } catch {
    return null;
  }
}

function renderPdf(chrome, htmlPath, pdfPath) {
  execFileSync(chrome, [
    "--headless",
    "--disable-gpu",
    "--no-sandbox",
    "--no-pdf-header-footer",
    "--run-all-compositor-stages-before-draw",
    "--virtual-time-budget=3000",
    `--print-to-pdf=${pdfPath}`,
    `file://${htmlPath}`,
  ], { stdio: "pipe" });
  if (!existsSync(pdfPath)) throw new Error("Chrome produced no PDF");
}

function concatPdfs(parts, outPath) {
  if (parts.length === 1) { writeFileSync(outPath, readFileSync(parts[0])); return "single"; }
  if (which("pdfunite")) { execFileSync("pdfunite", [...parts, outPath], { stdio: "pipe" }); return "pdfunite"; }
  if (which("qpdf")) { execFileSync("qpdf", ["--empty", "--pages", ...parts, "--", outPath], { stdio: "pipe" }); return "qpdf"; }
  return null;
}

/* ---------- build ------------------------------------------------------ */

function wrap(sections) {
  const css = readFileSync(join(HERE, "din5008.css"), "utf8");
  const body = sections
    .map(({ md, letter }) => `<section class="doc">\n${mdToHtml(md, { letter })}\n</section>`)
    .join("\n");
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><style>\n${css}\n</style></head><body>\n${body}\n</body></html>`;
}

// Read ONLY the decision line. The Evidence block in language.md legitimately
// names the ad's language, which is often German for an application that was
// deliberately made in English - scanning the whole file inverts the choice.
function declaredLang(folder) {
  const f = join(folder, "language.md");
  if (!existsSync(f)) return null;
  const m = readFileSync(f, "utf8").match(
    /^\s*[-*]?\s*\*{0,2}Application language\*{0,2}\s*:\s*(.+)$/im,
  );
  if (!m) return null;
  const v = m[1].trim();
  if (/\bboth\b|\bbeide\b/i.test(v)) return "both";
  if (/\b(deutsch|german|de)\b/i.test(v)) return "de";
  if (/\b(english|englisch|en)\b/i.test(v)) return "en";
  return null;
}

const DOCS = {
  de: { letter: "anschreiben-de.md", cv: "resume-de.md" },
  en: { letter: "cover-letter-en.md", cv: "resume-en.md" },
};

function pickDocs(folder, lang) {
  const has = (f) => existsSync(join(folder, f));
  const { letter, cv } = DOCS[lang];
  return { lang, letter: has(letter) ? letter : null, cv: has(cv) ? cv : null };
}

// Which language(s) to build: an explicit flag wins, then the recorded
// decision, then whichever document set is actually on disk.
function resolveLangs(folder, override) {
  if (override) return [override];
  const declared = declaredLang(folder);
  const present = ["de", "en"].filter(
    (l) => existsSync(join(folder, DOCS[l].letter)) || existsSync(join(folder, DOCS[l].cv)),
  );
  if (declared === "both") return present.length ? present : ["de"];
  if (declared && present.includes(declared)) return [declared];
  if (declared && !present.length) return [declared];
  if (declared) {
    // Decision recorded, but only the other language's documents exist.
    console.error(
      `WARN  language.md says ${declared}, but only the ${present.join("/")} document set exists.`,
    );
    console.error("      Rendering what is on disk. Re-run tailor-cv/anschreiben if that is wrong.\n");
    return present;
  }
  return present.length ? present : ["de"];
}

function build(folder, lang, outName) {
  const report = [];
  const chrome = findChrome();
  if (!chrome) {
    console.error("No Chrome/Chromium found. Install Google Chrome, or render the\nmarkdown to PDF yourself and combine in this order: Anschreiben, Lebenslauf, Arbeitszeugnisse (newest first), Abschlusszeugnisse.");
    process.exit(2);
  }

  const { letter, cv } = pickDocs(folder, lang);
  if (!letter && !cv) {
    const { letter: l, cv: c } = DOCS[lang];
    console.error(`Nothing to render for ${lang} in ${folder}. Expected ${l} or ${c}.`);
    process.exit(2);
  }
  report.push(`language: ${lang}`);

  const tmp = mkdtempSync(join(tmpdir(), "mappe-"));
  const parts = [];

  // Letter and CV are rendered as one document so they share typography and
  // need no external merge tool.
  const sections = [];
  if (letter) sections.push({ md: readFileSync(join(folder, letter), "utf8"), letter: true });
  if (cv) sections.push({ md: readFileSync(join(folder, cv), "utf8"), letter: false });

  const htmlPath = join(tmp, "docs.html");
  const corePdf = join(tmp, "docs.pdf");
  writeFileSync(htmlPath, wrap(sections));
  renderPdf(chrome, htmlPath, corePdf);
  parts.push(corePdf);

  // Per-document page counts, so the one-page Anschreiben rule is checkable.
  const counts = {};
  for (const [name, src] of [["Letter", letter], ["CV", cv]]) {
    if (!src) continue;
    const p = join(tmp, `${name}.pdf`);
    writeFileSync(join(tmp, `${name}.html`), wrap([{ md: readFileSync(join(folder, src), "utf8"), letter: name === "Letter" }]));
    renderPdf(chrome, join(tmp, `${name}.html`), p);
    counts[name] = pageCount(p);
  }

  // Append Zeugnis scans, newest first by filename.
  const zDir = join(folder, "..", "..", "zeugnisse");
  let zeugnisse = [];
  if (existsSync(zDir)) {
    zeugnisse = readdirSync(zDir).filter((f) => f.toLowerCase().endsWith(".pdf")).sort().reverse();
    parts.push(...zeugnisse.map((f) => join(zDir, f)));
  }

  const out = join(folder, outName);
  const merger = concatPdfs(parts, out);
  if (!merger) {
    writeFileSync(out, readFileSync(corePdf));
    report.push(`WARN  ${zeugnisse.length} Zeugnis PDF(s) NOT appended - no pdfunite or qpdf found.`);
    report.push("      Install poppler (brew install poppler) or qpdf, or append them yourself.");
    zeugnisse = [];
  }

  const bytes = statSync(out).size;
  const total = pageCount(out);

  // Report every check. A silent problem here costs a real application.
  const checks = [];
  const letterName = lang === "de" ? "Anschreiben" : "Cover letter";
  const cvName = lang === "de" ? "Lebenslauf" : "CV";
  if (counts.Letter != null) {
    checks.push(counts.Letter === 1
      ? `PASS  ${letterName} is 1 page`
      : `FAIL  ${letterName} is ${counts.Letter} pages - must be exactly 1. Cut it.`);
  }
  if (counts.CV != null) {
    checks.push(counts.CV > 2
      ? `FAIL  ${cvName} is ${counts.CV} pages - maximum is 2. Cut bullets from the oldest roles.`
      : counts.CV === 2
        ? `PASS  ${cvName} is 2 pages - check page 2 is not a short orphan; a two-role ${cvName} usually fits on one`
        : `PASS  ${cvName} is 1 page`);
  }
  checks.push(bytes <= MAX_BYTES
    ? `PASS  ${(bytes / 1024 / 1024).toFixed(2)} MB, under the 5 MB portal cap`
    : `FAIL  ${(bytes / 1024 / 1024).toFixed(2)} MB exceeds the 5 MB cap most portals enforce. Compress the Zeugnis scans.`);
  if (zeugnisse.length) checks.push(`PASS  ${zeugnisse.length} Zeugnis PDF(s) appended (${merger})`);
  else if (merger) checks.push('NOTE  no Zeugnisse appended - write "Zeugnisse werden auf Wunsch nachgereicht" in the Anlagen line');

  console.log(`\n${outName} — ${total ?? "?"} pages, ${(bytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  ${out}\n`);
  for (const r of report) console.log(`  ${r}`);
  console.log();
  for (const c of checks) console.log(`  ${c}`);
  console.log("\n  Layout note: A4 geometry and DIN 5008 margins are applied here.");
  console.log("  Betreff / Anrede / Anlagen ordering comes from the anschreiben skill.\n");

  if (checks.some((c) => c.startsWith("FAIL"))) process.exit(1);
}

/* ---------- selftest --------------------------------------------------- */

function selftest() {
  const dir = mkdtempSync(join(tmpdir(), "mappe-test-"));
  writeFileSync(join(dir, "language.md"), "# Language Decision\n\n- **Application language**: Deutsch\n");
  writeFileSync(join(dir, "anschreiben-de.md"), [
    "Jana Beispiel", "Musterweg 1", "70173 Stuttgart", "", "Beispiel GmbH",
    "Frau Berger", "Industriestr. 4", "70565 Stuttgart", "",
    "Stuttgart, 8. September 2026", "",
    "**Bewerbung als Softwareentwicklerin (m/w/d), Kennziffer 4711**", "",
    "Sehr geehrte Frau Berger,", "",
    "mit großem Interesse habe ich Ihre Stellenanzeige gelesen.", "",
    "Bei der Muster AG habe ich die Zahlungsplattform auf Kubernetes migriert.",
    "Die Ausfallzeit sank dabei um 40 Prozent.", "",
    "Meine Gehaltsvorstellung liegt bei 75.000 EUR brutto p. a.", "",
    "Mit freundlichen Grüßen", "", "Jana Beispiel", "", "Anlagen", "Lebenslauf",
  ].join("\n"));
  writeFileSync(join(dir, "resume-de.md"), [
    "# Lebenslauf", "", "## Persönliche Daten", "",
    "| | |", "|---|---|", "| Name | Jana Beispiel |", "| E-Mail | jana@example.de |", "",
    "## Berufserfahrung", "",
    "| 03/2021 – heute | **Senior Engineer**, Muster AG, Stuttgart |", "|---|---|",
    "| | - Zahlungsplattform auf Kubernetes migriert |", "",
    "## Kenntnisse", "", "| Sprachen | Deutsch: C1 · Englisch: C2 |", "|---|---|",
  ].join("\n"));

  const assert = (cond, msg) => {
    if (!cond) { console.error(`FAIL: ${msg}`); process.exitCode = 1; } else console.log(`ok - ${msg}`);
  };

  // markdown converter
  assert(mdToHtml("**bold**").includes("<strong>bold</strong>"), "bold converts");
  assert(mdToHtml("# H").includes("<h1>H</h1>"), "heading converts");
  assert(mdToHtml("a\nb").includes("a<br>b"), "single newline is a hard break (address blocks)");
  assert(mdToHtml("| a | b |\n|---|---|\n| 1 | 2 |").includes("<th>a</th>"), "table converts");
  assert(mdToHtml("- x").includes("<li>x</li>"), "list converts");
  assert(!mdToHtml("<script>").includes("<script>"), "html is escaped");
  assert(mdToHtml("Stuttgart, 8. September 2026", { letter: true }).includes('class="date"'),
    "letter date line is right-aligned (DIN 5008)");
  assert(!mdToHtml("Stuttgart, 8. September 2026").includes('class="date"'),
    "a Lebenslauf date line is NOT right-aligned");
  assert(mdToHtml("Mit freundlichen Grüßen", { letter: true }).includes('class="signoff"'),
    "Grussformel gets signature space");
  for (const s of ["Viele Grüße", "Beste Grüße", "Herzliche Grüße", "Liebe Grüße", "Best regards"]) {
    assert(mdToHtml(s, { letter: true }).includes('class="signoff"'),
      `informal / English sign-off "${s}" gets signature space (du-register letters use these)`);
  }
  assert(!mdToHtml("Meine Gehaltsvorstellung liegt bei 75.000 EUR", { letter: true }).includes('class="date"'),
    "ordinary paragraphs are untouched");

  // language resolution - regression: the Evidence block names the ad's
  // language, which must not override the recorded decision
  assert(declaredLang(dir) === "de", "reads the recorded decision");
  const enDir = mkdtempSync(join(tmpdir(), "mappe-en-"));
  writeFileSync(join(enDir, "language.md"),
    "# Language Decision\n\n- **Application language**: English\n\n## Evidence\n- Ad language: German\n");
  writeFileSync(join(enDir, "cover-letter-en.md"), "Dear Hiring Manager,\n\nHello.\n\nRegards,\nJana\n");
  writeFileSync(join(enDir, "resume-en.md"), "# Jana Beispiel\n\nEngineer.\n");
  assert(declaredLang(enDir) === "en",
    "an English decision survives a German ad language in the Evidence block");
  assert(resolveLangs(enDir, null)[0] === "en", "resolves to the English document set");
  assert(pickDocs(enDir, "en").letter === "cover-letter-en.md", "picks the English letter");

  const bothDir = mkdtempSync(join(tmpdir(), "mappe-both-"));
  writeFileSync(join(bothDir, "language.md"), "- **Application language**: Both\n");
  writeFileSync(join(bothDir, "anschreiben-de.md"), "Sehr geehrte Damen und Herren,\n\nguten Tag.\n");
  writeFileSync(join(bothDir, "cover-letter-en.md"), "Dear Hiring Manager,\n\nHello.\n");
  assert(declaredLang(bothDir) === "both", "reads a Both decision");
  assert(resolveLangs(bothDir, null).length === 2, "Both builds two Mappen");
  assert(resolveLangs(bothDir, "de").join() === "de", "--lang overrides the recorded decision");

  const picked = pickDocs(dir, "de");
  assert(picked.letter === "anschreiben-de.md" && picked.cv === "resume-de.md", "picks both German documents");

  if (!findChrome()) {
    console.log("skip - no Chrome found, PDF rendering not exercised");
    return;
  }
  build(dir, "de", "bewerbungsmappe.pdf");
  const out = join(dir, "bewerbungsmappe.pdf");
  assert(existsSync(out), "PDF is produced");
  assert(statSync(out).size > 1000, "PDF is non-trivial in size");
  assert(readFileSync(out).toString("latin1").startsWith("%PDF"), "output is a real PDF");
  assert(pageCount(out) >= 2, "PDF has a page per document");
}

const argv = process.argv.slice(2);
const arg = argv[0];
const langFlag = (() => {
  const i = argv.indexOf("--lang");
  if (i === -1) return null;
  const v = (argv[i + 1] || "").toLowerCase();
  if (v !== "de" && v !== "en") {
    console.error("--lang takes de or en");
    process.exit(2);
  }
  return v;
})();

if (!arg || arg === "--help") {
  console.log("usage: node tools/mappe.mjs <job-folder> [--lang de|en]");
  console.log("       node tools/mappe.mjs --selftest");
  process.exit(arg ? 0 : 2);
} else if (arg === "--selftest") {
  selftest();
} else {
  const folder = resolve(arg);
  if (!existsSync(folder)) { console.error(`No such folder: ${folder}`); process.exit(2); }
  const langs = resolveLangs(folder, langFlag);
  for (const lang of langs) {
    const outName = langs.length > 1 ? `bewerbungsmappe-${lang}.pdf` : "bewerbungsmappe.pdf";
    build(folder, lang, outName);
  }
}
