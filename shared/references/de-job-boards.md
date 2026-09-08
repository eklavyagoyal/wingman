# Where German Jobs Actually Are

US-built job tools scan LinkedIn, Indeed, Greenhouse, Lever and Ashby. In Germany that misses most of the market — the Mittelstand, which is where most of the jobs are, does not post to any of them.

## Tier 1 — highest coverage

| Board | Why it matters |
|---|---|
| **Bundesagentur für Arbeit** — `arbeitsagentur.de/jobsuche` | The federal employment agency's board. The single largest listing volume in Germany by a wide margin, and it carries Mittelstand and regional employers that appear nowhere else. Free, no account needed to search. Has a public Jobsuche API. Underused by every competing tool. |
| **StepStone** — `stepstone.de` | The dominant commercial board. Strong for Mittelstand and corporates. Also publishes salary reports worth citing in comp research. |
| **Personio-hosted career pages** — `<slug>.jobs.personio.de` / `.com` | Personio is the default HR system for DACH small and mid-size companies, so thousands of career pages live here. Many tenants expose a **public XML jobs feed** — cheaper and more reliable than scraping. |
| **LinkedIn Jobs** | Best coverage for Berlin, international tech, and English-language roles. Weakest for traditional Mittelstand. |
| **Indeed.de** | Broad aggregation, heavy duplication with other boards. Dedupe against them. |

## Tier 2 — worth scanning per profile

| Board | Segment |
|---|---|
| **Interamt** — `interamt.de` | **Öffentlicher Dienst.** The public-sector portal. If the candidate is open to public service, nothing else covers it. Applications are German-only and highly formal. |
| **Bund.de** | Federal government positions. |
| **Xing Jobs** (New Work) | DACH professional network. Fading against LinkedIn but still used by conservative employers. |
| **join.com** | Startup-heavy, doubles as an ATS. |
| **BerlinStartupJobs** | Berlin startups, English-first. |
| **Jobware** | Curated, engineering and IT skew. Lower volume, higher signal. |
| **jobvector** | Science, engineering, medicine, IT. |
| **Get in IT** / **Absolventa** | Graduates, Werkstudent, Praktikum, Einstiegspositionen. |
| **academics.de** | Universities and research institutes. |
| **Instaffo** | DACH tech matching, reverse-application model. |
| **stellenanzeigen.de**, **kimeta**, **Monster.de** | Aggregators. Mostly duplicate Tier 1. |
| **hiring.cafe** | Cross-board aggregator. Useful for a fast first sweep; resolve to the employer URL before showing anything to the user. |

## Not a job board, but check it every time: kununu

`kununu.com` is the German Glassdoor and it is materially more populated for German employers than Glassdoor is. Before recommending any role, pull the employer's kununu rating and scan recent reviews for the patterns that matter: Überstunden culture, Fluktuation, Führungsstil, whether salaries are paid on time.

A 2.6 on kununu with reviews complaining about unpaid overtime is a stronger signal than anything in the job ad. Surface it in the evaluation.

---

## Filters that only matter in Germany

### Zeitarbeit / Arbeitnehmerüberlassung

Temp-work agencies (**Zeitarbeitsfirmen**, licensed under the AÜG) post listings that look exactly like direct-employer jobs. The candidate would be employed by the agency and leased to the client, usually at lower pay, often without knowing which company they would actually work for.

**Tells:**
- Phrases like „Arbeitnehmerüberlassung", „Personaldienstleister", „im Kundenauftrag", „für unseren Kunden", „unser Mandant"
- No employer named, or only „ein führendes Unternehmen der Branche"
- „Überlassung mit Option auf Übernahme"
- Known agency names: Randstad, Hays, Adecco, Manpower, Brunel, Ferchau, GULP, Orizon, Piening

Not automatically bad — Zeitarbeit is a legitimate route into some industries and some candidates want it. But it must be **labelled**, never presented as a direct role. Default to treating it as a dealbreaker unless the candidate's preferences say otherwise.

### Personalvermittlung vs. direct employer

**Personalvermittler** (recruiting agencies) place you directly with the employer and are paid by them — materially different from Zeitarbeit and usually fine. Tell: „Personalvermittlung", „Direktvermittlung", „im Auftrag unseres Mandanten" combined with a permanent contract at the client.

Label it so the candidate knows who they are talking to, and note that the named contact is a recruiter, not the hiring manager.

### Ghost jobs and scams

Same failure mode as anywhere, with German specifics:
- The same ad reposted monthly for a year → talent-pipelining, not a real opening
- No Impressum on the company site → German law requires one. Its absence on a German commercial site is a genuine red flag
- Requests for payment, „Schulungsgebühr", or bank details before a contract → scam, stop
- Salary far above market with vague duties → scam or MLM
- Gmail/Outlook contact address for a company that has its own domain → verify before applying

### „(m/w/d)"

Required by the AGG for non-discriminatory ads. Its absence is a minor compliance sloppiness signal, not a reason to skip. **Reproduce the job title exactly as advertised, including `(m/w/d)` or `(all genders)`, in the Betreff of the Anschreiben.**

---

## Extraction rules

Job boards are large, dynamic pages. **Never call `get_page_text` on a search results page** — it returns the whole document and can blow out the context window irrecoverably. Use `javascript_tool` with a targeted selector to pull only listing rows, per `shared/references/web-extraction.md`.

Prefer, in order:
1. A structured feed if one exists (Personio XML, the Arbeitsagentur API)
2. `javascript_tool` with a selector scoped to listing elements
3. `read_page` for element refs
4. Asking the user to paste

Cookie banners are unavoidable on German sites (DSGVO). Decline non-essential cookies. Never accept terms or consent on the user's behalf beyond what is needed to read a public listing — and if a banner blocks reading entirely, say so rather than clicking through it silently.
