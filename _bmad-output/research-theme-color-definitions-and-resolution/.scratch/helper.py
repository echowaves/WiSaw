"""Scratch helper: peek at blob lines and pre-verify citations using recon_kit's own checks."""

import importlib.util
import re
import sys
from pathlib import Path

REPO = Path("/Users/dmitry/hacks/wisaw/WiSaw")
SPEC = importlib.util.spec_from_file_location(
    "rk", REPO / ".agents/skills/bmad-deep-recon/scripts/recon_kit.py"
)
rk = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(rk)

AT = rk.git(REPO, "rev-parse", "--verify", "--quiet", "044c479b^{commit}").stdout.strip()


def peek(specs):
    for spec in specs:
        path, _, rest = spec.partition(":")
        if not rest:
            print("== %s (missing line spec)" % path)
            continue
        lines = rk.blob_lines(REPO, AT, path)
        if lines is None:
            print("== %s: MISSING at %s" % (path, AT[:8]))
            continue
        for tok in rest.split(","):
            m = re.match(r"(\d+)(?:-(\d+))?$", tok)
            if not m:
                continue
            a, b = int(m.group(1)), int(m.group(2) or m.group(1))
            for n in range(a, min(b, len(lines)) + 1):
                print("%s:%d: %s" % (path, n, lines[n - 1]))
        print()


def verify(stream=sys.stdin):
    bad = 0
    for raw in stream:
        raw = raw.strip()
        if not raw or raw.startswith("#"):
            continue
        m = rk.CODE_CLAIM_RE.search(raw)
        if not m:
            print("NOMATCH %s" % raw)
            bad += 1
            continue
        path, line = m[1], int(m[2])
        end = int(m[3]) if m[3] else None
        sym, sha = m[4].strip(), m[5]
        res = rk.check_code(REPO, AT, sha, path, line, end, sym)
        flag = res["status"]
        if flag in ("incomplete", "missing", "unknown-commit"):
            bad += 1
        rng = "-%s" % end if end else ""
        print(
            "%-9s %s:%d%s (%s) @%s | %r | sym=%s"
            % (flag, path, line, rng, sym, sha[:8], res["line_text"], res["symbol_found"])
        )
    return 1 if bad else 0


if __name__ == "__main__":
    mode, *args = sys.argv[1:]
    if mode == "peek":
        peek(args)
        sys.exit(0)
    sys.exit(verify())
