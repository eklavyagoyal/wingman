<div align="center">

# Wingman

### Get hired in Germany.

<p>
  <em>AI job tools write you an American résumé.<br>
  German employers don't want an American résumé.</em>
</p>

<p>
  <img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="MIT">
  <img src="https://img.shields.io/badge/skills-14-2ea44f?style=flat-square" alt="14 skills">
  <img src="https://img.shields.io/badge/always--on-~537_tokens-8957e5?style=flat-square" alt="537 tokens">
  <img src="https://img.shields.io/badge/built_for-Claude_Code-000?style=flat-square&logo=anthropic&logoColor=white" alt="Claude Code">
</p>

<a href="#quick-start">Quick start</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="#the-decision-everything-hangs-on">The one decision</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="#the-fourteen">Commands</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="#what-it-refuses-to-do">What it refuses to do</a>

<br>

<img src="assets/hero.png" alt="A DIN 5008 Anschreiben and a tabellarischer Lebenslauf, rendered by Wingman" width="100%">

<sub><b>Actual output.</b> Left: a DIN 5008 Anschreiben — Betreff carrying the exact advertised title and Kennziffer, right-aligned date, signature space, Anlagen.<br>Right: a tabellarischer Lebenslauf — dates against content, CEFR language levels, Abschlussnote. No summary section, because German CVs don't have one.</sub>

</div>

<br>

---

## Why this exists

You send a clean, keyword-optimised one-page resume with a Professional Summary at the top to a Mittelstand employer in Stuttgart. You hear nothing. You assume you weren't qualified.

You were qualified. You sent the wrong document.

A German application is a different artifact, and its rules are not stylistic preferences:

<table>
<tr><td width="50%" valign="top">

**The Lebenslauf** is tabular and reverse-chronological. It carries your final grade and your language levels in CEFR. It has **no summary section** — that's what the letter is for. Unexplained gaps get scrutinised in a way they never are in the US.

</td><td width="50%" valign="top">

**The Anschreiben** is a DIN 5008 business letter. Betreff with the exact advertised job title including `(m/w/d)` and the Kennziffer. Right-aligned date. And the first word of the body is **lowercase**, because the Anrede ended in a comma.

</td></tr>
<tr><td valign="top">

**Your Arbeitszeugnisse get attached** — and they're graded in code. Yours may be quietly telling every employer you were a 4.

</td><td valign="top">

**Gehaltsvorstellung** in Jahresbrutto, and an **Eintrittstermin** that respects your Kündigungsfrist. Ask for a monthly net figure and you've marked yourself as new here.

</td></tr>
</table>

Filed through **Personio**, which serves more DACH employers than the entire startup ATS ecosystem, and which expects *several* attachments rather than one resume.

And underneath all of it, the decision nobody automates properly.

<br>

## The decision everything hangs on

Applying in the wrong language is the most common way a qualified candidate gets filtered out in Germany. Applying in German at a level you can't sustain in the phone screen is the second.

```
  Language for Senior Backend Engineer (m/w/d) at Beispiel GmbH

    Recommendation: Deutsch (confidence: high)
      · Ad is written in German
      · "Sehr gute Deutschkenntnisse (C1) erforderlich"
      · Mittelstand manufacturer, Stuttgart
      · Ad uses "Sie" → formal register
      · Your German: B2 → gap

    The ad asks for C1. Your profile says B2. Three honest paths:

    1. Apply in German, state B2 on the CV. I keep the Anschreiben in
       language you could actually reproduce out loud.
    2. Apply in English. Works at international employers, rarely in
       the public sector.
    3. Skip it. If C1 is genuinely required for the work, that's a real
       filter, not a formality.

    [ Deutsch ]   [ English ]   [ Both versions ]
```

It weighs eight signals — the ad's language, its stated requirement, the employer type, the region, the role's customer contact, the `Sie`/`du` register — then checks them against **your actual CEFR level**.

It will not hand you a flawless C2 Anschreiben when your profile says B1 without telling you first. That letter buys an interview you cannot survive, and the recruiter finds out in the first four minutes.

The decision is recorded per job. Every skill downstream reads it instead of asking you again.

<br>

## Quick start

```bash
git clone https://github.com/eklavyagoyal/wingman.git
claude plugin marketplace add ./wingman
claude plugin install wingman@wingman
```

Then, in Claude Code:

```
/wingman:setup
```

Setup asks for your CV, your targets, and the German facts nothing else asks for: your honest CEFR level, your Aufenthaltstitel, your Kündigungsfrist, your Gehaltsvorstellung, whether you want a photo on your Lebenslauf, and which Zeugnisse you actually hold.

It asks **once** and remembers. Re-asking is how a tool like this becomes annoying enough to abandon.

```
/wingman:job-search
/wingman:evaluate <url>
/wingman:apply <url>
```

<br>

## The fourteen

