# Reading Job Pages Without Blowing Up

Job boards and careers pages are among the worst pages on the web to read programmatically: infinite-scroll listings, cookie walls, SPA hydration, and footers carrying a hundred unrelated links. Getting this wrong is not a small error — pulling a full listings page into context can end the session.

## The rule

**Never call `get_page_text` on a listings, search-results, or dashboard page.** It returns the entire document. One StepStone results page or one Arbeitsagentur search can exhaust the context window, and the conversation does not recover.

`get_page_text` is safe only on a page that is a single article or a single job posting, and even then prefer a scoped extraction.

## Preference order

1. **A structured feed, if one exists.** Personio tenants often expose a public XML jobs feed; the Bundesagentur für Arbeit has a Jobsuche API. A feed is cheaper, more stable, and better-formed than any scrape. Always check for one first.
2. **`javascript_tool` with a selector** scoped to the elements you actually want. Return a joined string of listing rows, capped in both count and per-item length:

   ```javascript
   Array.from(document.querySelectorAll('[class*="job"], [class*="listing"], [class*="card"], article, [role="listitem"]'))
     .slice(0, 50)
     .map(el => el.innerText.trim())
     .filter(t => t.length > 20 && t.length < 500)
     .join('\n---\n')
   ```

   If that generic selector misses, take one screenshot to understand the layout, then write a selector for that specific site. Do not iterate blindly.
3. **`read_page`** when you need element refs for interaction rather than text for reading.
4. **Ask the user to paste it.** Not a failure — often the fastest path.

For a single posting, scope to the description container rather than the page:

```javascript
document.querySelector('[class*="description"], [class*="content"], article, main')?.innerText
```

## Tab setup

`tabs_context` to see the browser state, `tabs_create` for a new tab, `navigate` to the target, then extract. If `tabs_context` returns nothing, ask the user to confirm the browser extension is active rather than retrying.

## Cookie walls

Unavoidable on German sites under the DSGVO, and they frequently block the content entirely until dismissed.

- **Decline non-essential cookies.** Always the narrower choice.
- Never accept terms, create an account, or grant a permission to get at a listing.
- If the wall cannot be dismissed without consenting to something beyond reading a public page, **stop and say so.** Do not click through consent silently on the user's behalf and then report success.

## Failure handling

- **One retry, maximum.** A page that fails twice is not going to work on the third attempt.
- When a page fails, say **which** page and **why**, then ask for a paste. A silently skipped board makes a thin result set look like an empty market.
- When a whole board fails, report it in the results summary. The user needs to know the search covered four boards and not six.
- Never fill a gap in extracted data with a plausible guess. A job with an invented salary range is worse than a job with no salary range.
