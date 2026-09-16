#!/usr/bin/env node
/**
 * Check that the things this project depends on still work.
 *
 *   node tools/preflight.mjs            everything
 *   node tools/preflight.mjs --env      local tooling only, no network
 *   node tools/preflight.mjs --sources  live external sources only
 *
 * The link checker asks whether a URL resolves. This asks the harder
 * question: does the thing still *behave* the way the knowledge layer says
 * it does. Those are different failures, and the second is the one that
 * silently produces a wrong answer for a candidate.
 *
 * What rots, in rough order of likelihood:
 *
 *   * the Arbeitsagentur client key - it is a fixed string lifted from their
 *     own web app, and a rotation turns job-search's largest source into an
 *     empty result set, which reads as an empty market
 *   * JSON-LD on Personio or softgarden - the extractor's whole premise
 *   * the §18g percentages, if the statute is amended
 *
 * It also re-checks a quirk the docs *rely* on: softgarden serving an
 * expired posting as HTTP 200 with a tracking pixel. If softgarden ever
 * fixes that, the detection stops being needed and ats.md is wrong. A
 * project should notice when reality improves, not only when it breaks.
 */
import { execFileSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";
const results = [];
const record = (level, name, detail, fix) => results.push({ level, name, detail, fix });

const which = (cmd) => {
  for (const dir of (process.env.PATH || "").split(":")) {
    if (!dir) continue;
    try { if (statSync(join(dir, cmd)).isFile()) return join(dir, cmd); } catch { /* next */ }
  }
  return null;
};

const BROWSERS = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium", "/usr/bin/chromium-browser",
];

async function get(url, { timeout = 25000, headers = {} } = {}) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeout);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, "Accept-Language": "de-DE,de;q=0.9", ...headers },
      redirect: "follow", signal: ctl.signal,
    });
    return { status: res.status, body: await res.text() };
  } catch (e) {
    return { status: null, body: "", error: e.name === "AbortError" ? "timeout" : e.message };
  } finally {
    clearTimeout(timer);
  }
}

const hasJobPostingLd = (html) => {
  for (const m of String(html).matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    let d; try { d = JSON.parse(m[1].trim()); } catch { continue; }
    const stack = [d];
    while (stack.length) {
      const n = stack.pop();
      if (Array.isArray(n)) { stack.push(...n); continue; }
      if (n && typeof n === "object") {
        const t = n["@type"];
        if (t === "JobPosting" || (Array.isArray(t) && t.includes("JobPosting"))) return n;
        if (n["@graph"]) stack.push(n["@graph"]);
      }
    }
  }
  return null;
};

/* ---------- local tooling ---------- */

function checkEnv() {
  const major = Number(process.versions.node.split(".")[0]);
  major >= 20
    ? record("PASS", "node", `v${process.versions.node}`)
    : record("FAIL", "node", `v${process.versions.node}`, "The tools use built-in fetch and modern syntax. Install Node 20 or newer.");

  const browser = BROWSERS.find((p) => existsSync(p)) || which("google-chrome") || which("chromium");
  browser
    ? record("PASS", "browser", browser.split("/").pop())
    : record("FAIL", "browser", "none found",
        "mappe renders the Bewerbungsmappe with headless Chrome. Install Google Chrome or Chromium, or render the documents yourself.");

  const merger = which("pdfunite") || which("qpdf");
  merger
    ? record("PASS", "pdf merge", merger.split("/").pop())
    : record("WARN", "pdf merge", "neither pdfunite nor qpdf",
        "The letter and CV still render; Zeugnis scans cannot be appended. brew install poppler, or install qpdf.");
}

/* ---------- live sources ---------- */

