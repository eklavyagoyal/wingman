---
name: patterns
description: Analyze what is actually working - especially whether German or English applications get you more responses
---

# Patterns

Reads the whole history and finds what is working. Needs roughly 15+ applications before the numbers mean anything — **say so plainly if there are fewer**, and give the raw counts instead of percentages that imply confidence they do not have.

## The flagship metric: DE vs EN response rate

This is the question no other tool can answer, because no other tool records the language decision per application.

```
Application language — response rates

              Sent   Response   Gespräch   Rate
  Deutsch       11        5          3      45%
  English       14        3          1      21%

Split by employer type:
  Mittelstand      DE 6/7 responded · EN 0/3 responded
  Startup          DE 1/2           · EN 3/8
  Konzern          DE 2/2           · EN 0/3

Reading: your German applications are outperforming, and the gap is
almost entirely Mittelstand and Konzern. Your three English
applications to Mittelstand employers got nothing. Startups are the
one place English is working for you.

Suggested change: default to German for anything that is not a
startup or international tech. Your recorded German is B2 — the
letters are working, so this looks like a real signal, not luck.
```

That reframing is the product. A candidate who learns this after 25 applications instead of 100 has bought back months.

## Other cuts

| Analysis | Question answered |
|---|---|
| **By board** | Which boards produce responses, not just listings. Arbeitsagentur vs StepStone vs LinkedIn often differ sharply. |
| **By ATS** | Where applications die. A near-zero rate through one ATS can mean a broken upload rather than rejection. |
| **By score** | Do 4.5s actually convert better than 3.5s? If not, the scoring is miscalibrated — say so. |
| **By employer type** | Startup / Mittelstand / Konzern / öffentlicher Dienst conversion. |
| **By stage reached** | Where the funnel leaks: no response, post-CV, post-interview. Each implies a different fix. |
| **Rejection reasons** | Recurring reasons across `Absage` rows. |
| **Zeitarbeit ratio** | How much of the pipeline is leased-labour listings — often higher than the user realizes. |
| **Time to response** | Actual observed times per employer type, to calibrate the follow-up table to reality. |

## Rules

- **Report the sample size with every number.** "3 of 4" not "75%" when n is 4.
- **Do not manufacture a narrative from noise.** If the difference is within a couple of applications, say it is not yet a signal.
- **Distinguish correlation from cause.** More German responses may reflect which employers were applied to, not the language. Check the split before claiming the language caused it.
- **Name the fix.** An analysis with no recommended change is just a chart.
- Where the data says the scoring is wrong, say that too. Being wrong quietly is worse.

## Output

Save to `DATA_DIR/patterns.md` with the date and sample size. Offer to update `preferences.md` and the default language preference in `profile.md` based on what was found — with the user's approval, never automatically.

---

## Response Format

1. **Language** — DE vs EN response rates, split by employer type
2. **Funnel** — where applications die
3. **What Is Working** — boards, employer types, scores
4. **Suggested Changes** — concrete, with the evidence and the sample size

## Permissions

```json
{ "permissions": { "allow": [
  "Read(~/.paperwork/**)", "Write(~/.paperwork/**)", "Edit(~/.paperwork/**)"
] } }
```
