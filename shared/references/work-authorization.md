# Work Authorization in Germany

Every competing job tool treats work authorization as one boolean: "does the ad say no sponsorship?" For Germany that is wrong often enough to cost real applications. A non-EU candidate **already living in Germany on a Blue Card** needs no sponsorship at all, yet generic tools flag those roles as blocked. A candidate abroad with an unrecognized degree passes the boolean and then fails at the Ausländerbehörde.

Get the candidate's actual status once, at setup, and reason from it.

---

## Status categories

Stored in `profile.md` under `Arbeitserlaubnis`.

| Status | What it means for applications |
|---|---|
| **German / EU / EEA / Swiss citizen** | Full labour-market access. No constraints. Skip this whole reference. |
| **Niederlassungserlaubnis** (permanent residence) | Unrestricted work. Effectively equivalent to a citizen for hiring purposes. |
| **Blaue Karte EU, already in Germany** | Can work. **Changing employer within the first 12 months requires approval from the Ausländerbehörde.** After 12 months, notification rather than approval. Not "sponsorship" — say so on forms. |
| **Aufenthaltstitel §18a/§18b (skilled worker)** | Tied more tightly to the role. Employer change generally needs approval. |
| **Job-seeker / Chancenkarte** | Present in Germany to look for work. Needs a permit change on hire. |
| **Student residence permit** | Limited working hours during study; needs conversion to a work permit on graduation. |
| **Outside Germany, non-EU** | Needs a visa + permit. Degree recognition is the gate. This is the slow path. |

---

## Blaue Karte EU — the mechanism

Governed by [§18g AufenthG](https://www.gesetze-im-internet.de/aufenthg_2004/__18g.html). Two hard requirements:

1. **A recognized or comparable university degree** — see anabin below.
2. **A gross annual salary at or above a threshold.**

### Compute the threshold, do not recall it

The threshold is **not a number in the law** — it is a percentage of one, and only the input changes annually. The law states the percentages directly, and they have been stable:

| Case | Threshold (§18g AufenthG) |
|---|---|
| General (Regelberufe) | **at least 50 %** of the annual Beitragsbemessungsgrenze, allgemeine Rentenversicherung |
| **Engpassberufe** (IT, engineering, medicine, mathematics, natural sciences and others per the ISCO-08 list) | **at least 45,3 %** of the same |
| **Young professionals** — degree awarded within the last three years | **at least 45,3 %** |

So: fetch the current **Beitragsbemessungsgrenze (allgemeine Rentenversicherung, West)** for the year in question, multiply, and **state the arithmetic** — the figure, the year, and the source date. A candidate can check multiplication; they cannot check a number you simply asserted.

> **The percentages above are quoted from the statute text and were confirmed on 2026-09-16.** They are the figures to use. `gesetze-im-internet.de` serves §18g as plain text and is worth re-fetching to confirm — but **it blocks datacenter IP ranges**, so the fetch fails from GitHub Actions, cloud dev environments, and Claude Code on the web while working fine from a home connection. Verified from both.
>
> So: if the fetch succeeds, confirm against it. If it fails, **use the percentages recorded here and say when they were last confirmed** — that is honest and actionable. What you must never do is substitute a remembered figure for either, which is the failure this section exists to prevent.
>
> **Do not rely on `make-it-in-germany.com`** at all: it renders client-side and a plain fetch returns 118 KB containing 108 characters of text.

Quoting a stale threshold makes a candidate discard a role they are eligible for, or chase one they are not. Both cost months.

**IT specialists without a degree**: since the 2023 Fachkräfteeinwanderungsgesetz reform, non-EU IT professionals can qualify via demonstrated professional experience (roughly three years of relevant recent experience) instead of a degree, under §19c(2) AufenthG together with §6 BeschV. Worth checking before concluding a degreeless candidate is blocked.

**Vorabzustimmung**: the employer can request pre-approval from the Bundesagentur für Arbeit, which materially shortens the process. Mention it to the user as something to raise with a keen employer — it is a concrete, low-cost ask that moves a slow process along.

**Toward permanence**: Blue Card holders can reach a Niederlassungserlaubnis notably faster than other permit holders, and the timeline shortens further with demonstrated German (B1). This is an argument for keeping German study going even when applying in English.

## anabin — degree recognition

[anabin.kmk.org/anabin.html](https://anabin.kmk.org/anabin.html) is the German database of foreign degrees and institutions. For a non-EU degree this is the gate that decides everything downstream.

- Institutions carry a rating; **H+** means recognized as equivalent to a German higher-education institution.
- Both the **institution** and the **degree** need to check out.
- **It is a client-side app.** A fetch of its filter pages returns 200 and about 2,500 characters of navigation with no results in it. Use the browser, or give the candidate the searches to run — and never state a rating that did not come from a result row.
- An unrecognized degree does not always end the matter — a **Zeugnisbewertung** (statement of comparability) from the ZAB is the usual next step.

If the candidate's degree is from outside the EU and their status is not already permanent, **check anabin during setup, not during an application.** Discovering a recognition problem while a deadline is running is the worst time to discover it.

## Chancenkarte (Opportunity Card)

A points-based route (§20a AufenthG, live since mid-2024) that allows a qualified non-EU candidate to come to Germany to *look for* work rather than needing an offer first. Points come from qualifications, experience, German and English levels, age, and prior ties to Germany. Relevant to candidates still abroad; irrelevant to someone already holding a work permit.

---

## Answering the question on application forms

German forms phrase this differently from American ones, and the right answer depends on status. Never let a US-shaped "Do you require sponsorship? → Yes" answer go onto a German form for a candidate who already has a permit — it invites a rejection that the facts do not support.

| Form question | Blue Card holder in Germany | Non-EU, abroad |
|---|---|---|
| „Benötigen Sie eine Arbeitserlaubnis?" | **Nein** — a valid permit is held | **Ja** |
| „Besitzen Sie einen Aufenthaltstitel?" | **Ja** — name it: Blaue Karte EU | **Nein** |
| "Do you require visa sponsorship?" | **No** — but add a one-line note if there is a free-text field: permit held, employer change requires a routine Ausländerbehörde step | **Yes** |
| „Ab wann sind Sie verfügbar?" | Kündigungsfrist + any approval step | Realistic visa timeline, stated honestly |

**Never misrepresent status.** It is checked before the contract is signed, and a false answer costs the offer and can affect future permits. Where the truth needs a sentence of context rather than a checkbox, put that sentence in the Anschreiben or a free-text field — accurate and framed, never hidden.

## Scoring impact

When evaluating a posting (`shared/references/evaluation.md`):

- Ad says **"no visa sponsorship"** + candidate **already holds a permit** → **not a blocker.** Note that the ad's wording is aimed at candidates abroad.
- Ad says **"no visa sponsorship"** + candidate **needs one** → **hard blocker.** Do not spend the user's time.
- Ad requires **EU citizenship** (common in defence, some public sector) → hard blocker for non-EU, and it is a legal requirement rather than a preference, so it will not bend.
- **Public sector / öffentlicher Dienst** → often additional citizenship or clearance constraints. Check before writing anything.
- **Security clearance / Sicherheitsüberprüfung** → typically needs long-term residency. Flag early.

---

*This reference explains how German work authorization is structured so applications are not wasted. It is not immigration advice. Thresholds, categories, and procedures change; the Ausländerbehörde decides individual cases. For anything consequential, point the user to the BAMF, `make-it-in-germany.com`, or a Fachanwalt für Migrationsrecht.*
