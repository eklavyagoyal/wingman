#!/usr/bin/env node
/**
 * Search the Bundesagentur für Arbeit job board.
 *
 *   node tools/arbeitsagentur.mjs "Softwareentwickler" Karlsruhe
 *   node tools/arbeitsagentur.mjs "Pflegefachkraft" München --umkreis 50 --size 25
 *   node tools/arbeitsagentur.mjs "DevOps" Berlin --include-agencies --json
 *   node tools/arbeitsagentur.mjs --selftest
 *
 * The BA board carries the largest listing volume in Germany and reaches
 * Mittelstand and regional employers that never appear on the commercial
 * boards. It has a real JSON API, so this needs no browser and cannot blow
 * out a context window.
 *
 * Two things worth knowing, both established by testing rather than docs:
 *
 *   * The endpoint is v6. The widely-copied v4 path answers 403.
 *   * `X-API-Key: jobboerse-jobsuche` is required. It is not a secret - it is
 *     the fixed client id the agency's own public web app sends on every
 *     search. Without it every request is 403.
 *
 * Zeitarbeit is excluded by default, at source, so the skill never has to
 * guess an agency from its company name.
 *
 * Mind the parameter semantics, they are not what they look like. On the same
 * Karlsruhe search: no params 84 hits, zeitarbeit=false 64, zeitarbeit=true
 * 20, pav=false 77, pav=true 7, both false 57, both true 0. So `true` means
 * ONLY that kind, not "include" it. To see everything you omit the parameters
 * entirely. Setting both true asks for listings that are simultaneously
 * temp-work and private placement, and returns nothing - which reads as a
 * dead market rather than a bad query.
 *
 * A third of that market was intermediaries. Worth reporting, not hiding.
 */
const BASE = "https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v6/jobs";
const API_KEY = "jobboerse-jobsuche";

export function buildQuery({ was, wo, umkreis, size = 25, page = 1, agencies = "exclude", veroeffentlichtseit }) {
  const q = new URLSearchParams();
  if (was) q.set("was", was);
  if (wo) q.set("wo", wo);
  if (umkreis) q.set("umkreis", String(umkreis));
  q.set("size", String(Math.min(Number(size) || 25, 100)));
  q.set("page", String(page));
  // "exclude" -> false on both. "include" -> omit both; setting them true
  // would ask for ONLY that kind, and true+true matches nothing at all.
  if (agencies === "exclude") { q.set("zeitarbeit", "false"); q.set("pav", "false"); }
  if (veroeffentlichtseit) q.set("veroeffentlichtseit", String(veroeffentlichtseit));
  return `${BASE}?${q}`;
}

export function normalise(entry) {
  const loc = (entry.stellenlokationen || [])[0] || {};
  const ort = loc.ort || loc.adresse?.ort || "";
  // `region` arrives as an enum (BADEN_WUERTTEMBERG) and `ort` often already
  // carries the disambiguator ("Karlsruhe, Baden"), so joining them blindly
  // gives "Karlsruhe, Baden, BADEN_WUERTTEMBERG".
  const rawRegion = loc.region || loc.adresse?.region || "";
  const region = /^[A-Z_]+$/.test(rawRegion)
    ? rawRegion.split("_").map((w) => w[0] + w.slice(1).toLowerCase()).join("-")
    : rawRegion;
  const alreadyThere = region && ort.toLowerCase().includes(region.split("-")[0].toLowerCase());
  const von = entry.gehaltsspanneVon;
  const bis = entry.gehaltsspanneBis;
  return {
    title: entry.stellenangebotsTitel || entry.hauptberuf || "",
    employer: (entry.firma || "").trim(),
    location: [ort, alreadyThere ? null : region].filter(Boolean).join(", "),
    ref: entry.referenznummer || "",
    // Salary is rare on German listings; when the BA has it, it is worth more
    // than any estimate, so surface it rather than researching a range.
    salary: von ? `${Math.round(von).toLocaleString("de-DE")}–${bis ? Math.round(bis).toLocaleString("de-DE") : "?"} EUR/Jahr` : null,
    fullTime: entry.arbeitszeitVollzeit,
    contract: entry.vertragsdauer || null,
    published: entry.datumErsteVeroeffentlichung || entry.aenderungsdatum || null,
    start: entry.eintrittszeitraum || null,
    minorEmployment: entry.istGeringfuegigeBeschaeftigung || false,
    careerChanger: entry.quereinstiegGeeignet || false,
    // The BA's own detail page. Stable, and the route to the employer's ad.
    url: entry.referenznummer
      ? `https://www.arbeitsagentur.de/jobsuche/jobdetail/${encodeURIComponent(entry.referenznummer)}`
      : null,
  };
}

