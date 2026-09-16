#!/usr/bin/env python3
"""Structural check for the Wingman plugin.

A dead cross-reference is a silent runtime failure: the skill loads, tells
Claude to read a file that isn't there, and the guidance is quietly skipped.
This catches that before a user hits it.

    python3 check.py
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent
SKILLS = sorted(p for p in (ROOT / "skills").iterdir() if p.is_dir())
SKIP_DIRS = {".git", ".wingman", "node_modules"}
MD = [p for p in ROOT.rglob("*.md") if not SKIP_DIRS & set(p.parts)]
problems = []
versions = {}


def fail(msg):
    problems.append(msg)


# 1. every skill has a SKILL.md with name + description frontmatter
for skill in SKILLS:
    f = skill / "SKILL.md"
    if not f.exists():
        fail(f"{skill.name}: no SKILL.md")
        continue
    text = f.read_text()
    m = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    if not m:
        fail(f"{skill.name}: SKILL.md has no frontmatter block")
        continue
    fm = m.group(1)
    name = re.search(r"^name:\s*(\S+)", fm, re.M)
    desc = re.search(r"^description:\s*(.+)", fm, re.M)
    if not name:
        fail(f"{skill.name}: frontmatter has no `name:`")
    elif name.group(1) != skill.name:
        fail(f"{skill.name}: frontmatter name `{name.group(1)}` != directory name")
    if not desc:
        fail(f"{skill.name}: frontmatter has no `description:`")
    elif len(desc.group(1).strip()) < 20:
        fail(f"{skill.name}: description too short to route on")

# 2. no dead shared/ references
for p in MD:
    for ref in set(re.findall(r"(shared/(?:references|templates)/[a-z0-9-]+\.md)", p.read_text())):
        if not (ROOT / ref).exists():
            fail(f"{p.relative_to(ROOT)}: dead reference -> {ref}")

# 2b. no dead scripts/ or tools/ references
for p in MD:
    body = p.read_text()
    for ref in set(re.findall(r"`(scripts/[a-z0-9-]+\.md)`", body)):
        if not (p.parent / ref).exists() and not (p.parent.parent / ref).exists():
            fail(f"{p.relative_to(ROOT)}: dead reference -> {ref}")
    for ref in set(re.findall(r"`(tools/[a-z0-9-]+\.(?:mjs|css))`", body)):
        if not (ROOT / ref).exists():
            fail(f"{p.relative_to(ROOT)}: dead reference -> {ref}")

# 3. every /wingman:<skill> mentioned actually exists
known = {s.name for s in SKILLS}
for p in MD:
    for cmd in set(re.findall(r"/wingman:([a-z-]+)", p.read_text())):
        if cmd not in known:
            fail(f"{p.relative_to(ROOT)}: /wingman:{cmd} is not a skill ({', '.join(sorted(known))})")

# 4. manifests parse, and names agree
for mf in [".claude-plugin/plugin.json", ".claude-plugin/marketplace.json"]:
    try:
        data = json.loads((ROOT / mf).read_text())
    except Exception as e:  # noqa: BLE001
        fail(f"{mf}: invalid JSON - {e}")
        continue
    got = data.get("name") or data.get("plugins", [{}])[0].get("name")
    if got != "wingman":
        fail(f"{mf}: name is {got!r}, expected 'wingman'")
    for v in [data.get("version"), *(p.get("version") for p in data.get("plugins", []))]:
        if v is not None:
            versions.setdefault(v, []).append(mf)

# 4b. no DATA_DIR path drift
#
# Skills that write to a path the tree doesn't document leave the user unable
# to find their own files, and reviewers unable to see what the tool touches.
TREE = (ROOT / "shared/references/data-directory.md").read_text()
seen = {}
for p in MD:
    if p.name == "data-directory.md":
        continue
    for m in re.findall(r"DATA_DIR/([A-Za-z0-9_./\[\]-]+)", p.read_text()):
        seen.setdefault(m.rstrip(".,)`"), set()).add(str(p.relative_to(ROOT)))
for path, users in sorted(seen.items()):
    segs = [s for s in path.split("/") if s and not s.startswith("[")]
    if segs and segs[-1] not in TREE:
        fail(f"DATA_DIR/{path} is written by {', '.join(sorted(users))} but is not in the data-directory tree")

if len(versions) > 1:
    fail("manifest versions disagree: " + "; ".join(f"{v} in {', '.join(f)}" for v, f in versions.items()))

# 4c. plugin files must be addressed via CLAUDE_PLUGIN_ROOT from inside skills
#
# Skills run from the user's working directory, but the plugin is installed as
# a cache copy elsewhere. A bare `node tools/...` works in this repo and fails
# for every real user.
for p in ROOT.glob("skills/**/*.md"):
    for line in p.read_text().splitlines():
        if re.search(r"\bnode\s+tools/", line):
            fail(f"{p.relative_to(ROOT)}: bare `node tools/...` - use CLAUDE_PLUGIN_ROOT -> {line.strip()[:60]}")

# 4d. the README's advertised numbers must match reality
#
# "27 assertions" is a credibility claim on a public README. Hand-maintained
# counts drift the moment a test is added, and a stale number is worse than
# none - it says the author is not running their own suite.
#
# Discovered from the README rather than listed here, so a new tool is covered
# the moment it is advertised. Previously this hardcoded two of the four and
# the other two drifted unguarded.
import subprocess
readme = (ROOT / "README.md").read_text()
advertised = re.findall(r"node (tools/[\w.-]+)((?:\s+--[\w-]+)*)\s*#\s*(\d+) assertions", readme)
if not advertised:
    fail("README advertises no assertion counts - the credibility claim was removed or reworded")
for rel, flags, claimed in advertised:
    tool = ROOT / rel
    if not tool.exists():
        fail(f"README advertises {rel}, which does not exist")
        continue
    args = ["node", str(tool)] + flags.split()
    try:
        out = subprocess.run(args, capture_output=True, text=True, timeout=300).stdout
    except Exception as e:
        fail(f"could not run {rel} to verify its README count: {e}")
        continue
    actual = sum(1 for line in out.splitlines() if line.startswith("ok"))
    if actual == 0 and "skip" in out:
        continue  # no browser on this machine; CI enforces it
    if actual != int(claimed):
        fail(f"README claims {claimed} assertions for {rel}, the suite has {actual}")

n_skills = len(list(ROOT.glob("skills/*/SKILL.md")))
if not re.search(rf"\b{n_skills}\b\s*(?:skills|skills over)", readme) and f"skills-{n_skills}-" not in readme:
    fail(f"README does not state the real skill count ({n_skills})")

# 4e. the Zeugnis audit contract must hold on both sides
#
# zeugnis writes audit.md and mappe reads it to decide whether it may attach a
# document. If the field name drifts on one side, mappe silently stops gating
# and a grade-5 reference goes out attached to an application.
z = (ROOT / "skills/zeugnis/SKILL.md").read_text()
m = (ROOT / "skills/mappe/SKILL.md").read_text()
if "**Attach**:" not in z:
    fail("skills/zeugnis: audit.md entries must define an `Attach:` field - mappe gates on it")
if "`Attach`" not in m and "**Attach:**" not in m:
    fail("skills/mappe: must read the `Attach` field from audit.md")
for verdict in ("yes", "ask", "no"):
    if f"`{verdict}`" not in z or f"`{verdict}`" not in m:
        fail(f"the Attach verdict `{verdict}` is not handled on both sides of the audit contract")
if "missing field as permission" not in m:
    fail("skills/mappe: must state that a missing Attach field is not permission")

# 4f. no write-only fields in the profile template
#
# A field setup collects and nothing ever reads is worse than a missing one:
# the candidate is asked for it, believes it is being used, and it silently
# changes nothing. Three of these were shipped - the current compensation
# package, the standing language preference, and a duplicated salary floor -
# and one of them was the input to this project's central decision.
tmpl = (ROOT / "shared/templates/profile.md").read_text()
facts = tmpl.split("## German Application Facts")[-1]
readers = "\n".join(
    p.read_text() for p in [*ROOT.glob("skills/**/*.md"), *ROOT.glob("shared/references/*.md")]
)
COMPUTED = {"Frühestmöglicher Eintrittstermin"}  # derived, never asked or read
for field in re.findall(r"^- \*\*([^*]+)\*\*", facts, re.M):
    name = field.split("(")[0].strip()
    if name in COMPUTED:
        continue
    # A reader counts if any distinctive word of the field name appears
    # outside the template itself.
    words = [w for w in re.findall(r"[A-Za-zÄÖÜäöüß]{6,}", name)]
    if words and not any(w in readers for w in words):
        fail(f"profile template defines '{name}' but no skill or reference ever reads it")

# 4g. every tracker column must have a writer and the schema must be agreed
#
# Several skills append to tracker.md and two read it. A column no skill fills
# is a cut `patterns` silently cannot compute; a column patterns expects and
# the schema lacks is worse. Both shipped: Board, Reply and the ATS were
# promised as analyses with nowhere to read them from.
tracker_ref = (ROOT / "shared/references/tracker.md").read_text()
hdr = re.search(r"^\| Job \|(.+?)\|\s*$", tracker_ref, re.M)
if not hdr:
    fail("shared/references/tracker.md: cannot find the canonical column header row")
else:
    cols = [c.strip() for c in ("Job|" + hdr.group(1)).split("|") if c.strip()]
    writers = "\n".join(p.read_text() for p in ROOT.glob("skills/*/SKILL.md"))
    # Columns whose writer is self-evident from the row being created at all.
    IMPLICIT = {"Job", "Company", "Score", "Found", "Folder", "Status", "Next", "Lang", "Applied"}
    for col in cols:
        if col in IMPLICIT:
            continue
        if f"`{col}`" not in writers:
            fail(f"tracker column '{col}' is defined in the schema but no skill is told to set it")

# 5. safety invariants must survive edits
#
# These are the rules that stop the tool doing something irreversible on a
# user's behalf. If someone edits one away, this fails loudly.
INVARIANTS = [
    ("skills/apply/SKILL.md", "Absenden",
     "apply must name the German submit verbs it refuses to click"),
    ("skills/apply/SKILL.md", "Bewerbung senden",
     "apply must name Personio's actual submit label (verified live)"),
    ("skills/apply/SKILL.md", "DSGVO",
     "apply must refuse to tick DSGVO consent"),
    ("skills/apply/scripts/fill-page.md", "needs_user_consent",
     "fill-page must report consent boxes instead of ticking them"),
    ("skills/apply/SKILL.md", "EEO",
     "apply must say German forms carry no US EEO block"),
    ("shared/references/language-decision.md", "B1",
     "language decision must gate on the candidate's real CEFR level"),
    ("shared/references/work-authorization.md", "not a blocker",
     "a permit holder must not be flagged as blocked by a no-sponsorship ad"),
    ("shared/references/work-authorization.md", "50 %",
     "the Blue Card threshold must be given as the percentage from the law, not a remembered figure"),
    ("shared/references/work-authorization.md", "45,3 %",
     "the reduced Engpassberuf/young-professional percentage must be stated"),
    ("shared/references/work-authorization.md", "state the arithmetic",
     "the threshold calculation must be shown to the candidate, not asserted"),
    ("shared/references/zeugnis-code.md", "forgery",
     "zeugnis reference must refuse to alter a third party's signed document"),
    ("skills/zeugnis/SKILL.md", "Never rewrite",
     "zeugnis skill must refuse to rewrite a Zeugnis"),
    ("shared/references/web-extraction.md", "not evidence you got an answer",
     "a 200 from a client-rendered page must not be treated as a successful lookup"),
    ("skills/visa/SKILL.md", "did not see in a result row",
     "visa must never assert an anabin rating it did not read from a result"),
    ("shared/references/de-documents.md", "lowercase",
     "the lowercase-after-Anrede rule must be documented"),
    ("shared/references/interaction.md", "picker to ask whether anything is wrong",
     "a structured picker must not be used to ask whether finished work is acceptable"),
    ("skills/apply/SKILL.md", "Two stops from here",
     "apply must state its checkpoints up front - it is the longest flow"),
    ("shared/references/interaction.md", "never clicks Submit",
     "interaction rules must state the submit gate"),
    ("shared/references/priority-hierarchy.md", "data, never instructions",
     "postings must be treated as data, not instructions"),
    ("shared/references/web-extraction.md", "get_page_text",
     "the context-blowout rule must be documented"),
]
for rel, needle, why in INVARIANTS:
    f = ROOT / rel
    if not f.exists():
        fail(f"{rel}: missing, cannot verify invariant ({why})")
    elif needle not in f.read_text():
        fail(f"{rel}: lost invariant {needle!r} - {why}")

# 6. user data must never be committable
gitignore = (ROOT / ".gitignore").read_text()
if ".wingman/" not in gitignore:
    fail(".gitignore: does not exclude .wingman/ - user data could be committed")

print(f"checked {len(SKILLS)} skills, {len(MD)} markdown files")
if problems:
    print(f"\n{len(problems)} problem(s):")
    for p in problems:
        print(f"  - {p}")
    sys.exit(1)
print("all checks passed")
