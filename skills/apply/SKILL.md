---
name: apply
description: Fill a German application form - Personio, softgarden, Greenhouse, Lever, Workday, Interamt
argument-hint: "job URL, 'last' for the most recent job, or 'current' for the open browser tab"
---

# Apply

> ATS patterns: `shared/references/ats.md` · Interaction: `shared/references/interaction.md` · Work auth: `shared/references/work-authorization.md`

Fills application forms. **Never submits.** The user takes the last step, every time.

## Step 0: Prerequisites

CV required. Load `application-data.md` if it exists (created in Step 2). Load `profile.md` for the German fields — Gehaltsvorstellung, Kündigungsfrist, Arbeitserlaubnis.

## Step 1: Target job

- **URL** → match against `DATA_DIR/jobs/`; load `posting.md`, `evaluation.md`, `language.md`, the CV and letter. No match → fetch the posting and create the folder.
- **`last`** → most recently modified job folder; confirm which job.
- **`current`** → use the active tab as-is; match its URL against saved folders for context.

If there is no `evaluation.md`, run `/wingman:evaluate` first. Filling a form for an unscored job means the user may be applying to something a 30-second check would have ruled out.

## Step 2: Application data

If `application-data.md` exists, load it. Otherwise extract what you can from the CV and profile, present it for confirmation, and save:

```markdown
# Application Data

## Persönliche Daten
- Vorname / Nachname / E-Mail / Telefon
- Straße und Hausnummer / PLZ / Wohnort
- Land: Deutschland

## Profile
- LinkedIn / Xing / GitHub / Portfolio

## Standardantworten
- Wie haben Sie von uns erfahren: [board actually used]
- Bereits bei uns beworben: Nein
- Gehaltsvorstellung: [X].000 EUR brutto p. a.
- Kündigungsfrist: [from profile]
- Frühestmöglicher Eintrittstermin: [computed]
- Arbeitserlaubnis erforderlich: [from work-authorization.md — NOT US sponsorship logic]
- Aufenthaltstitel: [permit type, if held]

## Freiwillige Angaben
- Schwerbehinderung: keine Angabe
```

**No US EEO block.** German forms do not carry voluntary race/ethnicity self-identification, and importing those defaults into a German application is wrong. `Schwerbehinderung` is voluntary and the candidate's disclosure to make — default to no answer unless they said otherwise.

## Step 3: Navigate and scout

Browser setup per `shared/references/web-extraction.md`. Detect the ATS from the URL per `shared/references/ats.md`.

- **Personio** (`*.jobs.personio.de/.com`) — native single page expected. **Multiple upload fields** for Lebenslauf, Anschreiben and Zeugnisse; build the whole attachment set. DSGVO consent is tenant-dependent: a checkbox on some, implicit-on-submit on others (SMIGHT) — either way the candidate's action.
- **softgarden** (`*.softgarden.io`) — native. Quick-apply via LinkedIn/Xing also offered.
- **Lever** (`jobs.lever.co`) — append `/apply`. Most automation-friendly.
- **Greenhouse** — extract the iframe tokens, then navigate to the direct form URL (see the reference).
- **Workday / SAP SuccessFactors** — account required. **Tell the user to sign in themselves**, then continue. Account creation is not something this tool does.
- **Interamt** — account required, same handling. Expect the full Mappe plus Tarif and Schwerbehinderung fields.
- **Unknown** — navigate, screenshot, identify. If unrecognizable, say so and ask.

**Scout before filling.** `read_page(filter="interactive")` (scroll through for Workday). Determine: which upload fields exist, whether a cover letter is wanted, whether a DSGVO checkbox is present, and any unusual required field. The German ATS notes in the reference are **structural, not element-level** — never assume a ref from the file.

## Step 4: Generate what the form needs

- **CV** — always. Exists in the folder? Use it. Otherwise run the `tailor-cv` workflow inline and show it before continuing.
- **Anschreiben / cover letter** — only if the form has a field for it. Then the `anschreiben` workflow inline.
- **Zeugnisse** — if the form accepts attachments, use the audited set. Unaudited Zeugnis → say so and offer `/wingman:zeugnis` before it goes out.

## Step 5: Propose everything at once

Scan every field, then present **one** consolidated plan — never field-by-field questions:

```
Plan for the [Company] application ([ATS]):

From your data:
  Vorname: …   Nachname: …   E-Mail: …   Telefon: …
  PLZ / Wohnort: …

German fields:
  Gehaltsvorstellung: 75.000 EUR brutto p. a.
  Eintrittstermin: 01.07.2026  (today + your 3-month Kündigungsfrist)
  Arbeitserlaubnis erforderlich: Nein — Blaue Karte EU held
  Wie haben Sie von uns erfahren: StepStone

Needs your decision:
  DSGVO-Einwilligung — required to submit. This is your consent to their
  data processing; I will not tick it for you.
  Schwerbehinderung — voluntary. Currently: keine Angabe.

Manual upload (I cannot upload non-image files):
  Lebenslauf:    [path]
  Anschreiben:   [path]
  Zeugnisse:     [paths]

Approve, or tell me what to change.
```

Ask once, fill once. Cache new answers under a `Custom Answers` section in `application-data.md` so the next application reuses them.

## Step 6: Fill

After approval, fill in one pass via `scripts/fill-page.md`.

**Never tick the DSGVO consent checkbox on the user's behalf**, even with general approval of the plan — it is a specific consent action and needs its own yes. Same for any terms or arbitration checkbox.

**File uploads**: the browser tools can only upload images, so PDF and DOCX uploads are the user's to do. Give the exact paths in Step 5 so they can upload while reviewing.

Multi-page forms (Workday, SuccessFactors, Interamt): fill, click *Save and Continue*, read validation errors, fix, advance. Never click a final submit.

## Step 7: Review, then stop

Screenshot the completed form. Walk through what is filled and what is still missing. Then **stop and ask for explicit confirmation.**

**Wingman does not click Submit, Send, Absenden, „Bewerbung senden", or „Bewerbung abschicken".** Not with prior approval, not when the user says "just do it", not when the form looks obviously complete. Drafting is reversible; submitting is not. The user clicks.

## Step 8: Log

Write `applied.md` in the job folder: date, ATS, language, status (`Submitted` / `Draft`), what was attached, anything left manual. Update `tracker.md` per `shared/references/tracker.md` with the status and a follow-up date using the German timing table.

---

## Response Format

1. **Status** — what was filled, what needs manual upload, whether submitted
2. **Files** — paths written
3. **Next** — follow-up date, or the next job

## Permissions

```json
{ "permissions": { "allow": [
  "Read(~/.wingman/**)", "Write(~/.wingman/**)", "Edit(~/.wingman/**)",
  "mcp__claude-in-chrome__*"
] } }
```
