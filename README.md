<h1 align="center">Paperwork</h1>

<p align="center"><strong>Get hired in Germany.</strong></p>

<p align="center">
  <em>AI job tools write you an American résumé.<br>
  German employers don't want an American résumé.</em>
</p>

<p align="center">
  <a href="#quick-start">Quick start</a> ·
  <a href="#the-decision-everything-hangs-on">The language decision</a> ·
  <a href="#commands">Commands</a> ·
  <a href="#what-it-refuses-to-do">What it refuses to do</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT">
  <img src="https://img.shields.io/badge/skills-14-2ea44f" alt="14 skills">
  <img src="https://img.shields.io/badge/built_for-Claude_Code-000?logo=anthropic&logoColor=white" alt="Claude Code">
</p>

---

## The problem

You send a clean, keyword-optimised one-page resume with a Professional Summary at the top to a Mittelstand employer in Stuttgart. You hear nothing. You assume you weren't qualified.

You were qualified. You sent the wrong document.

A German application is a different artifact with rules that are not stylistic preferences:

- A **tabellarischer Lebenslauf** — tabular, dated, with your final grade and your language levels in CEFR. **No summary section.** That's what the letter is for.
- An **Anschreiben** laid out to **DIN 5008** — a Betreff carrying the exact advertised job title including `(m/w/d)` and the Kennziffer, a right-aligned date, and the first word of the body **lowercase**, because the Anrede ended in a comma. That one character is the fastest way a recruiter spots a translated letter.
- **Arbeitszeugnisse attached** — which are graded in code. Yours may be quietly telling every employer you were a 4.
- **Gehaltsvorstellung** in Jahresbrutto, and an **Eintrittstermin** that respects your Kündigungsfrist. Ask for a monthly net figure and you've marked yourself as new here.
- Filed through **Personio**, which serves more DACH employers than the entire startup ATS ecosystem, and which expects *several* attachments rather than one resume.

And under all of it, the decision nobody automates properly: **do you apply in German or in English?**

## The decision everything hangs on

Applying in the wrong language is the most common way a qualified candidate gets filtered out in Germany. Applying in German at a level you can't sustain in the phone screen is the second.

Paperwork treats this as a real decision, made once per job, recorded, and never silently reversed:

```
Language for Senior Backend Engineer (m/w/d) at Beispiel GmbH

  Recommendation: Deutsch (confidence: high)
    · Ad is written in German
    · "Sehr gute Deutschkenntnisse (C1) erforderlich"
    · Mittelstand manufacturer, Stuttgart
    · Ad uses "Sie" -> formal register
    · Your German: B2 -> gap

  The ad asks for C1. Your profile says B2. Three honest paths:

  1. Apply in German, state B2 on the CV. I keep the Anschreiben in
     language you could actually reproduce out loud.
  2. Apply in English. Works at international employers, rarely in
     the public sector.
  3. Skip it. If C1 is genuinely required for the work, that's a real
     filter, not a formality.

  [ Deutsch ]   [ English ]   [ Both versions ]
```

It weighs eight signals — the ad's language, its stated requirement, the employer type, the region, the role's customer contact, the `Sie`/`du` register — and then it **checks them against your actual CEFR level.**

It will not hand you a flawless C2 Anschreiben when your profile says B1 without telling you first. That letter buys an interview you cannot survive, and the recruiter finds out in the first four minutes.

## Quick start

```bash
git clone https://github.com/eklavyagoyal/paperwork.git
claude plugin marketplace add ./paperwork
claude plugin install paperwork@paperwork
```

Then in Claude Code:

```
/paperwork:setup
```

Setup asks for your CV, your targets, and the German facts nothing else asks for: your honest CEFR level, your Aufenthaltstitel, your Kündigungsfrist, your Gehaltsvorstellung, whether you want a photo on your Lebenslauf, and which Zeugnisse you actually hold. It asks once and remembers — re-asking is how a tool like this becomes annoying enough to abandon.

Then:

```
/paperwork:job-search
/paperwork:evaluate <url>
/paperwork:apply <url>
```

14 skills, ~550 tokens always-on. `AGENTS.md` routes other agent CLIs to the same instruction files, though Claude Code is the only one this has been exercised in.

## Commands

| Command | What it does |
|---|---|
| `setup` | CV, preferences, German level, work authorization, Zeugnisse, work-history interview. |
| `job-search` | Searches where German jobs actually are — **Arbeitsagentur** (the largest listing volume in the country, and almost nobody scrapes it), StepStone, Personio feeds, Interamt, LinkedIn — with **Zeitarbeit** detection so leased-labour ads are never passed off as direct roles. |
| `evaluate` | One posting → an A–H report and a **1–5 fit score**. Every requirement row is marked `quoted`, `inferred`, or `gap`, so no claimed match is unsourced. |
| `tailor-cv` | A tabellarischer Lebenslauf, or an English CV. Two different documents, each written from your profile — never a translation of the other. |
| `anschreiben` | A DIN 5008 Anschreiben, or an English cover letter. |
| `mappe` | Renders the **Bewerbungsmappe** — Anschreiben, Lebenslauf and Zeugnisse as one correctly ordered A4 PDF, checked for page counts and the 5 MB portal cap. |
| `apply` | Fills the form. Personio, softgarden, Lever, Greenhouse, Workday, SuccessFactors, Interamt. **Never submits.** |
| `zeugnis` | **Decodes your Arbeitszeugnis.** What grade it actually gives you, and what to do about it. |
| `visa` | Blue Card eligibility, anabin degree recognition, and what a posting's "no sponsorship" line actually means for *you*. |
| `tracker` | The pipeline, with integrity checks and follow-up timing calibrated to German response times. |
| `interview-prep` | Vorstellungsgespräch prep in the language the interview will actually be in. Selbstpräsentation, STAR+Reflection stories. |
| `followup` | Drafts a follow-up when it's genuinely due — and tells you when it isn't. Classifies replies, including a Zwischenbescheid, which is not a rejection. |
| `network-scan` | Who you know at employers that are hiring. Vitamin B is real, and strongest in the Mittelstand. |
| `patterns` | Whether German or English applications get you more responses. |

