---
name: setup
description: One-time onboarding - CV, preferences, German level, work authorization, and a work history interview
argument-hint: "'interview' for just the work history interview, 'german' for just the German-specific facts"
---

# Setup

> Priority hierarchy: `shared/references/priority-hierarchy.md` · Interaction rules: `shared/references/interaction.md`

Onboarding. Runs once, then every other skill has what it needs. Resolve the data directory per `shared/references/data-directory.md`; if none exists, this is a fresh install — create it.

**Tell the user up front how many steps there are**, so they know what they signed up for. Skip every step whose data already exists — never re-ask.

## Arguments

- (none) — full onboarding, only the missing parts
- `interview` — just the work history interview
- `german` — just the German-specific facts (Step 3), for someone who has a CV and preferences already

---

## Step 0: What is already done

Check for real content (not templates) in: `resume/`, `preferences.md`, `profile.md`, `contacts.csv`, and whether `profile.md` has a filled **German Application Facts** section.

Report what exists, then run only what is missing.

## Step 1: CV

Ask for the CV. Accept a file path (copy into `DATA_DIR/resume/`) or pasted text (save as `DATA_DIR/resume/resume.md`).

Confirm and summarize what you read: name, most recent role, number of roles, apparent seniority, and **any gap over three months** — flag those now, because Step 3 needs an explanation for each.

## Step 2: Preferences

One open question: target roles, locations, salary, and what to rule out. Save to `DATA_DIR/preferences.md` with sections for Target Roles, Standort, Vergütung, Must-Haves, Dealbreakers, Nice-to-Haves.

Then confirm the German-market dealbreakers explicitly with `AskUserQuestion`, because they are not obvious to someone new to the market:

- **Zeitarbeit / Arbeitnehmerüberlassung** — acceptable or dealbreaker? Explain what it is first: you are employed by an agency and leased to a client, usually at lower pay. Default: dealbreaker.
- **Öffentlicher Dienst** — interested? Explain the tradeoff: TVöD pay bands are fixed and often below private tech, but the security, hours, and pension are materially better. German-only applications.
- **Befristete Verträge** — acceptable, or permanent only?

## Step 3: German Application Facts

**This is the step no other tool has, and everything downstream depends on it.** Fill the German Application Facts section of `profile.md` from `shared/templates/profile.md`.

### 3a — Sprachen

Ask for German and English levels in CEFR. If the user is unsure of their German, give them the anchors rather than making them guess blind:

| Level | You can... |
|---|---|
| A2 | order food, handle simple routine exchanges |
| B1 | hold an everyday conversation, follow a slow meeting |
| B2 | work in German with effort, follow meetings, still hunting for words |
| C1 | work in German comfortably, argue a position, handle a phone interview |
| C2 | near-native |

Then say plainly why it matters: **this number decides whether Paperwork writes your applications in German**, and an inflated answer produces a letter you cannot back up in a phone screen. Store the honest level.

### 3b — Arbeitserlaubnis

Ask for status per `shared/references/work-authorization.md`. If non-EU:
- Which permit, valid until when
- Whether an employer change needs approval
- **For a non-EU degree: check anabin now.** Offer to look it up. Finding a recognition problem today is cheap; finding it against a deadline is not.

### 3c — Verfügbarkeit und Vergütung

Kündigungsfrist, computed earliest start date, Gehaltsvorstellung and floor in **Jahresbrutto**, and current package components (base, 13th month, bonus, bAV, VWL) so offers can be compared properly later. Reference `shared/references/de-market.md`.

If the user does not know their market rate, offer to research it for their title and region rather than letting them name a number blind.

### 3d — Bewerbungspräferenzen

`AskUserQuestion`, once, stored forever:

- **Foto im Lebenslauf?** Give the real tradeoff: expected at Mittelstand and public sector, neutral at corporates, often discouraged at startups and international tech. Legally never required (AGG). No professional photo available → recommend omitting.
- **Geburtsdatum und Staatsangehörigkeit angeben?** Optional, increasingly omitted. Recommend omitting unless applying mainly to traditional employers.
- **Default application language** — Deutsch / Englisch / decide per posting. Recommend per posting.

### 3e — Zeugnisse

Ask what they have. Copy files into `DATA_DIR/zeugnisse/`. Explain that German employers expect Arbeitszeugnisse attached, and that **a politely-worded Zeugnis can say something damaging in code** — offer to audit each one now with `/paperwork:zeugnis`. Most candidates have never had this done and it changes what they attach.

### 3f — Lücken

For every gap found in Step 1, get a truthful explanation and record it. Same wording gets reused in every document, so it never contradicts itself.

## Step 4: Contacts (optional)

Offer LinkedIn and Xing exports for `/paperwork:network-scan`.

> **LinkedIn**: linkedin.com/mypreferences/d/download-my-data → Connections → they email a ZIP → `Connections.csv`
> **Xing**: Xing has restricted bulk export; if unavailable, skip it — LinkedIn alone is enough for most searches.

Save as `DATA_DIR/contacts.csv`. Skipping is fine.

## Step 5: Work history interview

Follow `scripts/conduct-interview.md`. Most recent role first, more depth on recent and relevant roles.

Beyond the standard questions, capture the German-specific material:
- **Quantified results** — needed for both Lebenslauf bullets and Anschreiben evidence
- **Why each role ended** — Germany asks directly, and it must match the Zeugnisse
- **Any German-language working experience**, even partial. Real evidence of working German is worth more than a CEFR label.

Save to `DATA_DIR/profile.md`, preserving the German Application Facts section.

## Step 6: Summary

Report what is configured, then what they can run:

```
Ready.

CV:              [filename]
Preferences:     [target roles, key dealbreakers]
Deutsch:         [level]  -> applications default to [DE/EN/per posting]
Arbeitserlaubnis: [status] [+ anabin result]
Kündigungsfrist: [x] -> earliest start [date]
Gehaltsvorstellung: [x] EUR brutto p. a.
Foto:            [ja/nein]
Zeugnisse:       [n] files [, m audited]
Profile:         [n] roles
Contacts:        [n] imported / skipped

Next:
  /paperwork:job-search              find German jobs
  /paperwork:evaluate <url>          score one posting
  /paperwork:zeugnis                 decode your Arbeitszeugnisse
  /paperwork:visa                    check Blue Card / recognition
```

---

## Response Format

1. **Setup Summary** — what was configured
2. **What's Next** — the skills now available

## Permissions

```json
{ "permissions": { "allow": [
  "Read(~/.paperwork/**)", "Write(~/.paperwork/**)", "Edit(~/.paperwork/**)"
] } }
```
