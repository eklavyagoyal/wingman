# Prerequisites by Skill

Check before proceeding. If a required file is missing, show the message and stop — do not improvise around missing data.

| File | setup | job-search | evaluate | tailor-cv | anschreiben | mappe | apply | zeugnis | network-scan | tracker | interview-prep | followup | visa |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| `resume/*` | — | req | req | req | req | req | req | — | req | — | req | — | — |
| `preferences.md` | — | req | req | — | — | — | — | — | req | — | — | — | — |
| `profile.md` | — | rec | req | **req** | **req** | — | rec | — | rec | — | req | — | req |
| `language.md` (job) | — | — | — | req | req | req | req | — | — | — | — | — | — |
| `contacts.csv` | — | opt | — | — | — | — | — | — | req | — | — | — | — |
| `zeugnisse/*` | — | — | — | opt | — | rec | opt | req | — | — | — | — | — |
| `application-data.md` | — | — | — | — | — | — | created | — | — | — | — | — | — |
| `tracker.md` | — | created | created | — | — | — | updated | — | — | req | — | req | — |

`req` required · `rec` recommended, warn and continue · `opt` used if present · `created` made if absent

## Messages

- **Resume missing** → "Run `/paperwork:setup` first so I have your CV."
- **Preferences missing** → "Run `/paperwork:setup` first to set target roles and dealbreakers."
- **Profile missing, tailor-cv / anschreiben** → **Blocking.** Without a profile there is nothing to write from except the CV text, and the output will be thin and full of guesses. Say so and run the setup interview instead. This is stricter than most tools on purpose: a German application built on assumptions produces corrections you will be making for the next twenty applications.
- **Profile missing, evaluate** → Blocking. Scoring a role against an unknown candidate produces a number that means nothing.
- **`language.md` missing** → Not an error. Run the language decision (`shared/references/language-decision.md`) and write it.
- **German level missing from profile** → Blocking for any German-language application. Ask for it, store it. The honesty gate in `language-decision.md` depends on it.
- **Contacts missing** → "No contacts imported. Run `/paperwork:setup` and export your LinkedIn or Xing connections first."
- **Zeugnisse missing, mappe** → Warn: German employers expect Zeugnisse in the Mappe. Offer to write `Zeugnisse werden auf Wunsch nachgereicht` in the Anlagen line instead.