## Three things you won't find elsewhere

### Your Arbeitszeugnis is graded in code

German employers are legally required to write references that are both truthful and benevolent (§109 GewO). Those duties conflict, so the language became a cipher. Every HR person in Germany reads it. Almost no candidate does.

```
Beispiel GmbH, 03/2019 – 02/2021 — qualifiziertes Zeugnis

Leistung   Grade 3 (befriedigend)
           "…zu unserer vollen Zufriedenheit erledigt"
           -> "vollen", not "vollsten". No "stets". Two bands below top.

Verhalten  Concern
           "Sein Verhalten gegenüber Kollegen war einwandfrei."
           -> Vorgesetzte are not mentioned. A German recruiter reads
              that omission as friction with management.

Schluss    Cool
           Good wishes present. No thanks, and no "bedauern".

Verdict: this document is working against you.
```

`stets` plus `vollste` is a 1. Neither is a 3. "Hat sich bemüht" reads kindly and means *failed*. You have a legal right to a truthful and benevolent reference — Paperwork tells you what yours says, drafts the correction request, and **refuses to alter the document itself**, because that's a third party's signed instrument.

### "No visa sponsorship" probably doesn't mean you

Generic tools reduce work authorization to one boolean and get it wrong in both directions. If you already hold a Blue Card in Germany, an ad saying "no sponsorship" is aimed at candidates abroad — **it is not a blocker**, and discarding those roles costs you months. If you're outside the EU with an unrecognised degree, you'll pass that boolean and then fail at the Ausländerbehörde.

Paperwork establishes your status once, checks your degree against **anabin**, knows that IT specialists can qualify without a degree since the 2023 reform, and **looks the Blue Card thresholds up** rather than quoting them from memory — they're re-set every January, and a stale number makes you discard a job you're eligible for.

### The metric that needs the language decision recorded

Because every application stores which language it went out in, this becomes answerable:

```
              Sent   Response   Gespräch   Rate
  Deutsch       11        5          3      45%
  English       14        3          1      21%

  Mittelstand    DE 6/7 responded · EN 0/3 responded
  Startup        DE 1/2           · EN 3/8

  Reading: the gap is almost entirely Mittelstand and Konzern. Your
  three English applications to Mittelstand employers got nothing.
  Startups are the one place English is working for you.
```

Learning that after 25 applications instead of 100 buys back months of your life. Sample sizes are always reported, and a difference of two applications is called noise rather than dressed up as a finding.

## What it refuses to do

Drafting is reversible. Sending is not. So:

- **It never clicks Submit.** Not Absenden, not „Bewerbung abschicken". Not with prior approval, not when you say "just do it". It fills the form, screenshots it, and stops.
- **It never ticks a DSGVO consent box.** That's your consent to give, and general approval of a fill plan isn't consent to a data-processing agreement.
- **It never sends an email or a LinkedIn message.** Drafts only, addressed and ready.
- **It never inflates your language level, salary, dates, or scope.** Every claim traces to your CV or profile, or it doesn't get written.
- **It never leaves `Schwerbehinderung` answered.** Your disclosure, your call.
- **It treats a job posting as data, not instructions.** Nothing inside an ad, a careers page, or a recruiter email authorises an action.

These are enforced by `check.py`, which fails if any of them is edited away.

## Your data stays yours

Everything lives in `.paperwork/` on your machine, gitignored. No account, no telemetry, no upload — nothing leaves except what you already send to the model running Claude Code.

## Status

**v0.1.0.** Mostly instruction files: 14 skills over a German knowledge layer, plus a real PDF renderer.

```bash
python3 check.py                  # structure, dead links, safety invariants
node tools/mappe.mjs --selftest   # PDF renderer
```

**Well-grounded:** document conventions, Zeugnis decoding, the language decision, comp and contract terms, board coverage, PDF rendering (verified visually against a full German application).

**Marked unverified in the source:** the application-system notes in `shared/references/ats.md` are *structural* — URL shapes, whether a form sits in an iframe, which fields are conventional. They are deliberately not element-level, and every skill is instructed to scout a live form before filling and never assume a selector.

**Not built:** no dashboard, no batch mode. `mappe` needs Chrome, and `pdfunite` or `qpdf` to append Zeugnis scans.

Corrections from people who actually hire in Germany are the most useful thing you can send.

MIT licensed.