async function checkSources() {
  // Most likely to rot, and the loudest when it does.
  const ba = await get(
    "https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v6/jobs?was=Softwareentwickler&wo=Karlsruhe&size=1&zeitarbeit=false&pav=false",
    { headers: { "X-API-Key": "jobboerse-jobsuche", Accept: "application/json" } },
  );
  if (ba.status === 200) {
    let total = null;
    try { total = JSON.parse(ba.body).maxErgebnisse; } catch { /* shape changed */ }
    total != null
      ? record("PASS", "Arbeitsagentur API", `v6 ok, ${total} hits for a sample query`)
      : record("FAIL", "Arbeitsagentur API", "200 but maxErgebnisse is missing",
          "The response shape changed. Re-check the field names in tools/arbeitsagentur.mjs against a live call.");
  } else if (ba.status === 403) {
    record("FAIL", "Arbeitsagentur API", "403 - the client key was rotated",
      "Open arbeitsagentur.de/jobsuche/suche in a browser, read X-API-Key off the jobsuche-service request, and update API_KEY in tools/arbeitsagentur.mjs. Until then job-search must NOT report zero results as an empty market.");
  } else {
    record("WARN", "Arbeitsagentur API", ba.error || `HTTP ${ba.status}`,
      "Could be transient. Re-run before changing anything.");
  }

  // The extractor's premise: these two publish structured data. Resolve a
  // CURRENTLY OPEN posting from each tenant's own list rather than pinning a
  // job id - a pinned one closes, and "sample closed" would look like
  // "provider dropped JSON-LD".
  const tenants = [
    { label: "Personio JSON-LD", list: "https://smight-gmbh.jobs.personio.de/",
      pick: (h) => (h.match(/\/job\/\d+/) || [null])[0], base: "https://smight-gmbh.jobs.personio.de" },
    { label: "softgarden JSON-LD", list: "https://karlmayer.softgarden.io/vacancies",
      pick: (h) => { const m = h.match(/href="\.\.\/(job\/\d+\/[^"]*?)"/); return m ? "/" + m[1].replace(/&amp;/g, "&") : null; },
      base: "https://karlmayer.softgarden.io" },
  ];
  for (const { label, list, pick, base } of tenants) {
    const l = await get(list);
    if (l.status !== 200) { record("WARN", label, `listing page HTTP ${l.status || l.error}`, "Tenant unreachable; try another before concluding anything."); continue; }
    const path = pick(l.body);
    if (!path) { record("WARN", label, "no open posting found on the tenant's list", "The tenant may have no vacancies right now. Pick another tenant to test against."); continue; }
    const r = await get(base + path);
    if (r.status !== 200) { record("WARN", label, `posting HTTP ${r.status || r.error}`, "Transient, most likely."); continue; }
    const ld = hasJobPostingLd(r.body);
    ld
      ? record("PASS", label, `JobPosting present (${Object.keys(ld).length} fields) on a live posting`)
      : record("FAIL", label, "no JSON-LD JobPosting on a currently-open posting",
          "tools/posting.mjs depends on this. If the provider dropped it, the selector fallback in web-extraction.md becomes the primary path and the Verified column in ats.md is wrong.");
  }

  // Statute text: the Blue Card threshold is computed from these percentages.
  const law = await get("https://www.gesetze-im-internet.de/aufenthg_2004/__18g.html");
  if (law.status === 200) {
    const has50 = /50\s*Prozent/.test(law.body);
    const has453 = /45,3\s*Prozent/.test(law.body);
    has50 && has453
      ? record("PASS", "§18g AufenthG", "50 % and 45,3 % both still stated")
      : record("FAIL", "§18g AufenthG", `50 %: ${has50}, 45,3 %: ${has453}`,
          "The statute was amended. Update the threshold table in shared/references/work-authorization.md from the current text - do not carry the old percentages forward.");
  } else {
    record("WARN", "§18g AufenthG", law.error || `HTTP ${law.status}`, "Transient, most likely.");
  }

  // A quirk the docs rely on. If it is fixed, the docs are the thing that is wrong.
  const gone = await get("https://karlmayer.softgarden.io/job/40509088?l=en");
  if (gone.status === 200 && gone.body.length < 400 && /tracker\/view\//.test(gone.body)) {
    record("PASS", "softgarden expiry trap", "still 200 + tracking pixel, as documented");
  } else if (gone.status === 404) {
    record("WARN", "softgarden expiry trap", "now answers 404 for an expired posting",
      "Good news, and it means ats.md overstates the problem. Re-verify on another expired posting before softening the warning - the pixel detection in posting.mjs is harmless either way.");
  } else {
    record("WARN", "softgarden expiry trap", `HTTP ${gone.status}, ${gone.body.length}B`,
      "Behaviour changed or the sample was reused. Re-check before editing ats.md.");
  }
}

/* ---------- run ---------- */

const args = process.argv.slice(2);
const doEnv = args.length === 0 || args.includes("--env");
const doSources = args.length === 0 || args.includes("--sources");

if (doEnv) checkEnv();
if (doSources) await checkSources();

const pad = Math.max(...results.map((r) => r.name.length));
console.log();
for (const r of results) {
  console.log(`  ${r.level.padEnd(4)}  ${r.name.padEnd(pad)}  ${r.detail}`);
  if (r.fix && r.level !== "PASS") console.log(`        ${" ".repeat(pad)}  -> ${r.fix}`);
}

const fails = results.filter((r) => r.level === "FAIL");
const warns = results.filter((r) => r.level === "WARN");
console.log(`\n  ${results.length - fails.length - warns.length} ok, ${warns.length} warning(s), ${fails.length} failure(s)\n`);
process.exit(fails.length ? 1 : 0);
