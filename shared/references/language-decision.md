# Language Decision: Deutsch or English

**This is the first decision of every application and it drives everything downstream** — CV format, letter layout, salutation, register, salary phrasing, even which documents you attach. Make it once per job, record it, and never silently change it.

Applying in the wrong language is the most common way a technically qualified candidate gets filtered out in Germany. Applying in German at a level you cannot sustain in the interview is the second.

---

## Step 1: Collect Evidence

Read the posting and score these signals. Do not guess — quote what you actually found.

| # | Signal | Weight | Reads as |
|---|--------|--------|----------|
| 1 | **Explicit instruction** — "Bewerbung bitte auf Deutsch", "Please apply in English", "Our company language is English" | Decisive | Follow it. Stop here. |
| 2 | **Language the ad itself is written in** | Strong | German ad → German. English ad → English. |
| 3 | **Stated German requirement** — "Deutsch C1 erforderlich" / "verhandlungssicheres Deutsch" vs. "Deutsch von Vorteil" / "German is a plus" | Strong | Required → German. "A plus" → English is safe. |
| 4 | **Careers-page default language** and ATS locale (`/de/`, `/de-DE/`, `?lang=de`) | Medium | German default → German. |
| 5 | **Employer type** — public sector (öffentlicher Dienst), Behörde, Mittelstand, Handwerk, Kanzlei, Klinik, Versicherung, DAX corporate → German. Funded startup, scale-up, international tech, research institute → English usually fine. | Medium | See table below. |
| 6 | **Customer-facing role?** Sales, HR, legal, care, teaching, public admin, anything with German clients → German. Engineering, research, data, infra → English often accepted. | Medium | |
| 7 | **Region** — Berlin and international hubs skew English; Bavaria, Baden-Württemberg, Saxony Mittelstand and all public sector skew German. | Weak | Tie-breaker only. |
| 8 | **Ad register** — "du/dich/euer Team" (startup) vs. "Sie/Ihre Bewerbung" (formal) | Weak | Sets register, not language. Record it either way. |

**If the posting could not be fetched**, say so and ask the user to paste it. Do not decide the language from the company name alone.

### Employer-type quick table

| Employer type | Default | Note |
|---|---|---|
| Öffentlicher Dienst / Behörde / Universität (admin) | **German** | Almost never accepts English. Often TVöD/TV-L pay grade in the ad. |
| Mittelstand, family-owned, Handwerk | **German** | Even for technical roles. |
| DAX / MDAX corporate | **German** unless the ad is English | Large ones run English tracks for tech and R&D. |
| Startup / scale-up (Berlin, Munich, Hamburg) | **English** | Frequently English-only internally. |
| International tech, research institute (Max Planck, Fraunhofer, DLR) | **English** | Research groups publish in English. |
| Klinik / Pflege / Kanzlei / Steuerberatung | **German** | Regulated, German-language client work. |

---

## Step 2: Gate on the Candidate's Actual German Level

Read `Sprachen` from `DATA_DIR/profile.md` (set during setup).

This gate is not optional. **Never produce a German application that implies a higher level of German than the candidate declared, without telling them first.** A flawless Anschreiben from someone at B1 gets an interview they cannot survive, and the recruiter will notice the gap in the first phone screen.

| Ad requires | Candidate level | Do this |
|---|---|---|
| German C1/C2 or "verhandlungssicher" | C1+ | Apply in German. Normal path. |
| German C1/C2 | B2 | Apply in German, but flag it: the letter must stay in plain, short sentences the candidate could actually reproduce out loud. State the real level on the CV. |
| German C1/C2 | **B1 or below** | **Stop and surface it.** Present three honest options (below). Do not quietly write a C2 letter. |
| German B1/B2 or "von Vorteil" | Any | English is safe. German is a bonus signal if the candidate wants it. |
| No German requirement | Any | Follow the ad's language. |

When the gap is real, present it plainly:

> The ad asks for verhandlungssicheres Deutsch (C1). Your profile says B1. Three honest paths:
>
> 1. **Apply in German, state B1 on the CV.** I keep the Anschreiben in language you could actually speak. Honest, and shows effort. Lower hit rate.
> 2. **Apply in English.** Signals you read the requirement and are applying anyway. Works at international employers, usually not in the public sector.
> 3. **Skip it.** If German C1 is genuinely a hard requirement for the work, this is a real filter, not a formality.

Never pick for the user here. This one is theirs.

---

## Step 3: Ask (interactive checkpoint)

Present the recommendation with its evidence, then use `AskUserQuestion` per `shared/references/interaction.md`:

```
Language for [Role] at [Company]:

Recommendation: **Deutsch** (confidence: high)
- Ad is written in German
- "Sehr gute Deutschkenntnisse (C1) erforderlich"
- Employer is a Mittelstand manufacturer in Stuttgart
- Ad uses "Sie" -> formal register
- Your German: C1 -> no gap

Options: Deutsch / English / Both versions
```

Options to offer:
- **Deutsch** — Lebenslauf + Anschreiben, DIN 5008 layout
- **English** — CV + cover letter
- **Both** — generate both, user decides what to send (useful when confidence is low)

The user's answer wins over the recommendation, always. If they override, do not argue — record it and move on.

---

## Step 4: Record the Decision

Write `DATA_DIR/jobs/[company-slug]-[date]/language.md`:

```markdown
# Language Decision

- **Application language**: Deutsch
- **Register**: Sie (formal)
- **Confidence**: high
- **Decided by**: recommendation accepted by user
- **Date**: YYYY-MM-DD

## Evidence
- Ad language: German
- Explicit requirement: "Sehr gute Deutschkenntnisse (C1)"
- Employer type: Mittelstand (Stuttgart)
- Candidate German level: C1 (no gap)

## Downstream settings
- CV format: Lebenslauf (tabular, DIN-style)
- Letter format: Anschreiben (DIN 5008, one page, Betreff line)
- Photo: yes (user preference)
- Salutation: "Sehr geehrte Frau Berger," (contact found in ad)
- Salary phrasing: "Gehaltsvorstellung: 75.000 EUR brutto p.a."
- Attachments expected: Arbeitszeugnisse, Abschlusszeugnis
```

**Every downstream skill reads this file instead of asking again.** `tailor-cv`, `cover-letter`, and `apply` must all check for `language.md` first. If it exists, use it silently. Only re-run this decision if the user explicitly asks to switch languages.

---

## Register: Sie vs. du

Independent of language, and only applies to German.

- Ad uses **Sie / Ihre** → "Sehr geehrte Frau X," … "Mit freundlichen Grüßen". Default when unsure.
- Ad uses **du / dich / dein** → still open with "Hallo Frau X," or "Liebe Frau X," but keep the letter professional. Mirroring "du" in a startup application is correct and reads as culturally fluent.
- **When unsure, use Sie.** Being too formal is a non-event. Being too familiar with a Personalleiter is not.

## Both-language output

If the user picks "Both", generate the German set first (it is the harder constraint), then the English set. Save as:

```
resume-de.md   anschreiben-de.md
resume-en.md   cover-letter-en.md
```

Do not machine-translate one into the other. Write each from the profile natively — a translated Anschreiben reads as translated, which defeats the point.
