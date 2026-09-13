#!/usr/bin/env node
/**
 * Verify that tools/scout-form.js finds every control on an application form -
 * above all the ones a candidate, not a tool, must answer.
 *
 *   node tools/test-scout.mjs
 *
 * Why this test exists. Scouting the fixture with `read_page(filter=
 * "interactive")` returned 8 of 15 controls. The 7 it dropped were every
 * select, both file inputs, all three Schwerbehinderung radios and the DSGVO
 * consent checkbox. A skill that scouts that way never learns the consent box
 * is on the page, so it cannot report it, and the rule "never tick a consent
 * box" holds only because nothing told it one was there. That is not a
 * safeguard, it is luck.
 *
 * Zero dependencies: node's own http server plus headless Chrome. The harness
 * page POSTs its result back to that server rather than being scraped with
 * --dump-dom, which hangs on some machines.
 */
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PORT = 8791;
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json" };

const CHROME = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
  "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium", "/usr/bin/chromium-browser",
].find((p) => existsSync(p));

let bad = 0;
const ok = (cond, msg) => { console.log(`${cond ? "ok" : "FAIL"} - ${msg}`); if (!cond) bad++; };

if (!CHROME) {
  console.log("skip - no Chrome found; cannot exercise the scout recipe");
  process.exit(0);
}

// Serve tools/ on loopback, and collect the harness's POSTed result.
// Chrome's --dump-dom hangs on some machines, so the page reports back
// rather than having its DOM scraped out of the process.
let resolveResult;
const gotResult = new Promise((r) => { resolveResult = r; });

const server = createServer((req, res) => {
  if (req.method === "POST" && req.url === "/__result") {
    let body = "";
    req.on("data", (c) => { body += c; });
    req.on("end", () => { res.writeHead(204).end(); resolveResult(body); });
    return;
  }
  const rel = normalize(decodeURIComponent(req.url.split("?")[0])).replace(/^(\.\.[/\\])+/, "");
  const file = resolve(join(HERE, rel));
  if (!file.startsWith(HERE) || !existsSync(file)) { res.writeHead(404).end("nope"); return; }
  res.writeHead(200, { "Content-Type": TYPES[extname(file)] || "application/octet-stream" });
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(PORT, "127.0.0.1", r));

const chrome = spawn(CHROME, [
  "--headless", "--disable-gpu", "--no-sandbox", "--no-first-run",
  `--user-data-dir=${join(tmpdir(), `wingman-scout-${process.pid}`)}`,
  "--virtual-time-budget=8000",
  `http://127.0.0.1:${PORT}/fixtures/scout-harness.html`,
], { stdio: "ignore" });

let raw;
try {
  raw = await Promise.race([
    gotResult,
    new Promise((_, rej) => setTimeout(() => rej(new Error("harness did not report within 60s")), 60000)),
  ]);
} catch (e) {
  chrome.kill("SIGKILL"); server.close();
  console.error(`FAIL - ${e.message}`);
  process.exit(1);
}
chrome.kill("SIGKILL");
server.close();

if (!raw || raw.startsWith("ERROR")) {
  console.error(`FAIL - harness did not run: ${String(raw).slice(0, 200)}`);
  process.exit(1);
}

const d = JSON.parse(raw);
if (d.error) { console.error(`FAIL - harness error: ${d.error}`); process.exit(1); }
const byName = Object.fromEntries(d.fields.map((f) => [f.name, f]));

// The whole point: the two things a tool must never answer are found.
ok(d.consent.length === 1 && d.consent[0].name === "privacy_consent",
  "finds the DSGVO consent checkbox that read_page omitted entirely");
ok(d.consent[0]?.required === true,
  "sees that the consent box is required, from the label rather than the attribute");
ok(d.consent[0]?.anyChecked === false, "consent starts unticked");
ok(d.voluntary.length === 1 && d.voluntary[0].name === "disability",
  "finds the Schwerbehinderung group that read_page omitted entirely");
ok(d.voluntary[0]?.anyChecked === false, "Schwerbehinderung starts unanswered");

// Required-ness lives in the label. Trusting the DOM reads the form as optional.
ok(d.counts.requiredByAttribute === 0, "no field carries the DOM required attribute, as on real Personio");
ok(d.counts.requiredByLabel >= 5, `label text marks the required fields (${d.counts.requiredByLabel} found)`);
ok(byName["email"]?.requiredByLabel === true, "E-Mail is required by label");
ok(byName["custom_attribute_pay_band"]?.requiredByLabel === true, "Entgeltgruppe is required by label");

// Controls read_page dropped.
ok(byName["custom_attribute_pay_band"]?.options?.length === 5, "enumerates select options");
ok(d.uploads.length === 2 && d.uploads.every((u) => u.multiple),
  "finds both upload fields and that each takes multiple files");
ok(byName["documents.cv"] && byName["documents.other"], "uploads are separate cv and other fields, not one resume slot");

// Labels must not be truncated: German marks required with a trailing suffix.
ok(byName["available_from"]?.label === "Verfügbar ab* (erforderlich)",
  "labels the date field from its label, not its TT.MM.JJJJ placeholder");

// The button that must never be clicked is identified as such.
ok(d.submitLike.includes("Bewerbung senden"), "flags 'Bewerbung senden' as a submit-like button");

ok(d.counts.total >= 13, `inventory covers the whole form (${d.counts.total} controls vs 8 from read_page)`);

console.log(bad ? `\n${bad} failed` : "\nall passed");
process.exit(bad ? 1 : 0);
