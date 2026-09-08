---
name: zeugnis
description: Decode an Arbeitszeugnis - what grade it actually gives you, and what to do about it
argument-hint: "file path, pasted Zeugnis text, or 'all' to audit everything in zeugnisse/"
---

# Arbeitszeugnis Audit

> Decoding tables: `shared/references/zeugnis-code.md`

A German employment reference must be both truthful and benevolent (§109 GewO). Those duties conflict, so German employers grade you in code. Every HR person in Germany reads it. Most candidates never have.

**No other job tool does this.** It is also the highest-leverage thing in this repo: a candidate can be sending out a hidden grade 4 with every application and never know.

## Arguments

- **file path** — audit one document
- **pasted text** — audit it directly
- **`all`** — audit everything in `DATA_DIR/zeugnisse/` (default when no argument)

## Step 1: Read

Read the document. For a scanned PDF or image, extract the text — if OCR is unavailable, ask the user to paste the Leistung sentence, the Verhalten sentence, and the closing paragraph, since those three carry nearly all the signal.

Confirm which document and employer you are looking at before grading.

## Step 2: Grade

Per `shared/references/zeugnis-code.md`:

1. **Leistung** — locate the Zufriedenheit sentence. Match the wording exactly: `stets` present or absent, `vollsten` or `vollen`. Both → grade 1. Neither → grade 3 or worse.
2. **Verhalten** — check **who is named**. Both Vorgesetzte and Kollegen → fine. Kollegen only → reads as friction with management. Sentence missing entirely → the loudest signal of all.
3. **Schlussformel** — thanks, `bedauern`, good wishes. Missing `bedauern` is cool; no closing formula at all is deliberate.
4. **Coded phrases** — scan for the ones that mean their opposite (`Geselligkeit`, `Verständnis für seine Arbeit`, `Pünktlichkeit war vorbildlich`).
5. **Type** — einfaches or qualifiziertes Zeugnis. Only einfaches after a multi-year role is itself a signal.

## Step 3: Report with evidence

Always quote the wording. A bare verdict is not actionable, and the candidate needs the exact sentence if they ask for a correction:

```
[Employer], [dates] — qualifiziertes Zeugnis

Leistung   Grade 3 (befriedigend)
           "…zu unserer vollen Zufriedenheit erledigt"
           -> "vollen" not "vollsten", no "stets". Two bands below top.

Verhalten  Concern
           "Sein Verhalten gegenüber Kollegen war einwandfrei."
           -> Vorgesetzte not mentioned. Read as friction with management.

Schluss    Cool
           Good wishes present; no thanks, no "bedauern".

Overall    This document works against you.
```

## Step 4: Options (interactive)

Never decide for the candidate — this concerns their relationship with a former employer. `AskUserQuestion`:

1. **Request a correction.** They have a right under §109 GewO to a truthful and benevolent reference. Offer to draft a polite, specific request naming the exact wording to change.
2. **Attach it anyway.** Grade 3 is common and not disqualifying. Frame it honestly: it will not help, and it will not sink an otherwise strong application.
3. **Omit it** and write `Zeugnisse werden auf Wunsch nachgereicht` in the Anlagen line. Note that a missing Zeugnis for a recent role invites a question.

Add, plainly: *I am not a lawyer. A Fachanwalt für Arbeitsrecht or your union handles contested corrections routinely and cheaply.*

**Never rewrite or alter the Zeugnis.** It is a third party's signed document; producing an edited version would be forgery. Decline that and say why — audit and advise instead.

## Step 5: Mine it for evidence

Zeugnisse list responsibilities and results in an employer's own words, and candidates routinely forget half of it. Extract anything that belongs on the CV — projects, scope, systems, team size, quantified outcomes — and ask before adding it to `profile.md`.

This is often the single richest untapped source of CV material the candidate already has.

## Step 6: Save

Write `DATA_DIR/zeugnisse/audit.md` with one entry per document: employer, dates, grades, quoted evidence, decision taken. Update the Zeugnisse table in `profile.md` with each grade.

`/wingman:mappe` reads this and refuses to assemble an unaudited Zeugnis.

---

## Response Format

1. **Grades** — Leistung, Verhalten, Schluss, each with the quoted wording
2. **Verdict** — what this document does to an application
3. **Options** — correction / attach / omit, with the tradeoff of each
4. **CV Material** — anything worth adding to the profile

## Permissions

```json
{ "permissions": { "allow": [
  "Read(~/.wingman/**)", "Write(~/.wingman/**)", "Edit(~/.wingman/**)"
] } }
```
