---
name: job-search
description: Search German job boards for roles matching your CV and preferences
argument-hint: "search keywords, or 'daily' for the default terms"
---

# Job Search

> Priority hierarchy: `shared/references/priority-hierarchy.md` · Boards: `shared/references/de-job-boards.md` · Interaction: `shared/references/interaction.md`

Searches the German market — including the boards US-built tools miss entirely.

## Step 0: Prerequisites

Resolve the data directory. Check per `shared/references/prerequisites.md`: CV and preferences required, profile recommended.

## Step 1: Load context

Read `resume/*`, `preferences.md`, `profile.md`, `job-history.md` (to skip duplicates), `tracker.md`, and `contacts.csv` if present.

Search terms from the argument, else target roles from preferences. For German-language searching, **search both languages** — „Softwareentwickler" and "Software Engineer" surface different employers, and the German term reaches the Mittelstand.

## Step 2: Pick boards

Choose per profile rather than scanning everything. Ask with `AskUserQuestion` on the first run, then remember the answer in `preferences.md`:

| Profile | Boards |
|---|---|
| Default | Arbeitsagentur, StepStone, LinkedIn, Indeed.de |
| Tech / startup | + join.com, BerlinStartupJobs, LinkedIn weighted up |
| Mittelstand / regional | + Personio feeds, Jobware, regional Arbeitsagentur filters |
| Öffentlicher Dienst | + Interamt, Bund.de |
| Academia / research | + academics.de, jobvector |
| Graduate / Werkstudent | + Absolventa, Get in IT |

**Arbeitsagentur is always in the set.** It has the largest volume in Germany and carries employers that appear nowhere else.

## Step 3: Search

Browser tools per `shared/references/web-extraction.md`.

**Never call `get_page_text` on a results page** — it returns the whole document and can blow out the context window unrecoverably. Extract only listing rows with `javascript_tool`:

```javascript
Array.from(document.querySelectorAll('[class*="job"], [class*="listing"], [class*="card"], article, [role="listitem"]'))
  .slice(0, 50)
  .map(el => el.innerText.trim())
  .filter(t => t.length > 20 && t.length < 500)
  .join('\n---\n')
```

If the selector misses, screenshot to understand the layout, then write a site-specific selector. Prefer structured feeds where they exist (Personio XML, the Arbeitsagentur Jobsuche API).

**Cookie banners**: decline non-essential. If a banner blocks reading entirely, say so — do not click through consent silently.

**Do not retry a failing board more than once.** Note it, move on, and tell the user which boards were skipped and why. A silently partial search is worse than a short one.

## Step 4: Triage

Do **not** run the full A–H evaluation on every hit — that is expensive and most listings do not deserve it. Triage cheaply first:

1. **Drop** anything already in `job-history.md`
2. **Label** Zeitarbeit and Personalvermittlung per `de-job-boards.md`. Never present a leased-labour role as a direct one.
3. **Screen** against dealbreakers and the salary floor from `preferences.md`
4. **Flag** the language requirement of each ad, and whether it clears the candidate's level
5. **Flag** work-authorization blockers per `work-authorization.md` — remembering that a permit holder is *not* blocked by a "no sponsorship" line

Rank what survives. Then run the full `/wingman:evaluate` only on the top handful, or on whatever the user picks.

## Step 5: Log everything

Append every job seen to `DATA_DIR/job-history.md` — including rejects, with the reason, so the same listing is not re-surfaced weekly:

```markdown
## [DATE] — Search: "[terms]" — Boards: [list]

| Titel | Firma | Ort | Gehalt | Sprache | Typ | Vorauswahl | Notiz |
|-------|-------|-----|--------|---------|-----|------------|-------|
```

`Typ` is `Direkt` / `Zeitarbeit` / `Vermittlung`. `Sprache` is the ad's language.

## Step 6: Resolve employer URLs

For each surviving job, click through to the **actual employer posting** and capture that URL. Save the posting to `DATA_DIR/jobs/[company-slug]-[date]/posting.md` with the URL at the top.

**Never show the user an aggregator URL.** If a direct link cannot be resolved, give the company and title so they can find it, and say the link resolution failed.

## Step 7: Present

Compact, and always with the German context the user needs to judge:

```markdown
## [DATE] — [n] new matches from [m] boards

### 1. [Titel (m/w/d)] — [Firma]
- **Sprache**: German ad, C1 required → your level: B2 ⚠️
- **Vergütung**: 70.000–80.000 EUR (+13. Monatsgehalt) · 30 Tage Urlaub
- **Typ**: Direkt · unbefristet · Mittelstand, Stuttgart · Hybrid 2 Tage
- **kununu**: 3.8 — reviews mention long hours
- **Arbeitserlaubnis**: no issue (Blaue Karte held)
- **Netzwerk**: you know [Name] ([Position]) there
- **Warum**: [one line]
- **Anzeige**: [employer URL]
```

Omit any line with no data. Never pad.

Then note which boards were searched, which failed, and how many were filtered with the top reasons — so a thin result set is explainable rather than mysterious.

## Step 8: Next steps

```
/wingman:evaluate <url>     full A–H report + 1–5 score
/wingman:tailor-cv <url>    Lebenslauf or CV
/wingman:apply <url>        evaluate, write, and fill the form
```

Do **not** tailor CVs, write letters, or fill forms in this skill. Those are separate skills with their own gates.

## Step 9: Learn

Update `preferences.md` from any feedback: "no Zeitarbeit" → dealbreaker; "nothing below 70k" → floor; "prefer Berlin" → location weight.

---

## Response Format

1. **Matches** — ranked, with language, comp, type, kununu, authorization, network
2. **Search Coverage** — boards searched, boards failed, counts filtered and why
3. **Next Steps**

## Permissions

```json
{ "permissions": { "allow": [
  "Read(~/.wingman/**)", "Write(~/.wingman/**)", "Edit(~/.wingman/**)",
  "mcp__claude-in-chrome__*"
] } }
```
