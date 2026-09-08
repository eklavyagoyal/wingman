---
name: network-scan
description: Find who you know at companies that are hiring - LinkedIn and Xing
argument-hint: "company name, or empty to scan against your current pipeline"
---

# Network Scan

> Contacts import: `/paperwork:setup` · Boards: `shared/references/de-job-boards.md`

In Germany a referral matters at least as much as anywhere else — Germans call the who-you-know factor **Vitamin B**, and Mittelstand hiring in particular runs on it. A named internal referral routinely beats a cold application to the same posting.

## Step 0: Prerequisites

`contacts.csv` required. Missing → "Run `/paperwork:setup` and export your LinkedIn connections first." CV and preferences also required for the company-fit side.

## Step 1: Load

Read `contacts.csv`, `preferences.md`, `resume/*`, and `tracker.md`.

The LinkedIn export has `First Name`, `Last Name`, `Company`, `Position`, `Connected On`. Xing exports vary and are increasingly restricted — handle whatever columns are present rather than assuming a schema.

## Step 2: Match

**With a company name** — find contacts there and check whether the company is hiring.

**Without** — cross-reference every company in the active pipeline (`tracker.md` plus recent `job-history.md`) against the contacts.

Match fuzzily and carefully. `Beispiel GmbH` should match `Beispiel Group`, `Beispiel Deutschland GmbH`, `Beispiel SE`. German legal suffixes are noise for matching: strip `GmbH`, `AG`, `SE`, `KG`, `GmbH & Co. KG`, `mbH`, `e.V.` before comparing.

**Say when a match is uncertain.** A wrong "you know someone here" wastes an outreach and is embarrassing.

## Step 3: Rank the contacts

Not every contact is worth asking:

| Contact | Value |
|---|---|
| Same team or function as the role | Highest — can refer directly and speak to the work |
| Hiring manager's peer or manager | High |
| HR / Recruiting at the company | High, and the most direct route in Germany |
| Anywhere else in the company | Moderate — many German employers pay an Empfehlungsbonus for any employee referral |
| Left the company | Low, but can still offer honest context |

Check `Connected On` — a contact from eight years ago you have not spoken to since is a different ask from a recent colleague. Say which it is; the message should differ.

## Step 4: Draft the outreach (interactive)

Ask with `AskUserQuestion` which contacts to write to and what the ask is: a referral, an internal intro, or just context on the company.

Draft in the language and register that fits the relationship — a former colleague you were on `du` terms with does not get `Sehr geehrter Herr`. Register from the relationship, not from `language.md`.

German norms for this: short, direct, concrete ask, no American-style enthusiasm. Name the specific role and Kennziffer. Make it easy to say no. Under 300 characters for a LinkedIn message.

**Never send it.** Draft only — the user sends.

## Step 5: Also useful without a contact

For companies where the candidate knows nobody, offer:
- The **named contact from the posting** — a real person to address the Anschreiben to beats `Sehr geehrte Damen und Herren`
- **kununu** reviews for what working there is actually like
- Whether the company has a **Betriebsrat**, and its funding or ownership situation

## Step 6: Save

Record contacts found and outreach drafted against the job folder, and note it in `tracker.md`. Do not re-draft outreach to a contact already approached for the same role.

---

## Response Format

1. **Matches** — contact, position, company, relationship strength, connection age
2. **Recommended Outreach** — who to ask and for what
3. **Drafts** — the messages, ready for the user to send
4. **No Contact?** — named addressee from the posting, kununu signal

## Permissions

```json
{ "permissions": { "allow": [
  "Read(~/.paperwork/**)", "Write(~/.paperwork/**)", "Edit(~/.paperwork/**)",
  "mcp__claude-in-chrome__*"
] } }
```
