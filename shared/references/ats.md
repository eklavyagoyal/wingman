# Application Systems

How to reach and fill the systems German employers actually use.

> **Read this as structural, not element-level.** URL shapes, whether a form sits in an iframe, whether an account is required, which fields are conventional — that is what this file records. It does **not** record selectors or element refs, because those change without notice. **Always scout the live form** with `read_page(filter="interactive")` before filling anything, and never assume a ref from this document.

## Coverage in Germany

Ranked by how often you will actually meet them:

| System | Where | Difficulty |
|---|---|---|
| **Personio** | DACH small and mid-size employers. The most common by a wide margin. | Easy |
| **SAP SuccessFactors** | Large German corporates | Hard — account required |
| **softgarden** | German mid-market | Easy |
| **Workday** | International corporates operating in Germany | Hard — account required |
| **Greenhouse / Lever / Ashby** | Berlin startups, international tech | Easy to medium |
| **Interamt** | Öffentlicher Dienst | Hard — account, and the longest forms in the country |
| **d.vinci, rexx, Concludis, BITE** | Corporates, public bodies, Mittelstand | Unknown — scout |
| **join.com** | Startups | Easy |

---

## Personio

`<slug>.jobs.personio.de` or `.com`, often linked from a company careers page.

**Verified live on one tenant (SMIGHT GmbH, 2026-09-10).** Field keys below are Personio's standard names and should hold across tenants; custom attributes and the exact field set vary per employer, so still scout.

- **Discovery**: check the public XML jobs feed first — `https://<slug>.jobs.personio.de/xml`. It carries the full description, office, seniority, `createdAt` (useful for spotting long-open postings) and is far more reliable than scraping. Verified working.
- **Form location**: a separate page at `/job/<id>/apply?language=de`, reached from the posting via „Auf diese Stelle bewerben". **No iframe** — renders natively, so `read_page` and `form_input` work once the page is rendered. The SPA also builds its DOM in a hidden pane, so `javascript_tool` can enumerate fields when `read_page` returns an empty viewport.
- **Standard field keys** (`name` attribute): `first_name`, `last_name`, `email`, `phone`, `available_from` (Verfügbar ab), `location` (Ort), `salary_expectations` (Gehaltsvorstellung). Tenant extras appear as `custom_attribute_<n>` — on SMIGHT that was LinkedIn.
- **Required is marked in the label text**, e.g. `E-Mail* (erforderlich)`, while the DOM `required` attribute is `false` on every field. **Read the label, not the attribute**, or every field looks optional.
- **Multiple attachments confirmed**: `documents.cv` („Upload Lebenslauf") and `documents.other` („Upload Andere"), both `multiple`, added via „Datei hinzufügen". There is no dedicated Anschreiben field — the letter and any Zeugnisse go into `documents.other`. Build the whole attachment set.
- **DSGVO consent is tenant-dependent.** Some tenants show a checkbox; SMIGHT shows none and treats submitting as acceptance. Either way it is the candidate's consent action — never tick a box, and never click the submit button.
- **Submit button label**: „**Bewerbung senden**". This is on the never-click list.
- Not present on this tenant, present on others: `Wie haben Sie von uns erfahren?`, `Kündigungsfrist`. No EEO, no Schwerbehinderung.

## softgarden

`<company>.softgarden.io`, frequently white-labelled onto the employer's own domain. Native form. Offers quick-apply via LinkedIn or Xing alongside the full form — the full form gives better control over what gets submitted.

## SAP SuccessFactors

`career<N>.successfactors.eu` / `.com`, or white-labelled. Multi-step wizard behind **mandatory account creation**.

**Account creation is not something this tool does.** Tell the user to register and sign in themselves, wait for them to say they are ready, then help with the wizard.

## Workday

`<company>.wd<N>.myworkdayjobs.com`. No iframe, but **sign-in required** before the wizard opens — same handling as SuccessFactors.

