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

# 5. safety invariants must survive edits
#
# These are the rules that stop the tool doing something irreversible on a
# user's behalf. If someone edits one away, this fails loudly.
INVARIANTS = [
    ("skills/apply/SKILL.md", "Absenden",
     "apply must name the German submit verbs it refuses to click"),
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
    ("shared/references/work-authorization.md", "set every January",
     "Blue Card thresholds must be looked up, never quoted from memory"),
    ("shared/references/zeugnis-code.md", "forgery",
     "zeugnis reference must refuse to alter a third party's signed document"),
    ("skills/zeugnis/SKILL.md", "Never rewrite",
     "zeugnis skill must refuse to rewrite a Zeugnis"),
    ("shared/references/de-documents.md", "lowercase",
     "the lowercase-after-Anrede rule must be documented"),
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
