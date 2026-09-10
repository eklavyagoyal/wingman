---
name: mappe
description: Assemble a Bewerbungsmappe - Anschreiben, Lebenslauf and Zeugnisse as one correctly ordered PDF
argument-hint: "job URL, or 'last' for the most recent job"
---

# Bewerbungsmappe

> Assembly rules: `shared/references/de-documents.md` · Zeugnis audit: `shared/references/zeugnis-code.md`

German employers frequently want **one PDF containing the whole application**, in a fixed order. Sending three loose files when the portal asked for a Bewerbungsmappe is a real, avoidable mistake — and no other tool does this.

## Step 0: Check what exists

In the job folder: `anschreiben-de.md` or `cover-letter-en.md`, `resume-de.md` or `resume-en.md`, and `language.md`. Missing documents → offer to generate them first rather than assembling a partial Mappe.

In `DATA_DIR/zeugnisse/`: the attachment set.

## Step 1: Audit the Zeugnisse first

**Do not assemble an unaudited Arbeitszeugnis into a Mappe.** A politely-worded reference can carry a grade of 4 or a conduct red flag in code, and attaching one unread is a self-inflicted wound.

Check `zeugnisse/audit.md`. For anything unaudited, run `/wingman:zeugnis` now.

If an audit found a problem, ask with `AskUserQuestion` before including it:
- **Request a correction** from the former employer (§109 GewO)
- **Include it anyway** — grade 3 is common and not disqualifying
- **Omit it** and write `Zeugnisse werden auf Wunsch nachgereicht`

## Step 2: Order

Fixed. Do not improvise:

1. **Deckblatt** (optional — position, name, contact, photo if the profile says yes)
2. **Anschreiben**
3. **Lebenslauf**
4. **Motivationsschreiben** — only if explicitly requested; rare outside academia
5. **Arbeitszeugnisse** — newest first
6. **Abschlusszeugnisse**, then relevant Zertifikate

Ask whether to include a Deckblatt. Recommend one for Mittelstand and public sector, against for startups and international tech.

## Step 3: Build

Run the renderer:

```bash
node "${CLAUDE_PLUGIN_ROOT}/tools/mappe.mjs" DATA_DIR/jobs/[folder]            # language from language.md
node "${CLAUDE_PLUGIN_ROOT}/tools/mappe.mjs" DATA_DIR/jobs/[folder] --lang de  # override
```

The renderer ships inside the plugin, not in the user's project — `${CLAUDE_PLUGIN_ROOT}` is where Claude Code installed it (a versioned cache copy). Never run the renderer by a bare repo-relative path; from the user's working directory `tools/mappe.mjs` does not exist.

It reads the **`Application language` line** of `language.md` to pick the German or English document set — not the whole file, because the Evidence block there legitimately names the ad's language, which is often German for an application deliberately made in English. If that decision was **Both**, it builds both and names them `bewerbungsmappe-de.pdf` and `bewerbungsmappe-en.pdf`. It renders the
Anschreiben and Lebenslauf to A4 with DIN 5008 margins via headless Chrome,
appends any Zeugnis PDFs from `DATA_DIR/zeugnisse/` newest-first, and prints
every check it ran.

**What it handles**: A4 geometry, DIN 5008 margins, right-aligned Ort/Datum in
the letter, signature space after the Grußformel, the two-column tabular
Lebenslauf layout, page-count and file-size verification.

**What it does not handle**: it cannot know which paragraph is your Betreff.
Content order — Betreff, Anrede, the lowercase first word, Anlagen — comes from
the `anschreiben` skill and the template. The renderer only lays out what you
wrote.

**If it reports a FAIL**, fix the document and re-run. Do not hand over a Mappe
with a two-page Anschreiben because the tool technically produced a file.

**If it exits saying no Chrome was found**, say so plainly, and give the user
the individual documents plus the assembly order from Step 2. Do not install
anything without asking.

**If Zeugnis PDFs could not be appended** (no `pdfunite` or `qpdf`), the tool
says so and still produces the letter and CV. Pass that warning on — never
present a Mappe as complete when the attachments are missing.

Verify the renderer itself with `node "${CLAUDE_PLUGIN_ROOT}/tools/mappe.mjs" --selftest`.

## Step 4: Name and check

**File name**: `Bewerbung_[Nachname]_[Vorname]_[Position].pdf` — never `resume_final_v3.pdf`. The renderer writes `bewerbungsmappe.pdf` as the folder's canonical file; **copy** it to the hand-off name for the upload rather than renaming, so the folder stays predictable.

The renderer checks page counts, file size, and attachment merging, and prints
each result. Pass its output through verbatim rather than summarising it away.

Then check the things a tool cannot see:

- [ ] Every Zeugnis scan is legible and the right way up
- [ ] Page order matches Step 2
- [ ] Betreff shows the exact advertised job title, including `(m/w/d)` and the Kennziffer
- [ ] No placeholder text survived (`[Firma]`, `[Datum]`, `TODO`)
- [ ] The name in the file name matches the name in the documents

If any check fails, say which — never hand over a Mappe with a silent problem.

## Step 5: Hand off

```
Bewerbungsmappe_[Name]_[Position].pdf — [n] pages, [x.x] MB

  1     Deckblatt
  2     Anschreiben
  3–4   Lebenslauf
  5–7   Arbeitszeugnisse (2)
  8     Abschlusszeugnis

Saved: DATA_DIR/jobs/[folder]/bewerbungsmappe.pdf
```

For an email application, also draft the covering email: subject line = the Betreff (`Bewerbung als [Titel], Kennziffer [X]`), body three or four polite sentences pointing at the attachment. **The real letter is the attached Anschreiben, not the email body.**

**Never send it.** Draft only. The user attaches and sends.

---

## Response Format

1. **Mappe** — path, page count, size, contents listing
2. **Checks** — each verification and its result
3. **What's Next** — `/wingman:apply` for a portal, or the drafted email for a direct application

## Permissions

```json
{ "permissions": { "allow": [
  "Read(~/.wingman/**)", "Write(~/.wingman/**)", "Edit(~/.wingman/**)",
  "Bash(node *mappe.mjs *)", "Bash(pdfunite *)", "Bash(qpdf *)"
] } }
```
