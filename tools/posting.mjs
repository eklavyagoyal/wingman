#!/usr/bin/env node
/**
 * Fetch a job posting and emit clean markdown for posting.md.
 *
 *   node tools/posting.mjs <url>
 *   node tools/posting.mjs --selftest
 *
 * Zero dependencies. Prefers schema.org JSON-LD JobPosting, which both
 * Personio and softgarden emit - the two systems that cover most German
 * employers. That beats selector-guessing: no context blowout, and the
 * fields arrive typed.
 *
 * It exists mainly to make three silent failures loud:
 *
 *   1. softgarden serves an EXPIRED posting as HTTP 200 with a 123-byte
 *      tracking pixel. Not a 404. A tool that checks response.ok passes,
 *      extracts nothing, and hands the model an empty posting.
 *   2. validThrough can be in the past on a page that still renders.
 *   3. A page can be a cookie wall with a job-shaped title.
 *
 * Exit 0 = usable posting. Exit 3 = reached the page, cannot trust it
 * (say so and ask the user to paste). Exit 2 = could not fetch.
 */
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

const decode = (s) => String(s ?? "")
  .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d))
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));

export function htmlToText(h) {
  return decode(
    String(h ?? "")
      .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ")
      .replace(/<li[^>]*>/gi, "\n- ")
      .replace(/<\/(p|div|h[1-6]|li|tr|section)>/gi, "\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
  ).replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

/** Every JSON-LD block, flattened through @graph and arrays. */
export function jsonLdNodes(html) {
  const out = [];
  for (const m of String(html).matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    let parsed;
    try { parsed = JSON.parse(m[1].trim()); } catch { continue; }
    const stack = [parsed];
    while (stack.length) {
      const n = stack.pop();
      if (Array.isArray(n)) { stack.push(...n); continue; }
      if (n && typeof n === "object") {
        out.push(n);
        if (n["@graph"]) stack.push(n["@graph"]);
      }
    }
  }
  return out;
}

export const findJobPosting = (html) =>
  jsonLdNodes(html).find((n) => {
    const t = n["@type"];
    return t === "JobPosting" || (Array.isArray(t) && t.includes("JobPosting"));
  }) || null;

/** A 200 that is really "this job is gone". */
export function detectDeadPage(html) {
  const body = String(html);
  if (body.length < 400 && /tracker\/view\/|\/view\.gif|width="1"\s+height="1"/i.test(body)) {
    return "The server returned HTTP 200 but the body is only a tracking pixel. On softgarden this is how an expired posting is served - it is not a 404. The posting is gone.";
  }
  const text = htmlToText(body);
  if (text.length < 200) {
    return `The page fetched but carries almost no text (${text.length} chars). Likely client-rendered, a cookie wall, or bot-blocked.`;
  }
  const gone = body.match(/(Stelle (?:ist )?nicht mehr (?:verf(?:ü|&uuml;)gbar|besetzbar|online)|Diese Stelle wurde besetzt|no longer (?:available|accepting)|position (?:has been|is) (?:filled|closed)|Anzeige (?:ist )?abgelaufen)/i);
  if (gone) return `The page says the posting is closed: "${decode(gone[0])}".`;
  return null;
}

const flat = (v) => {
  if (v == null) return null;
  if (typeof v === "string") return v.trim() || null;
  if (typeof v === "number") return String(v);
  if (Array.isArray(v)) return v.map(flat).filter(Boolean).join(", ") || null;
  if (typeof v === "object") {
    // A schema.org PropertyValue carries the label in `name` and the datum in
    // `value`. Personio puts the COMPANY in identifier.name and the real job id
    // in identifier.value, so preferring `name` here silently reports the
    // employer as the job's identifier.
    if (v["@type"] === "PropertyValue" && v.value != null) return flat(v.value);
    if (v.name) return flat(v.name);
    const a = v.address || v.jobLocation?.address;
    if (a) return [a.addressLocality, a.addressRegion, a.addressCountry].map(flat).filter(Boolean).join(", ") || null;
    if (v.value != null) {
      const cur = v.currency || v.unitText || "";
      const val = v.value;
      if (val && typeof val === "object") {
        const r = [val.minValue, val.maxValue].filter((x) => x != null).join("–");
        return [r || val.value, cur, val.unitText].filter(Boolean).join(" ") || null;
      }
      return [val, cur].filter(Boolean).join(" ");
    }
  }
  return null;
};

export function toMarkdown(job, { url, fetchedAt, warnings = [] }) {
  const L = [`# ${flat(job.title) || "Job posting"}`, "", `- **Employer URL**: ${url}`,
    `- **Source**: schema.org JSON-LD JobPosting, fetched ${fetchedAt}`];
  const rows = [["Employer", job.hiringOrganization], ["Location", job.jobLocation],
    ["Employment type", job.employmentType], ["Posted", job.datePosted],
    ["Valid through", job.validThrough], ["Salary", job.baseSalary],
    ["Identifier", job.identifier], ["Industry", job.industry],
    ["Work hours", job.workHours], ["Remote", job.jobLocationType]];
  for (const [label, v] of rows) { const s = flat(v); if (s) L.push(`- **${label}**: ${s}`); }
  if (warnings.length) { L.push("", "> [!WARNING]"); for (const w of warnings) L.push(`> ${w}`); }
  L.push("", "---", "", htmlToText(job.description) || "_No description in the structured data - read the page._");
  return L.join("\n") + "\n";
}

export function warningsFor(job, now = new Date()) {
  const out = [];
  const vt = flat(job.validThrough);
  if (vt) {
    const d = new Date(vt);
    if (!isNaN(d) && d < now) out.push(`validThrough is ${vt}, which is in the past. The page still renders, but the employer has marked this posting expired. Confirm before spending an evening on it.`);
  }
  const dp = flat(job.datePosted);
  if (dp) {
    const d = new Date(dp);
    if (!isNaN(d)) {
      const days = Math.floor((now - d) / 86400000);
      if (days > 180) out.push(`Posted ${dp}, about ${Math.round(days / 30)} months ago. Long-open postings are worth a legitimacy note in Block G - evergreen hiring, or hard to fill.`);
    }
  }
  return out;
}

async function run(url) {
  let res, html;
  try {
    res = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "de-DE,de;q=0.9,en;q=0.8" }, redirect: "follow" });
    html = await res.text();
  } catch (e) {
    console.error(`Could not fetch ${url}: ${e.message}\nAsk the user to paste the posting.`);
    process.exit(2);
  }
  if (!res.ok) {
    console.error(`HTTP ${res.status} for ${url}\nThe posting is not reachable. Do not evaluate from the job title alone - ask the user to paste it, or treat the posting as gone.`);
    process.exit(3);
  }

  const dead = detectDeadPage(html);
  if (dead) {
    console.error(`HTTP ${res.status}, but this is not a usable posting.\n\n  ${dead}\n\nDo not evaluate. Report it to the user and, if they still want this employer, look for the role on the employer's current vacancies page.`);
    process.exit(3);
  }

  const job = findJobPosting(html);
  if (!job) {
    console.error(`Fetched ${htmlToText(html).length} chars but found no JSON-LD JobPosting.\nFall back to a scoped selector per shared/references/web-extraction.md - never get_page_text on a listings page.`);
    process.exit(3);
  }

  const warnings = warningsFor(job);
  process.stdout.write(toMarkdown(job, { url, fetchedAt: new Date().toISOString().slice(0, 10), warnings }));
  for (const w of warnings) console.error(`WARN  ${w}`);
}