Structure worth knowing: clicking Apply usually offers *Autofill with Resume*, *Apply Manually*, and *Use My Last Application*. Manual gives the most control. The wizard then runs roughly My Information → My Experience → Application Questions → Voluntary Disclosures → Self Identify → Review, with a *Save and Continue* between pages.

Two practical quirks to expect: `read_page` tends to return only what is in the viewport, so scroll and re-read to discover every field; and radio groups often do not surface in the interactive tree, so locate them with `find` and click by coordinate. Submitting with required fields empty produces an error box listing exactly what is missing — a legitimate way to discover required fields, as long as you never click the final submit.

## Greenhouse

Two shapes. Sometimes the form renders on the employer's page inside a **cross-origin iframe** (commonly `id="grnhse_iframe"`), which the page-reading and form-filling tools cannot see into.

The way through is to pull the board and job tokens out of the iframe source with `javascript_tool` and then navigate straight to the hosted form, where everything works normally:

```javascript
const iframe = document.getElementById('grnhse_iframe');
const url = new URL(iframe.src);
JSON.stringify({ board: url.searchParams.get('for'), job: url.searchParams.get('token') });
```

Extract the parameters individually rather than passing whole URLs around.

## Lever

`jobs.lever.co/<company>/<id>`, with the form at the same URL plus `/apply`. Renders natively, everything works directly. The least troublesome system you will meet.

## Interamt

The public-sector portal. Account required, so the user signs in.

Expect the longest forms in German hiring: the full Bewerbungsmappe including Zeugnisse, proof of qualifications, Entgeltgruppe, previous public-sector employment, and a voluntary Schwerbehinderung question. Strictly German-language.

## Unknown system

Navigate, screenshot, identify. Try `form_input` first; fall back to clicking the field and typing. For dropdowns, click to open then click the option. If the form is unrecognizable, say so and ask the user rather than guessing at fields.

---

## German field mapping

Beyond the obvious name and contact fields:

| German label | Source | Notes |
|---|---|---|
| `Vorname` / `Nachname` | Personal.FirstName / LastName | |
| `Straße und Hausnummer` | Personal.Street | German forms usually want a full street address |
| `PLZ` / `Wohnort` | Personal.PostalCode / City | |
| `Telefon` / `Mobil` | Personal.Phone | |
| `Gehaltsvorstellung` | Profile.SalaryTarget | **Jahresbrutto.** Never monthly, never net. |
| `Frühestmöglicher Eintrittstermin` | computed | Today + Kündigungsfrist. Never "sofort" when a notice period exists. |
| `Kündigungsfrist` | Profile.NoticePeriod | |
| `Wie haben Sie von uns erfahren?` | StandardAnswers.HowHeard | Name the board actually used |
| `Benötigen Sie eine Arbeitserlaubnis?` | `work-authorization.md` | **Do not answer with US sponsorship logic** — a permit holder answers Nein |
| `Aufenthaltstitel` | Profile.ResidencePermit | Name the permit type if held |
| `Anschreiben` | file upload | Attach it. Do not paste a letter into a general "further information" box when an upload field exists. |
| `Zeugnisse` / `Anlagen` | file upload | Multiple files. Audit each with `zeugnis-code.md` first. |
| `Datenschutzerklärung` / DSGVO consent | **user only** | Never auto-tick |
| `Schwerbehinderung` | voluntary | Leave blank unless the user has explicitly said otherwise. Their disclosure to make. |

## What German forms do not have

There is no US-style EEO block — no voluntary race or ethnicity self-identification. German anti-discrimination law is structured differently, and a German form asking those questions would be unusual.

Do not go looking for EEO fields, and never carry US EEO defaults onto a German form.

## File uploads

The browser tools can upload images only. Resume, letter and Zeugnis uploads are PDFs and DOCXs, so **they are the user's to do.** Record the field and the exact file path, surface both in the approval step so the user can upload while reviewing, and never claim a file was attached when it was not.
