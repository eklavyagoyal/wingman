# Application Tracker

`DATA_DIR/tracker.md` is the single source of truth for every application. One row per job, updated at every state change — not a second log that drifts out of sync with the job folders.

## Format

```markdown
# Application Tracker

| Job | Company | Board | Score | Lang | Found | Applied | Reply | Status | Next | Folder |
|-----|---------|-------|:-----:|:----:|-------|---------|-------|--------|------|--------|
| Software Engineer (m/w/d) | Beispiel GmbH | Arbeitsagentur | 4.5 | DE | 2026-09-01 | 2026-09-03 | 2026-09-11 | Gespräch | Vorbereitung 2026-09-20 | beispiel-gmbh-2026-09-01 |
```

**`Board`** — where the job was found: `Arbeitsagentur`, `StepStone`, `Personio`, `LinkedIn`, `Interamt`, `Direkt`, `Netzwerk`. Set by whichever skill created the row.

**`Reply`** — the date of the first substantive reply from the employer, whatever it said. Leave blank until one arrives, and note that an `Eingangsbestätigung` is an automated receipt, **not** a reply. Set by `followup` when it classifies one.

Both exist because `patterns` cannot compute a cut it has no column for. Response rate by board, and real time-to-response per employer type, are two of the analyses that make the whole history worth keeping — and a blank column is recoverable where a missing one is not.

## Status values

Use these exact strings so counts and filters stay reliable:

| Status | Meaning |
|---|---|
| `Gefunden` | Found, not yet evaluated |
| `Bewertet` | Evaluated, not applied |
| `Verworfen` | Decided against — put the reason in Next |
| `In Vorbereitung` | Documents being written |
| `Bewerbung gesendet` | Submitted |
| `Eingangsbestätigung` | Receipt confirmed |
| `Gespräch` | Interview scheduled or held |
| `Absage` | Rejected |
| `Angebot` | Offer received |
| `Angenommen` / `Abgelehnt` | Offer accepted / declined |

## Integrity

Before reporting any summary, check and report problems rather than papering over them:

- **Every `jobs/` folder has a tracker row**, and every row points at a folder that exists
- **No duplicate rows** for the same employer plus role — merge and keep the earliest `Found`
- **No row with `Applied` set but status still `Bewertet`** — inconsistent
- **No row past its `Next` date** without being surfaced to the user
- **Scores match `evaluation.md`** in the folder

If a check fails, say which row and what is wrong. Do not silently repair data the user might care about — show the discrepancy and propose the fix.

## German follow-up timing

Response times in Germany run longer than in US tech, and the polite interval is correspondingly longer.

| Employer | Expect a first response | Follow up after |
|---|---|---|
| Startup | 1–2 weeks | 10 days |
| Mittelstand | 2–4 weeks | 3 weeks |
| Konzern | 3–6 weeks | 4 weeks |
| Öffentlicher Dienst | 6–12 weeks, sometimes longer | 6 weeks, and expect formality |

An **Eingangsbestätigung** (automated receipt) is not a response. A **Zwischenbescheid** means the process is running and you are still in it — do not read it as a rejection.