export function toMarkdown(jobs, meta) {
  const L = [`# Arbeitsagentur: ${meta.was || "alle"}${meta.wo ? ` in ${meta.wo}` : ""}`, "",
    `- **Source**: Bundesagentur für Arbeit Jobsuche API (v6), fetched ${meta.fetchedAt}`,
    `- **Total matches**: ${meta.total}${meta.shown < meta.total ? ` (showing ${meta.shown})` : ""}`];
  if (meta.agencies === "exclude") {
    const hidden = meta.unfilteredTotal != null ? meta.unfilteredTotal - meta.total : null;
    L.push(`- **Direct employers only.** Zeitarbeit and private placement excluded at source (\`zeitarbeit=false&pav=false\`)` +
      (hidden ? `, hiding ${hidden} of ${meta.unfilteredTotal} listings` : "") + `. Re-run with \`--include-agencies\` to see them.`);
  } else {
    L.push(`- **Agencies included.** A Zeitarbeitsfirma is the employer of record, not the workplace, and a Personalvermittler is placing you elsewhere. Label both as such - never present one as a direct role.`);
  }
  L.push("", "| Titel | Arbeitgeber | Ort | Gehalt | Veröffentlicht |", "|---|---|---|---|---|");
  for (const j of jobs) {
    const pub = j.published ? String(j.published).slice(0, 10) : "";
    L.push(`| [${j.title.replace(/\|/g, "\\|")}](${j.url}) | ${j.employer.replace(/\|/g, "\\|")} | ${j.location} | ${j.salary || "—"} | ${pub} |`);
  }
  const withPay = jobs.filter((j) => j.salary).length;
  L.push("", `${withPay} of ${jobs.length} listings state a salary. German ads usually do not, so where the BA has one, prefer it over a researched estimate.`);
  return L.join("\n") + "\n";
}

async function run(argv) {
  const flags = new Set(argv.filter((a) => a.startsWith("--")));
  const val = (name, d) => { const i = argv.indexOf(`--${name}`); return i === -1 ? d : argv[i + 1]; };
  const positional = argv.filter((a, i) => !a.startsWith("--") && !argv[i - 1]?.startsWith("--") || (!a.startsWith("--") && !["--umkreis", "--size", "--page", "--seit"].includes(argv[i - 1])));
  const was = positional[0];
  const wo = positional[1];
  if (!was) { console.error("usage: node tools/arbeitsagentur.mjs \"<was>\" [wo] [--umkreis 50] [--size 25] [--include-agencies] [--json]"); process.exit(2); }

  const agencies = flags.has("--include-agencies") || flags.has("--include-zeitarbeit") ? "include" : "exclude";
  const common = { was, wo, umkreis: val("umkreis"), veroeffentlichtseit: val("seit") };
  const url = buildQuery({ ...common, size: val("size", 25), page: val("page", 1), agencies });

  let res, data;
  try {
    res = await fetch(url, { headers: { "X-API-Key": API_KEY, Accept: "application/json" } });
  } catch (e) {
    console.error(`Could not reach the Arbeitsagentur API: ${e.message}\nFall back to the web search at https://www.arbeitsagentur.de/jobsuche/`);
    process.exit(2);
  }
  if (res.status === 403) {
    console.error("HTTP 403 from the Arbeitsagentur API.\nThe fixed client key this tool sends has changed. Open https://www.arbeitsagentur.de/jobsuche/suche in a browser, look at the X-API-Key header on the jobsuche-service request, and update API_KEY here. Until then, search the site directly - do NOT report zero results, that would read as an empty market.");
    process.exit(3);
  }
  if (!res.ok) { console.error(`HTTP ${res.status} from the Arbeitsagentur API.`); process.exit(3); }
  try { data = await res.json(); } catch { console.error("The API returned something that is not JSON."); process.exit(3); }

  const jobs = (data.ergebnisliste || []).map(normalise);

  // One cheap extra call so "57 results" is never mistaken for the whole
  // market when 27 intermediary listings were filtered out of it.
  let unfilteredTotal = null;
  if (agencies === "exclude") {
    try {
      const r = await fetch(buildQuery({ ...common, size: 1, agencies: "include" }), { headers: { "X-API-Key": API_KEY, Accept: "application/json" } });
      if (r.ok) unfilteredTotal = (await r.json()).maxErgebnisse ?? null;
    } catch { /* the headline number still stands without it */ }
  }

  const meta = {
    was, wo, total: data.maxErgebnisse ?? jobs.length, shown: jobs.length,
    agencies, unfilteredTotal, fetchedAt: new Date().toISOString().slice(0, 10),
  };
  if (flags.has("--json")) { process.stdout.write(JSON.stringify({ meta, jobs }, null, 1) + "\n"); return; }
  if (!jobs.length) {
    console.error(`No matches for "${was}"${wo ? ` in ${wo}` : ""}. Widen with --umkreis, or try a different Berufsbezeichnung - the BA indexes by official job titles, so "Softwareentwickler" finds more than "Software Engineer".`);
    process.exit(0);
  }
  process.stdout.write(toMarkdown(jobs, meta));
}

