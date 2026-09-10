# Contributing

Wingman is mostly instruction files. Contributing means correcting a German convention, hardening a skill against a real form, or fixing the renderer. All three are welcome; the first is the most valuable.

## The two things that matter most

**Corrections from people who hire in Germany.** If a claim in `shared/references/` is wrong or outdated, open [a convention issue](https://github.com/eklavyagoyal/wingman/issues/new?template=wrong-convention.yml). Quote the claim, say what is correct, say how you know. Experience counts — just label it as experience.

**Reports from real application forms.** The ATS notes in `shared/references/ats.md` are structural, not element-level, and the German systems have not been driven live by the maintainer. If `/wingman:apply` stumbled on Personio, softgarden, SuccessFactors or Interamt, [say where](https://github.com/eklavyagoyal/wingman/issues/new?template=form-filling-failed.yml). Describe the field, never its value.

## The dev loop

The installed plugin is a **cache copy**, not a link to your checkout. Edits do not reach it until you tell Claude Code to refresh.

```bash
# 1. edit, then verify the repo is still coherent
python3 check.py                  # structure, dead links, DATA_DIR drift, safety invariants
node tools/mappe.mjs --selftest   # the PDF renderer

# 2. push the installed copy forward
claude plugin marketplace update wingman
claude plugin update wingman@wingman
# 3. restart Claude Code - skills load at session start
```

If you skip step 2 you will be testing the old version and wondering why nothing changed. The maintainer has done this.

## Adding or changing a skill

Every skill is `skills/<name>/SKILL.md` with frontmatter (`name` must equal the directory name; `description` must be specific enough to route on). Then:

- If it reads or writes user data, add it to the table in `shared/references/prerequisites.md` and make sure every `DATA_DIR/...` path it touches appears in the tree in `shared/references/data-directory.md`. `check.py` fails otherwise.
- If it runs a file that ships in the plugin, address it as `"${CLAUDE_PLUGIN_ROOT}/..."`, never as a bare repo-relative path. Skills run from the user's working directory; the plugin lives elsewhere. `check.py` fails on a bare `node tools/`.
- Decisions with a small set of real options go through `AskUserQuestion` per `shared/references/interaction.md`. Ask once, store the answer, never re-ask.
- Anything that submits, sends, uploads, or consents stops and waits for the user. No exceptions, including "the user said just do it".

## What will not be merged

- **Weakening a safety invariant.** `check.py` guards the never-submit, never-consent, never-inflate rules. A PR that edits one away will be closed, however good the reason sounds.
- **A German convention with no source.** "It's how we do it" is a fine source if you say who "we" is. A guess is not.
- **Fabrication in a fixture.** Test profiles are fictional but internally consistent. Do not invent a metric the fixture CV does not support — the skills are supposed to refuse that, and a fixture that contradicts itself hides the bug.
- **Real personal data.** No real Zeugnisse, CVs, or salary figures anywhere in the repo, in an issue, or in a fixture.

## Style

Plain language. Short sentences. No em dashes in anything a candidate might paste into an application (`de-documents.md` explains why). German text is written as natural Tech-Deutsch, never translated from English.

MIT. By contributing you agree your contribution is licensed the same way.
