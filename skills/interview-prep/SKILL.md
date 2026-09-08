---
name: interview-prep
description: Prepare for a German Vorstellungsgespräch - in the language the interview will actually be in
argument-hint: "job URL, or 'last' for the most recent job"
---

# Interview Prep

> Language: `shared/references/language-decision.md` · Market terms: `shared/references/de-market.md`

## Step 0: Which language will the interview be in?

Read `language.md`. **This is the first thing to establish**, and the answer changes the whole session.

If the application went out in German, expect at least part of the interview in German — and if a level gap was flagged during the application, **say so now, directly**: the phone screen is where an overstated CEFR level surfaces. Better to rehearse in German and be ready than to be surprised.

Offer to run the practice in German, in English, or mixed — recommending whichever matches `language.md`.

## Step 1: Load context

`posting.md`, `evaluation.md`, `profile.md`, the tailored CV and letter. Block H of the evaluation already contains the strategy if the score was 4.0+.

## Step 2: What a German interview actually contains

Different from a US loop in ways worth preparing for:

| Element | Notes |
|---|---|
| **Selbstpräsentation** | Almost always opens with „Erzählen Sie etwas über sich" — expect to talk for 2–3 minutes, structured, chronological. Germans expect a career narrative, not a highlight reel. Rehearse this one properly; it sets the tone. |
| **Formal register** | `Sie` unless the company clearly runs on `du`. Titles used (`Herr Dr.`). |
| **Punctuality** | Being 5–10 minutes early is expected, not optional. Late is close to disqualifying. |
| **Lückenlose Chronologie** | Expect direct questions about every gap. Use the wording stored in `profile.md`, so it matches the CV exactly. |
| **Gehaltsvorstellung** | Asked directly and early, often in the first call. Jahresbrutto. Have the number and the justification ready. |
| **Kündigungsfrist / Eintrittstermin** | Asked in the first call. Know the real date. |
| **Rückfragen** | You are expected to have questions. Having none reads as disinterest. |
| **Assessment Center / Probearbeitstag** | Common at corporates and in some trades. Ask the recruiter which format to expect. |
| **Fachfragen** | Technical depth, often more detailed and less puzzle-oriented than US interviews. |

## Step 3: STAR stories

Build 5–8 stories from `profile.md` covering conflict, failure, leadership, a technical decision, delivery under pressure, and cross-team work. Each: Situation, Task, Action, Result, **plus Reflection** — what they would do differently. German interviewers respond well to the reflection; it reads as self-awareness rather than polish.

Every story must be sourced from the profile. **Never invent one**, and never inflate a result beyond what the CV supports — this is the moment those get checked.

If the interview is in German, draft the stories in German. A story rehearsed in English and delivered in German comes out as translation.

## Step 4: Questions to expect, and to ask

Predict 8–12 likely questions from the posting and the candidate's gaps. For each: the answer's spine, not a script. Include the awkward ones — the gap, the short tenure, the missing requirement, the language level.

Then draft Rückfragen worth asking: team structure, why the position is open, what success looks like at six months, Betriebsrat, Überstundenkultur, remote policy in practice rather than on paper.

## Step 5: Practice (interactive)

Offer a practice run with `AskUserQuestion`: full mock, Selbstpräsentation only, salary negotiation only, or just review the notes.

Run it turn by turn in the interview's language. Give feedback after each answer — specific and usable, not encouragement. Flag anything that overstates what the CV supports, immediately.

## Step 6: Save

Write `DATA_DIR/jobs/[folder]/interview-prep.md`. Append reusable STAR stories to a story bank in `profile.md` so they compound across applications instead of being rewritten each time.

Update the tracker status to `Gespräch`.

---

## Response Format

1. **Format** — language, expected structure, what to prepare
2. **Your Stories** — the STAR+R set, mapped to likely questions
3. **Expect to be Asked** — with answer spines, including the awkward ones
4. **Ask Them** — your Rückfragen
5. **Practice** — offer the mock

## Permissions

```json
{ "permissions": { "allow": [
  "Read(~/.wingman/**)", "Write(~/.wingman/**)", "Edit(~/.wingman/**)",
  "mcp__claude-in-chrome__*"
] } }
```