function selftest() {
  let bad = 0;
  const ok = (c, m) => { console.log(`${c ? "ok" : "FAIL"} - ${m}`); if (!c) bad++; };

  const u = new URL(buildQuery({ was: "Softwareentwickler", wo: "Karlsruhe" }));
  ok(u.pathname.includes("/pc/v6/jobs"), "uses the v6 endpoint (v4 answers 403)");
  ok(u.searchParams.get("zeitarbeit") === "false", "excludes Zeitarbeit by default");
  ok(u.searchParams.get("pav") === "false", "excludes private placement by default");
  // The trap: true means ONLY that kind, and true+true matches nothing.
  const inc = new URL(buildQuery({ was: "x", agencies: "include" }));
  ok(!inc.searchParams.has("zeitarbeit") && !inc.searchParams.has("pav"),
    "including agencies OMITS the params - setting them true would ask for only agencies, and both true returns zero");
  ok(new URL(buildQuery({ was: "x", size: 5000 })).searchParams.get("size") === "100", "clamps size to the API maximum");
  ok(new URL(buildQuery({ was: "Pflege", wo: "München", umkreis: 50 })).searchParams.get("umkreis") === "50", "passes a radius");

  const entry = {
    stellenangebotsTitel: "Embedded Softwareentwickler (m/w/d)", firma: "FERCHAU GmbH ",
    stellenlokationen: [{ ort: "Karlsruhe", region: "Baden-Württemberg" }],
    referenznummer: "12265-447544_JB5233287-S", gehaltsspanneVon: 55000.0, gehaltsspanneBis: 75000.0,
    arbeitszeitVollzeit: true, datumErsteVeroeffentlichung: "2026-08-20",
  };
  const n = normalise(entry);
  ok(n.employer === "FERCHAU GmbH", "trims the employer name");
  ok(n.location === "Karlsruhe, Baden-Württemberg", "joins Ort and Region");
  ok(normalise({ stellenlokationen: [{ ort: "Karlsruhe, Baden", region: "BADEN_WUERTTEMBERG" }] }).location === "Karlsruhe, Baden",
    "drops the region enum when the Ort already names it, no 'Karlsruhe, Baden, BADEN_WUERTTEMBERG'");
  ok(normalise({ stellenlokationen: [{ ort: "Ulm", region: "BAYERN" }] }).location === "Ulm, Bayern",
    "title-cases a region enum when it adds information");
  ok(n.salary === "55.000–75.000 EUR/Jahr", "formats the salary range in German notation");
  ok(n.url.includes("/jobsuche/jobdetail/12265-447544_JB5233287-S"), "builds a stable detail URL from the Referenznummer");
  ok(normalise({ stellenangebotsTitel: "X" }).salary === null, "no invented salary when the API has none");
  ok(normalise({ stellenlokationen: [{ adresse: { ort: "Ulm" } }] }).location === "Ulm", "reads a nested address shape");

  const md = toMarkdown([n], { was: "Softwareentwickler", wo: "Karlsruhe", total: 57, shown: 1, agencies: "exclude", unfilteredTotal: 84, fetchedAt: "2026-09-13" });
  ok(md.includes("**Total matches**: 57"), "reports the true total, not just the page");
  ok(md.includes("hiding 27 of 84 listings"), "says how many the filter hid, so 57 is not mistaken for the whole market");
  ok(md.includes("1 of 1 listings state a salary"), "reports salary coverage");
  ok(toMarkdown([n], { total: 1, shown: 1, agencies: "include", fetchedAt: "x" }).includes("employer of record"),
    "when agencies are included, says what that means for the candidate");
  ok(md.includes("[Embedded Softwareentwickler (m/w/d)]("), "links each title to its detail page");

  console.log(bad ? `\n${bad} failed` : "\nall passed");
  if (bad) process.exitCode = 1;
}

const argv = process.argv.slice(2);
if (!argv.length || argv[0] === "--help") {
  console.log('usage: node tools/arbeitsagentur.mjs "<was>" [wo] [--umkreis 50] [--size 25] [--include-agencies] [--json]');
  process.exit(argv.length ? 0 : 2);
} else if (argv[0] === "--selftest") selftest();
else await run(argv);
