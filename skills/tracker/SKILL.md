---
name: tracker
description: Show the application pipeline, check its integrity, and surface what needs action today
argument-hint: "'check' for integrity only, or a status to filter by"
---

# Tracker

> Format and status values: `shared/references/tracker.md`

`DATA_DIR/tracker.md` is the single source of truth. This skill reads it, verifies it against the job folders, and tells the user what needs doing.

## Step 1: Load and verify

Read `tracker.md` and list `DATA_DIR/jobs/`. Run the integrity checks from the reference:

- Every job folder has a row, every row points at a folder that exists
- No duplicate rows for the same employer plus role
- No row with `Applied` set but status still `Bewertet`
- Scores match the `evaluation.md` in each folder
- No row past its `Next` date without being surfaced

**Report discrepancies, do not silently repair them.** Show the row and what is wrong, then propose the fix. Data the user might care about is not yours to quietly rewrite.

## Step 2: Present the pipeline

Funnel first, then what needs action, then the table:

```
Pipeline — [date]

  Gefunden      12
  Bewertet      31   (avg score 3.4)
  Gesendet      18
  Gespräch       4
  Angebot        1
  Absage         9
  Verworfen     14

Response rate: 22% (4 Gespräche from 18 Bewerbungen)

Needs action today
  · Beispiel GmbH — follow up due (sent 3 weeks ago, Mittelstand)
  · Muster AG — Gespräch Thursday 14:00, no prep done
  · Vorbild SE — evaluated 4.5, never applied
```

Then the filtered table. Default to open items — hide `Absage` and `Verworfen` unless asked.

## Step 3: Flag the stale

Using the German follow-up timing table (startups ~10 days, Mittelstand ~3 weeks, Konzern ~4 weeks, öffentlicher Dienst ~6 weeks), list anything overdue and offer `/paperwork:followup`.

Remember: an **Eingangsbestätigung** is not a response, and a **Zwischenbescheid** means the process is still running — neither is a rejection.

## Step 4: Offer next actions

Point at the specific command for each item needing attention. Never do the work here.

---

## Response Format

1. **Funnel** — counts by status, response rate
2. **Needs Action** — overdue follow-ups, upcoming interviews, evaluated-but-not-applied
3. **Integrity** — discrepancies found, or clean
4. **Pipeline** — the table

## Permissions

```json
{ "permissions": { "allow": [
  "Read(~/.paperwork/**)", "Write(~/.paperwork/**)", "Edit(~/.paperwork/**)"
] } }
```
