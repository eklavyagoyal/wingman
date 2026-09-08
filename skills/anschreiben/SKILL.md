---
name: anschreiben
description: Write a DIN 5008 Anschreiben in German, or a cover letter in English
argument-hint: "job URL, or 'last' for the most recent job"
---

# Anschreiben / Cover Letter

> Documents: `shared/references/de-documents.md` · Template: `shared/templates/anschreiben.md` · Language: `shared/references/language-decision.md`

A German Anschreiben is a **formal business letter with a standardized layout**, not a cover letter with German words in it. Layout errors are noticed at traditional employers.

## Step 0: Prerequisites

CV and profile required per `shared/references/prerequisites.md`.

## Step 1: Job, language, materials

Get the job (`$ARGUMENTS` URL, `last`, or ask). Read from the job folder: `posting.md`, `evaluation.md`, `language.md`, and the tailored CV if it exists.

**A tailored CV materially improves the letter** — it already contains the match analysis. If none exists, offer to run `/wingman:tailor-cv` first.

Read `language.md`. It sets the language **and the register** (Sie / du). If missing, run the language decision.

## Step 2: Find the addressee

Search the posting and the company site for a named contact. `Sehr geehrte Frau Berger,` beats `Sehr geehrte Damen und Herren,` — and it is a five-minute search that most applicants skip.

Also capture the **Kennziffer / Referenznummer** if the ad gives one. It goes in the Betreff, and omitting it annoys the people who file applications.

## Step 3: Pick the angle (interactive)

Do not choose the candidate's story for them. Use `AskUserQuestion` to pick the **2–3 achievements the letter leads with**, offering the real candidate achievements as options, each with a one-line note on why it fits this posting. Recommend the strongest.

Also confirm, when the ad asks for it, whether to state the **Gehaltsvorstellung** — and show the number from the profile so it is a decision, not a surprise.

## Step 4a: Anschreiben (German)

Follow `shared/templates/anschreiben.md`. **One page. Never two.**

Layout, in order: Absender · Empfänger · Ort und Datum (right) · **Betreff in bold with no "Betreff:" label**, containing the job title exactly as advertised including `(m/w/d)` plus the Kennziffer · Anrede · body · `Mit freundlichen Grüßen` with **no comma** · signature · `Anlagen`.

**The lowercase rule**: the Anrede ends in a comma, so the first body word is lowercase unless it is a noun or "Ich". `Sehr geehrte Frau Müller,` then `mit großem Interesse…`. This is the fastest tell of a non-native or machine-translated letter.

Body: opening (why this role, this company — never „hiermit bewerbe ich mich auf die ausgeschriebene Stelle"), one or two evidence paragraphs mapped to their stated requirements, then the closing block — Gehaltsvorstellung if asked, Eintrittstermin computed from the Kündigungsfrist, and `Über eine Einladung zu einem persönlichen Gespräch freue ich mich.`

`Anlagen` lists what actually exists in `DATA_DIR/zeugnisse/`. Nothing there → `Zeugnisse werden auf Wunsch nachgereicht`.

**Write it in German from the profile. Never translate an English letter** — a translated Anschreiben reads translated, which defeats the purpose. Natural Tech-Deutsch: short sentences, active verbs, no Passiv, English technical terms left alone.

Save as `anschreiben-de.md`.

## Step 4b: Cover letter (English)

250–350 words. `Dear [Name],` / `Dear Hiring Manager,` … `Regards, [Name]`. Opening that connects specific experience to their specific need, two evidence paragraphs, a close stating mutual benefit. Hyphens only, never em dashes.

Save as `cover-letter-en.md`.

## Step 5: Quality control (mandatory)

Line by line, before the user sees it:

1. Read every sentence aloud. Forced → rewrite.
2. **Zero em dashes.**
3. Any sentence over 20 words → split.
4. Business jargon → plain language.
5. No two consecutive sentences opening the same way.
6. Every achievement connects to a stated employer need.
7. **Verify each claim against the CV**: titles, companies, dates, tense. `Present` end date → present tense allowed; any other end date → past tense.
8. **Company-attribution check** — every metric sits under the employer it actually belongs to. Never merge results from two employers into one sentence.
9. German only: lowercase first body word, no comma after the Grußformel, Betreff has the exact advertised title.
10. **Honesty check** — nothing in the letter that the CV and profile do not support.

Banned: „hiermit bewerbe ich mich", "I am excited about the opportunity", "aligns perfectly with", anything implying a language level above the recorded one.

## Step 6: Present and iterate

Show the letter, note which achievements were used and why, and give the file path. Offer adjustments via `AskUserQuestion`: tone, which achievements, length, formality.

---

## Response Format

1. **Letter** — full text
2. **Writing Notes** — achievements used and why; anything deliberately left out
3. **What's Next** — `/wingman:mappe` to assemble, or `/wingman:apply` to submit

## Permissions

```json
{ "permissions": { "allow": [
  "Read(~/.wingman/**)", "Write(~/.wingman/**)", "Edit(~/.wingman/**)",
  "mcp__claude-in-chrome__*"
] } }
```
