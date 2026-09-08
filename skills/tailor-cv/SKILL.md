---
name: tailor-cv
description: Tailor your CV for a job - a tabellarischer Lebenslauf in German, or a CV in English
argument-hint: "job URL, or 'last' for the most recent job"
---

# Tailor CV

> Documents: `shared/references/de-documents.md` · Language: `shared/references/language-decision.md` · Templates: `shared/templates/lebenslauf.md`

Produces a **tabellarischer Lebenslauf** or an **English CV**, depending on `language.md`. These are genuinely different documents — not translations of each other.

| | Lebenslauf (DE) | CV (EN) |
|---|---|---|
| Structure | Tabular, dates against content | Narrative bullets |
| Summary section | **None** | Yes, 2–3 sentences |
| Grades | Included (`Abschlussnote: 1,3`) | Omitted |
| Language levels | Required, CEFR | Optional |
| Photo | Per profile preference | No |
| Gaps | Labelled explicitly | Usually glossed |
| References | Zeugnisse attached | "Available on request" |
| Signature | Ort, Datum, Unterschrift | None |

## Step 0: Prerequisites

Per `shared/references/prerequisites.md`: CV and **profile both required**. Without a profile there is nothing to write from but the CV text, and the result is thin and full of guesses that the user then corrects for the next twenty applications. Say that and run `/paperwork:setup interview` instead.

## Step 1: Job and language

Get the posting (`$ARGUMENTS` URL, `last`, or ask). If no `evaluation.md` exists, run `/paperwork:evaluate` first — tailoring against an unscored posting means tailoring toward requirements nobody checked.

Read `language.md`. If it does not exist, run the language decision now. **Never guess the language**, and never default to English because it is easier.

## Step 2: Match analysis

Before writing:

1. **Level** — is this the candidate's level, a stretch, or a step down? Frame accordingly.
2. **Requirement mapping** — for each requirement, the strongest *sourced* evidence from the profile. Direct, analogous, or transferable — and label which.
3. **Gaps** — where there is no match, find genuinely adjacent experience. **Never invent one.**
4. **Keywords** — the posting's own terminology, to mirror where it is honest.

## Step 3a: Lebenslauf (German)

Follow `shared/templates/lebenslauf.md` exactly.

- **Persönliche Daten** — from profile. Photo, Geburtsdatum, Staatsangehörigkeit only per the stored preferences. **Never Familienstand, never religion.**
- **Berufserfahrung** — reverse chronological, `MM/JJJJ` format. Bullets reordered so the two most relevant to *this* posting come first. 2–5 per role, fewer for older roles.
- **Ausbildung** — include the grade. Add the German equivalent of a foreign degree if anabin gives one.
- **Kenntnisse** — Sprachen with CEFR **exactly as recorded in the profile**, then technical skills ordered by what the ad asks for.
- **Lücken** — labelled with the stored explanation, verbatim, so it never contradicts another document.
- **Ort, Datum, Unterschrift** — include for conservative employers, omit for startups.

**German writing rules:** natural Tech-Deutsch, never translated-sounding. Short sentences, active verbs, avoid Passiv. Keep established technical terms in English — Stack, Deployment, Pipeline, Embedding. No em dashes.

Save as `resume-de.md`.

## Step 3b: CV (English)

Standard tailored CV: 2–3 sentence summary positioned for this role, experience with bullets reordered and rewritten, skills led by what the job asks for.

Save as `resume-en.md`.

## Step 4: Writing quality (mandatory, before showing anything)

Go line by line. This pass is not optional — it is where the output stops sounding like a language model.

- **One idea per bullet.** More than one comma-joined clause → split it.
- **No filler**: "demonstrating ability to", "showcasing expertise in", "leveraging", "utilizing", "spanning", "with a track record of".
- **No stacked adjectives**: "cross-functional, data-driven, customer-centric" → pick the one that matters and give evidence.
- **No compound noun piles**: "AI-driven product opportunity identification" → say what you did.
- **No em dashes** anywhere.
- **No preamble clauses**: "Leveraging deep expertise in X, led..." → "Led...".
- **Vary the structure.** Not every bullet the same shape.
- Any bullet over two lines is doing too much. Split it.

Read the first three bullets aloud. If a sentence takes more than one breath, shorten it.

## Step 5: Accuracy (non-negotiable)

- Only what is in `resume/` or `profile.md`. Nothing else.
- **Never inflate the language level.** It is checked in the first phone call.
- Never assume business model, company stage, or revenue type unless stated.
- Never widen scope: "revenue targets" is not "P&L ownership".
- Never add a cross-functional partner, tool, or responsibility that is not documented.
- **Never change titles, dates, or employers.** Never close a gap by moving a date.
- Ambiguous → conservative wording, or omit.

Reframing means reordering and rewording what exists. It never means adding what does not.

## Step 6: Present

Save to the job folder. Show the document plus:

```
[Lebenslauf / CV] for [Role] at [Company] — in [Deutsch / English]

Why this language: [one line from language.md]

Changes:
- [what was reordered and why]
- [what was added from your profile that wasn't on the original CV]
- [what was cut as irrelevant to this role]

Gaps I could not cover: [requirement] — [what adjacent evidence was used instead]
```

Naming the uncovered gaps matters more than hiding them: it is what the interview will ask about.

## Step 7: Iterate

Offer adjustments with `AskUserQuestion` — emphasis, tone, length, specific bullets.

**Every factual correction goes into `profile.md` immediately.** That is what stops the same mistake recurring on the next twenty applications.

---

## Response Format

1. **Document** — the full CV or Lebenslauf
2. **Tailoring Notes** — changes, and the uncovered gaps
3. **What's Next** — `/paperwork:anschreiben` for the letter

## Permissions

```json
{ "permissions": { "allow": [
  "Read(~/.paperwork/**)", "Write(~/.paperwork/**)", "Edit(~/.paperwork/**)",
  "mcp__claude-in-chrome__*"
] } }
```
