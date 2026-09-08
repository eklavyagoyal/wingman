---
name: visa
description: Check Blue Card eligibility, degree recognition via anabin, and what a posting's work-authorization line actually means for you
argument-hint: "job URL to check against, or empty for a general status check"
---

# Work Authorization Check

> Reference: `shared/references/work-authorization.md`

Two jobs: establish the candidate's actual status once, and stop them discarding roles they are eligible for — or chasing ones they are not.

Generic tools reduce this to one boolean and get it wrong in both directions. A Blue Card holder in Germany gets told a "no sponsorship" role is blocked when it is not. A candidate abroad passes the boolean and then fails at the Ausländerbehörde on degree recognition.

## Step 1: Status

Read `Arbeitserlaubnis` from `profile.md`. If missing, establish it now and store it — citizenship or permit type, validity, whether an employer change needs approval, and whether the degree is recognized.

EU/EEA/Swiss citizen or Niederlassungserlaubnis → say there are no constraints and stop. No need to spend the user's time.

## Step 2: Degree recognition (anabin)

For a non-EU degree, and a candidate without permanent residence, this is the gate that decides everything downstream.

Check `anabin.kmk.org` for **both** the institution and the degree. An institution rated **H+** counts as equivalent to a German higher-education institution.

- **Recognized** → record it in `profile.md` and move on
- **Not found or not equivalent** → explain the **Zeugnisbewertung** route (a statement of comparability from the ZAB), and that it takes time and a fee
- **Cannot determine** → say so rather than guessing. Point at the ZAB. A wrong answer here costs months.

Do this at setup, not against a deadline.

## Step 3: Blue Card eligibility

Per §18g AufenthG: a recognized degree plus a salary at or above a threshold. There are two thresholds — a general one, and a lower one for shortage occupations (IT, engineering, medicine, mathematics, natural sciences) and for young professionals whose degree is under three years old.

**The thresholds are re-set every January**, indexed to the Beitragsbemessungsgrenze. **Look up the current figure** at `make-it-in-germany.com` or the BAMF, state the date checked, and tell the user it moves annually. Never quote one from memory — a stale number makes a candidate discard a role they qualify for.

Also check, before concluding anyone is blocked:
- **IT specialists without a degree** can qualify on roughly three years of relevant recent experience under §19c(2) AufenthG with §6 BeschV, since the 2023 reform.
- **Vorabzustimmung** — the employer can request pre-approval from the Bundesagentur für Arbeit and materially shorten the process. A concrete, low-cost thing to raise with a keen employer.
- **Chancenkarte** — for candidates still abroad, a points-based route to come and look for work without an offer first.

## Step 4: Against a specific posting

With a job URL, decide what the ad's wording actually means for this candidate:

| Ad says | Candidate holds a permit | Candidate needs one |
|---|---|---|
| "No visa sponsorship" | **Not a blocker.** The line targets candidates abroad. | **Hard blocker.** Skip it. |
| Salary below the Blue Card threshold | Irrelevant if the permit is already held | Blocker for the Blue Card route — check other routes |
| EU citizenship required | Hard blocker | Hard blocker. Legal, and it will not bend. |
| Öffentlicher Dienst | Often extra citizenship or clearance constraints — check | Usually blocked |
| Sicherheitsüberprüfung | Typically needs long-term residency — flag early | Blocked |

State the reasoning, not just the verdict, so the user can sanity-check it against their own paperwork.

## Step 5: Form answers

Give the exact wording for the questions German forms ask, per the reference table — `Benötigen Sie eine Arbeitserlaubnis?`, `Besitzen Sie einen Aufenthaltstitel?`, availability. Save them into `application-data.md` so every future application answers consistently.

**Never misrepresent status.** It is verified before a contract is signed; a false answer costs the offer and can affect future permits. Where the truth needs a sentence of context rather than a checkbox, put that sentence in a free-text field or the Anschreiben — accurate and framed, never hidden.

---

*Explains how the rules are structured so applications are not wasted. **Not immigration advice.** Thresholds, categories and procedures change, and the Ausländerbehörde decides individual cases. For anything consequential: the BAMF, `make-it-in-germany.com`, or a Fachanwalt für Migrationsrecht.*

## Response Format

1. **Status** — what the candidate holds and what it allows
2. **Recognition** — anabin result, or the route to get one
3. **Eligibility** — Blue Card and alternatives, with the date thresholds were checked
4. **This Posting** — blocker or not, and why
5. **Form Answers** — exact wording, saved

## Permissions

```json
{ "permissions": { "allow": [
  "Read(~/.paperwork/**)", "Write(~/.paperwork/**)", "Edit(~/.paperwork/**)",
  "mcp__claude-in-chrome__*"
] } }
```
