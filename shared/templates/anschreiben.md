# Anschreiben Template (DIN 5008)

Skeleton for a German application letter. Rules in `shared/references/de-documents.md`.
**One page. Never two.**

---

```
[Vorname Nachname]
[Straße und Hausnummer]
[PLZ Ort]
[Telefon]
[E-Mail]


[Firma]
[Abteilung, falls genannt]
[Ansprechpartner:in, falls genannt]
[Straße und Hausnummer]
[PLZ Ort]

                                                    [Ort], [TT. Monat JJJJ]


**Bewerbung als [Stellentitel exakt wie ausgeschrieben, inkl. (m/w/d)][, Kennziffer XXXX]**


[Anrede],

[erstes Wort klein — der Satz setzt die Anrede fort. Einstieg: warum
diese Rolle bei diesem Unternehmen. Konkret, kein "hiermit bewerbe ich
mich auf die ausgeschriebene Stelle".]

[Absatz 2: Nachweis. Die stärkste Erfahrung, gemappt auf die
Anforderungen aus der Anzeige. Zahlen, wo es sie gibt.]

[Absatz 3: Nachweis oder Motivation. Zweiter Beleg, oder warum dieses
Unternehmen.]

[Absatz 4: Abschluss.
 - Gehaltsvorstellung: nur wenn die Anzeige danach fragt.
   "Meine Gehaltsvorstellung liegt bei [X].000 EUR brutto p. a."
 - Eintrittstermin, realistisch nach Kündigungsfrist:
   "Verfügbar bin ich ab dem [Datum]."
 - "Über eine Einladung zu einem persönlichen Gespräch freue ich mich."]


Mit freundlichen Grüßen



[Vorname Nachname]


Anlagen
Lebenslauf
[Arbeitszeugnisse]
[Abschlusszeugnis]
```

---

## Fill rules

| Placeholder | Source |
|---|---|
| Sender block | `profile.md` → Persönliche Daten |
| Recipient + Ansprechpartner | the posting. No name findable → omit the line, use `Sehr geehrte Damen und Herren,` |
| Ort, Datum | candidate's city, today |
| Betreff | job title **exactly as advertised**, including `(m/w/d)`, plus Kennziffer if given |
| Anrede | `Sehr geehrte Frau [Nachname],` / `Sehr geehrter Herr [Nachname],` / `Sehr geehrte Damen und Herren,` — or `Hallo [Name],` when the ad uses "du". Register from `language.md`. |
| Body | `profile.md` + the posting's requirements |
| Gehaltsvorstellung | `profile.md` → only if the ad asks |
| Eintrittstermin | today + Kündigungsfrist from `profile.md` |
| Anlagen | what actually exists in `DATA_DIR/zeugnisse/`. Nothing there → `Zeugnisse werden auf Wunsch nachgereicht` |

## Traps

- **Do not write `Betreff:`** — the label is obsolete.
- **No comma after `Mit freundlichen Grüßen`.**
- **First body word lowercase** unless it is a noun or "Ich".
- **No em dashes.** Use commas, colons, or parentheses.
- **Never a template opener.** "Hiermit bewerbe ich mich auf die von Ihnen ausgeschriebene Stelle" says nothing and marks the letter as mass-produced.
- **Formal ≠ stiff.** Natural German. Short sentences, active verbs, avoid Passiv. Do not force German words for established technical terms — Stack, Deployment, Pipeline and Embedding stay as they are.
- **Never translate an English letter.** Write it in German from the profile. A translated Anschreiben reads translated.