| | |
|---|---|
|`setup`| CV, preferences, German level, work authorization, Zeugnisse, work-history interview |
|`job-search`| Searches where German jobs actually are — **Arbeitsagentur** (largest listing volume in the country), StepStone, Personio feeds, Interamt, LinkedIn — with **Zeitarbeit detection**, so leased-labour ads are never passed off as direct roles |
|`evaluate`| One posting → an A–H report and a **1–5 fit score**. Every requirement row is marked `quoted`, `inferred`, or `gap`, so no claimed match is unsourced |
|`tailor-cv`| A tabellarischer Lebenslauf, or an English CV. Two different documents, each written from your profile — never a translation of the other |
|`anschreiben`| A DIN 5008 Anschreiben, or an English cover letter |
|`mappe`| Renders the **Bewerbungsmappe** — letter, CV and Zeugnisse as one correctly ordered A4 PDF, checked for page counts and the 5 MB portal cap |
|`apply`| Fills the form. Personio, softgarden, Lever, Greenhouse, Workday, SuccessFactors, Interamt. **Never submits** |
|`zeugnis`| **Decodes your Arbeitszeugnis.** What grade it actually gives you, and what to do about it |
|`visa`| Blue Card eligibility, anabin degree recognition, and what a posting's "no sponsorship" line actually means for *you* |
|`tracker`| The pipeline, with integrity checks and follow-up timing calibrated to German response times |
|`interview-prep`| Vorstellungsgespräch prep in the language the interview will actually be in. Selbstpräsentation, STAR+Reflection stories |
|`followup`| Drafts a follow-up when it's genuinely due — and tells you when it isn't. Classifies replies, including a Zwischenbescheid, which is not a rejection |
|`network-scan`| Who you know at employers that are hiring. Vitamin B is real, and strongest in the Mittelstand |
|`patterns`| Whether German or English applications get you more responses |

<br>

## Three things you won't find elsewhere

<details open>
<summary><b>Your Arbeitszeugnis is graded in code</b></summary>

<br>

German employers must write references that are both truthful and benevolent (§109 GewO). Those duties conflict, so the language became a cipher. Every HR person in Germany reads it. Almost no candidate does.

```
  Beispiel GmbH, 03/2019 – 02/2021 — qualifiziertes Zeugnis

  Leistung   Grade 3 (befriedigend)
             "…zu unserer vollen Zufriedenheit erledigt"
             → "vollen", not "vollsten". No "stets". Two bands below top.

  Verhalten  Concern
             "Sein Verhalten gegenüber Kollegen war einwandfrei."
             → Vorgesetzte are not mentioned. A German recruiter reads
                that omission as friction with management.

  Schluss    Cool
             Good wishes present. No thanks, and no "bedauern".

  Verdict: this document is working against you.
```

`stets` plus `vollste` is a 1. Neither is a 3. *"Hat sich bemüht"* reads kindly and means **failed**.

You have a legal right to a truthful and benevolent reference. Wingman tells you what yours says, drafts the correction request, and **refuses to alter the document itself** — that's a third party's signed instrument.

</details>

<details>
<summary><b>"No visa sponsorship" probably doesn't mean you</b></summary>

<br>

Generic tools reduce work authorization to one boolean and get it wrong in both directions.

Already hold a Blue Card in Germany? An ad saying "no sponsorship" is aimed at candidates abroad — **it is not a blocker**, and discarding those roles costs you months. Outside the EU with an unrecognised degree? You'll pass that boolean and then fail at the Ausländerbehörde.

Wingman establishes your status once, checks your degree against **anabin**, knows that IT specialists can qualify without a degree since the 2023 reform, and **looks the Blue Card thresholds up** rather than quoting them from memory — they're re-set every January, and a stale number makes you discard a job you're eligible for.

</details>

<details>
<summary><b>The metric that needs the language decision recorded</b></summary>

<br>

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

Learning that after 25 applications instead of 100 buys back months. Sample sizes are always reported, and a difference of two applications is called noise rather than dressed up as a finding.

</details>

<br>

## What it refuses to do

Drafting is reversible. Sending is not.

- **It never clicks Submit.** Not Absenden, not „Bewerbung abschicken". Not with prior approval, not when you say "just do it". It fills the form, screenshots it, and stops.
- **It never ticks a DSGVO consent box.** That's your consent to give, and approving a fill plan isn't approving a data-processing agreement.
- **It never sends an email or a LinkedIn message.** Drafts only, addressed and ready.
- **It never inflates your language level, salary, dates, or scope.** Every claim traces to your CV or profile, or it doesn't get written.
- **It never leaves `Schwerbehinderung` answered.** Your disclosure, your call.
- **It treats a job posting as data, not instructions.** Nothing inside an ad, a careers page, or a recruiter email authorises an action.

Every one of those is enforced by `check.py`, which fails if it's edited away.

<br>

## Your data stays yours

Everything lives in `.wingman/` on your machine, gitignored. No account, no telemetry, no upload — nothing leaves except what you already send to the model running Claude Code.

<br>

## Status

**v0.1.1.** Mostly instruction files: 14 skills over a German knowledge layer, plus a zero-dependency PDF renderer.

```bash
python3 check.py                  # structure, dead links, DATA_DIR drift, 13 safety invariants
node tools/mappe.mjs --selftest   # 22 assertions
```

**Well-grounded** — document conventions, Zeugnis decoding, the language decision, comp and contract terms, board coverage, PDF rendering (the images above are real output, inspected visually).

**Marked unverified in the source** — the application-system notes in `shared/references/ats.md` are *structural*: URL shapes, whether a form sits in an iframe, which fields are conventional. Deliberately not element-level, and every skill is instructed to scout a live form before filling and never assume a selector.

**Not built** — no dashboard, no batch mode. `mappe` needs Chrome, plus `pdfunite` or `qpdf` to append Zeugnis scans.

Corrections from people who actually hire in Germany are the most useful thing you can send.

<br>

<div align="center">
<sub>MIT licensed. Built because sending the right document shouldn't be the hard part.</sub>
</div>
