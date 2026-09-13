/**
 * Complete inventory of an application form. Run via `javascript_tool`.
 *
 * This exists because `read_page` is not a reliable inventory. Against a
 * plain HTML Personio-shaped form it returned 8 of 15 controls, silently
 * omitting every select, file input, radio and checkbox - which is to say,
 * exactly the controls carrying the DSGVO consent and the Schwerbehinderung
 * question. A skill that scouts with `read_page` alone never learns those
 * exist, so it cannot report them to the user, and "never tick a consent box"
 * becomes true only by accident.
 *
 * Use both: this for the inventory, `read_page` for the refs you interact
 * with. Where the two disagree, this one is right about what exists.
 *
 * Returns JSON. Never writes to the page.
 */
(() => {
  const norm = (s) => String(s || "").replace(/\s+/g, " ").trim();

  // The full label, never truncated: German forms mark required with a
  // trailing "* (erforderlich)", so cutting the label hides the marker.
  const labelFor = (el) => {
    if (el.id) {
      const l = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
      if (l) return norm(l.innerText || l.textContent);
    }
    const wrap = el.closest("label");
    if (wrap) return norm(wrap.innerText || wrap.textContent);
    if (el.getAttribute("aria-label")) return norm(el.getAttribute("aria-label"));
    const lb = el.getAttribute("aria-labelledby");
    if (lb) {
      const t = lb.split(/\s+/).map((id) => document.getElementById(id)).filter(Boolean)
        .map((n) => norm(n.innerText)).join(" ");
      if (t) return t;
    }
    const fs = el.closest("fieldset");
    const lg = fs && fs.querySelector("legend");
    if (lg) return norm(lg.innerText);
    return "";
  };

  // Personio marks required in the label text while leaving the DOM attribute
  // false on every field. Trusting el.required reads the form as fully optional.
  const REQUIRED = /\*|\(erforderlich\)|erforderlich|pflichtfeld|required|obligatoire/i;

  const CONSENT = /datenschutz|dsgvo|gdpr|einwillig|zustimm|privacy|terms|agb|consent|verarbeitung meiner daten/i;
  const VOLUNTARY = /schwerbehind|behinderung|gleichstell|geschlecht|gender|ethnic|race|veteran|disability/i;

  const groups = {};
  const fields = [];

  for (const el of document.querySelectorAll("input, select, textarea")) {
    if (el.type === "hidden") continue;
    const style = getComputedStyle(el);
    const hidden = style.display === "none" || style.visibility === "hidden" || el.offsetParent === null;
    const label = labelFor(el);
    const type = el.type || el.tagName.toLowerCase();

    // Radios and checkboxes sharing a name are one question, not N fields.
    if ((type === "radio" || type === "checkbox") && el.name) {
      const g = (groups[el.name] ||= {
        name: el.name, type, kind: "group", options: [], groupLabel: "",
        required: false, hidden: true, anyChecked: false,
      });
      g.options.push({ value: el.value, label, checked: el.checked });
      g.anyChecked ||= el.checked;
      g.hidden &&= hidden;
      const fs = el.closest("fieldset, .radios, .consent, div");
      const near = fs ? norm(fs.innerText).slice(0, 160) : label;
      if (near.length > g.groupLabel.length) g.groupLabel = near;
      g.required ||= REQUIRED.test(label) || REQUIRED.test(near);
      continue;
    }

    fields.push({
      name: el.name || el.id || null,
      type,
      label,
      // Reported separately on purpose: where they disagree, the label wins.
      requiredByLabel: REQUIRED.test(label),
      requiredByAttribute: !!el.required,
      value: type === "file" ? `${el.files ? el.files.length : 0} file(s)` : (el.value || ""),
      options: el.tagName === "SELECT"
        ? [...el.options].map((o) => ({ value: o.value, label: norm(o.text) })) : undefined,
      multiple: el.multiple || undefined,
      accept: el.accept || undefined,
      placeholder: el.placeholder || undefined,
      hidden: hidden || undefined,
    });
  }

  const all = [...fields, ...Object.values(groups)];
  const submits = [...document.querySelectorAll(
    'button, input[type=submit], [role=button], a.btn'
  )].map((b) => norm(b.innerText || b.value)).filter(Boolean);

  const SUBMIT_WORDS = /^(bewerbung senden|jetzt bewerben|absenden|senden|abschicken|submit|send application|apply|weiter|save and continue|speichern und weiter)$/i;

  return JSON.stringify({
    url: location.href,
    counts: {
      total: all.length,
      requiredByLabel: all.filter((f) => f.requiredByLabel || f.required).length,
      requiredByAttribute: fields.filter((f) => f.requiredByAttribute).length,
    },
    // Never fill these two. Report them and let the candidate decide.
    consent: Object.values(groups).filter((g) => CONSENT.test(g.groupLabel) || g.options.some((o) => CONSENT.test(o.label))),
    voluntary: Object.values(groups).filter((g) => VOLUNTARY.test(g.groupLabel) || g.options.some((o) => VOLUNTARY.test(o.label))),
    uploads: fields.filter((f) => f.type === "file"),
    fields: all,
    submitButtons: submits,
    // Buttons that would send the application. Never click one of these.
    submitLike: submits.filter((s) => SUBMIT_WORDS.test(s)),
  }, null, 1);
})()
