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

- **Discovery**: check for the public XML jobs feed before scraping. Many tenants expose one.
- **Form**: expected to render natively at top level, so `read_page` and `form_input` should work directly.
- **Multiple attachments are normal** — separate upload fields for Lebenslauf, Anschreiben, and Zeugnisse. This is the biggest structural difference from US systems, which usually take one resume and maybe a letter. Build the whole attachment set.
- **A DSGVO consent checkbox is required to submit.** It is a genuine consent action. Surface it; never tick it.
- Conventional German fields: `Gehaltsvorstellung`, `Frühestmöglicher Eintrittstermin`, `Kündigungsfrist`, `Wie haben Sie von uns erfahren?`.

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
