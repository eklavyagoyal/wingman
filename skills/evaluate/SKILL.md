---
name: evaluate
description: Score one German job posting into a structured A-H report with a 1-5 fit score
argument-hint: "job URL, pasted job text, or 'last'"
---

# Evaluate

> Scoring rules: `shared/references/evaluation.md` · Priority hierarchy: `shared/references/priority-hierarchy.md`

Turns one posting into a decision: apply, skip, or a question for the user. Replaces High/Medium/Low with a 1–5 score, because "Medium" does not tell anyone whether to spend an evening.

## Step 0: Prerequisites

Per `shared/references/prerequisites.md`: CV **and profile both required**. Scoring a role against an unknown candidate produces a number that means nothing — if there is no profile, say so and run `/wingman:setup interview` instead.

## Step 1: Get the posting

- **URL** → `node "${CLAUDE_PLUGIN_ROOT}/tools/posting.mjs" <url>` first. It reads the JSON-LD that Personio and softgarden both publish, and it exits `3` rather than hand you a page that returned HTTP 200 with no job in it. Only if it exits `3` for "no structured data" do you fall back to a scoped selector per `shared/references/web-extraction.md`. Never `get_page_text`.
- **Pasted text** → use it directly.
- **`last`** → the most recently modified job folder.

If the page cannot be read, **stop and ask the user to paste it.** Never evaluate from a job title alone, and never fill gaps by guessing what an employer probably wants.

If the extractor reports the posting **expired or closed**, say so plainly and stop — that is a finished answer, not a setback. Offer to look for the role on the employer's current vacancies page. Any `WARN` it prints (a `validThrough` in the past, a posting open for many months) goes into **Block G**, where it is reported and left score-neutral.

Save to `DATA_DIR/jobs/[company-slug]-[date]/posting.md`, employer URL at the top.

## Step 2: Language decision

Run `shared/references/language-decision.md` and write `language.md`. Do this **before** any document work, because it changes every downstream artifact. If `language.md` already exists, use it silently.

## Step 3: Build the report

Write blocks A–H per `shared/references/evaluation.md`:

- **A Role** — title exactly as advertised, employer type, contract, Tarif band, Kennziffer, location, remote policy
- **B Requirement match** — one row per requirement, each marked `quoted` / `inferred` / `gap`. **Never write a row you cannot source.**
- **C Language** — the decision and any level gap
- **D Work authorization** — per `work-authorization.md`, and do not flag a permit holder as blocked by a "no sponsorship" line
- **E Compensation** — Jahresbrutto including the 13th month, Urlaub, bAV/VWL, versus researched market rate. Name sources and the date.
- **F Employer signal** — kununu rating and what reviews actually say, Betriebsrat, Zeitarbeit detection, Impressum, culture tells from the ad
- **G Legitimacy** — ghost job, repost, scam. **Score-neutral**, reported separately.
- **H Strategy** — only at 4.0+

## Step 4: Score

One holistic 1–5 across requirement fit, level fit, compensation, feasibility, and employer quality. Apply the hard-blocker caps.

**Do not inflate to be encouraging.** A tool that scores everything 4+ is one the user stops trusting, and it costs them evenings. Do not deflate to look rigorous either.

## Step 5: Present and gate

Save the full report to `evaluation.md`. Show a compact summary: score, two strongest matches, two real gaps, any blocker, recommended action.

Then gate on the score per `shared/references/interaction.md`:

| Score | Action |
|---|---|
| **≥ 4.0** | Recommend applying. Offer `/wingman:apply`. |
| **3.0–4.0** | **Ask.** Show the gaps and let the user decide — apply anyway, skip, or see the full report. |
| **< 3.0** | Recommend skipping, and say which blocker. Do not talk them into it. |

Append a row to `tracker.md` per `shared/references/tracker.md`. **Set `Board`** — where this posting came from (`Arbeitsagentur`, `StepStone`, `Personio`, `LinkedIn`, `Interamt`, `Direkt`, `Netzwerk`); if the user pasted a URL with no context, infer it from the host and say which you recorded. `patterns` cannot compute response rate by board from a blank column, and the row is only cheap to fill now.

---

## Response Format

1. **Score** — the number, with the one-line reason
2. **Strengths / Gaps** — two each, sourced
3. **Blockers** — language, authorization, dealbreakers, or none
4. **Legitimacy** — only if something is off
5. **Recommendation** — apply / ask / skip, with the next command

## Permissions

```json
{ "permissions": { "allow": [
  "Read(~/.wingman/**)", "Write(~/.wingman/**)", "Edit(~/.wingman/**)",
  "mcp__claude-in-chrome__*"
] } }
```