function selftest() {
  let bad = 0;
  const ok = (c, m) => { console.log(`${c ? "ok" : "FAIL"} - ${m}`); if (!c) bad++; };

  const page = (extra) => `<html><head><script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org", "@type": "JobPosting", title: "Software Engineer (m/w/d)",
    datePosted: "2026-08-01", employmentType: "FULL_TIME", identifier: { "@type": "PropertyValue", value: "1560214" },
    hiringOrganization: { "@type": "Organization", name: "Beispiel GmbH" },
    jobLocation: { "@type": "Place", address: { addressLocality: "Karlsruhe", addressCountry: "DE" } },
    description: "<p>Du baust Services.</p><ul><li>Go</li><li>Kafka</li></ul>", ...extra,
  })}</script></head><body>${"Stellenbeschreibung mit reichlich Text. ".repeat(20)}</body></html>`;

  const j = findJobPosting(page());
  ok(j && j.title === "Software Engineer (m/w/d)", "finds JSON-LD JobPosting");
  ok(flat(j.hiringOrganization) === "Beispiel GmbH", "flattens hiringOrganization to a name");
  ok(flat(j.jobLocation) === "Karlsruhe, DE", "flattens a nested Place address");
  ok(flat(j.identifier) === "1560214", "flattens a PropertyValue identifier");
  // Regression: Personio ships identifier {name: "<company>", value: "<id>"}.
  ok(flat({ "@type": "PropertyValue", name: "SMIGHT GmbH ", value: "1560214-147631" }) === "1560214-147631",
    "PropertyValue prefers value over name, so the employer is not reported as the job id");
  ok(flat({ "@type": "Organization", name: "SMIGHT GmbH " }) === "SMIGHT GmbH",
    "trims the trailing space Personio leaves on org names");

  ok(findJobPosting(`<script type="application/ld+json">${JSON.stringify({ "@graph": [{ "@type": "WebSite" }, { "@type": "JobPosting", title: "X" }] })}</script>`)?.title === "X",
    "digs JobPosting out of an @graph");
  ok(findJobPosting(`<script type="application/ld+json">${JSON.stringify([{ "@type": "Organization" }, { "@type": ["JobPosting"], title: "Y" }])}</script>`)?.title === "Y",
    "handles an array @type and a top-level array");
  ok(findJobPosting('<script type="application/ld+json">{ not json </script>') === null, "survives malformed JSON-LD");

  const t = htmlToText("<p>Eins</p><ul><li>Zwei</li></ul>&amp; drei &#8211;");
  ok(t.includes("- Zwei") && t.includes("& drei"), "html to text keeps list markers and decodes entities");
  ok(!htmlToText("<script>evil()</script>ok").includes("evil"), "strips script bodies");

  // the traps this tool exists for
  ok(detectDeadPage('<img src="https://tracker.softgarden.de/tracker/view/40509088/130527641/view.gif" width="1" height="1" />')?.includes("tracking pixel"),
    "catches the softgarden expired-job tracking pixel served as HTTP 200");
  ok(detectDeadPage("<html><body>tiny</body></html>")?.includes("almost no text"), "catches a near-empty page");
  ok(detectDeadPage(`<html><body>${"Stellenbeschreibung ".repeat(40)} Diese Stelle wurde besetzt</body></html>`)?.includes("closed"),
    "catches a German closed-posting notice");
  ok(detectDeadPage(page()) === null, "a real posting is not flagged dead");

  const now = new Date("2026-09-13");
  ok(warningsFor(findJobPosting(page({ validThrough: "2026-01-01" })), now).some((w) => w.includes("in the past")),
    "warns when validThrough has passed");
  ok(warningsFor(findJobPosting(page({ datePosted: "2024-05-13" })), now).some((w) => w.includes("months ago")),
    "warns on a long-open posting, for Block G");
  ok(warningsFor(findJobPosting(page()), now).length === 0, "a fresh posting produces no warnings");

  const md = toMarkdown(findJobPosting(page({ baseSalary: { "@type": "MonetaryAmount", currency: "EUR", value: { "@type": "QuantitativeValue", minValue: 65000, maxValue: 80000, unitText: "YEAR" } } })),
    { url: "https://example.de/job/1", fetchedAt: "2026-09-13", warnings: ["expired"] });
  ok(md.startsWith("# Software Engineer (m/w/d)"), "markdown leads with the advertised title");
  ok(md.includes("**Employer**: Beispiel GmbH") && md.includes("**Location**: Karlsruhe, DE"), "markdown carries employer and location");
  ok(md.includes("65000–80000 EUR YEAR"), "flattens a salary range");
  ok(md.includes("> [!WARNING]") && md.includes("> expired"), "surfaces warnings in the document itself");
  ok(md.includes("- Go"), "description keeps its bullets");

  console.log(bad ? `\n${bad} failed` : "\nall passed");
  if (bad) process.exitCode = 1;
}

const arg = process.argv[2];
if (!arg || arg === "--help") { console.log("usage: node tools/posting.mjs <url> | --selftest"); process.exit(arg ? 0 : 2); }
else if (arg === "--selftest") selftest();
else await run(arg);
