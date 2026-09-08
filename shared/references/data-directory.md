# Data Directory

All user data lives in a `.paperwork/` folder. It is never committed — see `.gitignore`.

## Resolution

1. Check the current working directory for `.paperwork/` — use it if found
2. Check `~/.paperwork/` — use it if found
3. If neither exists:
   - **setup skill**: fresh install, create it
   - **every other skill**: tell the user to run `/paperwork:setup` first, then stop

If the working directory looks like an ephemeral session path (e.g. `/sessions/...`), stop and tell the user to select a persistent folder first — otherwise their data vanishes when the session ends. Do not proceed.

`DATA_DIR` below means whichever `.paperwork/` was found or created.

## Tree

```
DATA_DIR/
  resume/                    # original CV as provided (PDF / DOCX / MD)
    resume.md                # written here when the user pastes text instead
  profile.md                 # work history + German-specific facts
  preferences.md             # matching rules, dealbreakers, salary floor
  application-data.md        # cached form answers
  zeugnisse/                 # Arbeitszeugnisse + Abschlusszeugnisse
    audit.md                 # decoded grades per zeugnis-code.md
  contacts.csv               # LinkedIn / Xing connection export
  tracker.md                 # single source of truth for applications
  job-history.md             # raw search log, every job ever seen
  patterns.md                # what is actually working, from /paperwork:patterns
  jobs/
    <company-slug>-<date>/
      posting.md             # the fetched ad, employer URL at the top
      evaluation.md          # A-H report + 1-5 score
      language.md            # the language decision, and why
      resume-de.md           # Lebenslauf      (if German)
      resume-en.md           # CV              (if English)
      anschreiben-de.md      # DIN 5008 letter (if German)
      cover-letter-en.md     # cover letter    (if English)
      bewerbungsmappe.pdf    # assembled single PDF, if the employer wants one
                             #   (-de.pdf / -en.pdf when both languages were built)
      interview-prep.md      # questions, stories, and prep notes for this role
      applied.md             # what was submitted, when, and how
```

## Rules

- **One folder per job.** Slug from the employer name plus the date the job was found.
- **`language.md` is written before any document is generated** and read by every skill afterwards.
- **Never modify `resume/`.** It is the source of truth the user provided. Tailored output goes in the job folder.
- **Corrections to facts about the candidate go into `profile.md` immediately**, so the same mistake is not made on the next application.
