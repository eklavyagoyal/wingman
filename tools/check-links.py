#!/usr/bin/env python3
"""Check that the external URLs in the knowledge layer still resolve.

These are links a user is sent to at a decision point - the anabin database
while checking a degree, the Arbeitsagentur job search, a Blue Card salary
threshold. A dead one costs them time exactly when they can least afford it.

Not run in PR CI: the failures are the internet's, not the contributor's.
"""
import re
import sys
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
UA = "Mozilla/5.0 (compatible; wingman-linkcheck/1.0; +https://github.com/eklavyagoyal/wingman)"
SKIP = ("example.com", "example.de", "beispiel.", "localhost", "127.0.0.1", "<", "{", "firma")


def urls():
    found = {}
    for p in sorted(ROOT.rglob("*.md")):
        if any(part in {".git", "node_modules"} for part in p.parts):
            continue
        for m in re.finditer(r"https?://[^\s`)\]\"'>,;]+", p.read_text()):
            u = m.group(0).rstrip(".,;:")
            if any(s in u for s in SKIP):
                continue
            found.setdefault(u, set()).add(str(p.relative_to(ROOT)))
    return found


def check(u):
    for method in ("HEAD", "GET"):
        try:
            req = urllib.request.Request(u, method=method, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=20) as r:
                return u, r.status, ""
        except urllib.error.HTTPError as e:
            # Some hosts refuse HEAD but serve GET; 403 often means bot filtering,
            # not a dead link, so report it without failing the run.
            if method == "HEAD" and e.code in (403, 405, 501):
                continue
            return u, e.code, e.reason
        except Exception as e:  # DNS, TLS, timeout
            if method == "HEAD":
                continue
            return u, None, type(e).__name__
    return u, None, "unreachable"


def main():
    found = urls()
    print(f"checking {len(found)} external URLs\n")
    with ThreadPoolExecutor(max_workers=8) as ex:
        results = list(ex.map(check, found))

    dead, suspect = [], []
    for u, status, err in sorted(results):
        where = ", ".join(sorted(found[u]))
        if status and 200 <= status < 400:
            continue
        # 403/405/429 from a public page is bot filtering, not rot: these hosts
        # serve a browser fine. Report them, do not fail the run on them.
        if status in (403, 405, 429):
            suspect.append(f"  {status} {u}\n        in {where}")
        else:
            dead.append(f"  {status or 'ERR'} {err} {u}\n        in {where}")

    if suspect:
        print("Bot-filtered - serves a real browser, not this checker:")
        print("\n".join(suspect), "\n")
    if dead:
        print("DEAD:")
        print("\n".join(dead))
        return 1
    print("all external links resolve")
    return 0


if __name__ == "__main__":
    sys.exit(main())
