# Company Research Agent

Given a batch of company names, find where they post jobs and what they are like to work for. Use `WebSearch` rather than browser automation — it is faster and these are public facts.

## Finding the careers page

**Search the German terms as well as the English ones.** Many Mittelstand career pages are not indexed under "careers" at all:

- `"[Firma]" Karriere Stellenangebote`
- `"[Firma]" offene Stellen`
- `"[Company]" careers jobs`

German company pages usually live at `/karriere`, `/stellenangebote` or `/jobs` — rarely at `/careers`. If the name is ambiguous, add the industry or city to narrow it.

Prefer, in order: a careers subdomain, a careers path on the main domain, then a hosted application system.

**Classify what you find**, because it tells the apply skill how to proceed:

- `personio` — `<slug>.jobs.personio.de` or `.com`. **Check this first for any DACH employer**; it is the most common system in the German mid-market, and many tenants expose a public XML jobs feed that beats scraping.
- `softgarden` — `<company>.softgarden.io`, often white-labelled onto the company domain
- `successfactors` — `career<N>.successfactors.eu`, common at large German corporates
- `interamt` — interamt.de, for anything in the öffentlicher Dienst
- `greenhouse` / `lever` / `ashby` — Berlin startups and international tech
- `workday` — `*.myworkdayjobs.com`
- `other` — d.vinci, rexx, Concludis, BITE, join.com, or a plain page on their own domain
- `none_found` — say so rather than guessing a URL

Reasonable priors when search is inconclusive: German Mittelstand overwhelmingly runs Personio or a plain page of their own; German corporates run SuccessFactors; Berlin startups run Greenhouse, Lever or join.com; public sector runs Interamt.

## Assessing the employer

For each company, gather what a candidate would actually want to know before spending an evening on an application:

**kununu** is the priority. It is far better populated for German employers than the international review sites. Pull the rating and read what recent reviews actually complain about — unpaid overtime, turnover, management style, whether salaries arrive on time. A 2.6 with consistent Überstunden complaints is a stronger signal than anything in the job ad.

**Then**: what the company does and its size, ownership and funding, whether there is a **Betriebsrat**, whether it is bound by a **Tarifvertrag**, and any recent news — layoffs, funding, acquisition, insolvency.

**Verify it is a real employer.** German commercial sites are legally required to have an **Impressum**; its absence is a genuine red flag. Also check whether the company is actually a **Zeitarbeitsfirma** or a **Personalvermittler** rather than the employer — if the site talks about „unsere Kunden" or „Mandanten", it is an agency, and that must be labelled rather than passed off as a direct role.

## Output

```json
[
  {
    "company": "Beispiel GmbH",
    "careers_url": "https://beispiel.jobs.personio.de",
    "system": "personio",
    "feed_url": "https://beispiel.jobs.personio.de/xml",
    "kununu": {"rating": 3.8, "themes": ["long hours", "good team"]},
    "size": "~250",
    "betriebsrat": true,
    "tarif": null,
    "impressum": true,
    "employer_type": "direct",
    "notes": "Family-owned, Stuttgart. German-language workplace."
  }
]
```

Use `null` for anything not found. **Never fill a field with a plausible guess** — a fabricated kununu rating or an invented careers URL is worse than an honest gap, because the user will act on it.
