## Context

After fixing 11 instances in `photoListHelpers.js` (archived as `fix-format-string-injection`), 12 more non-literal format string instances remain across 5 files. The same Opengrep rule (`javascript.lang.security.audit.unsafe-formatstring`) flags all of them. The fix pattern is identical: replace template-literal first arguments with literal strings using `%s`/`%d` tokens and pass variables as subsequent arguments.

## Goals / Non-Goals

**Goals:**
- Eliminate all remaining format string injection findings across the codebase
- Use the same `console.log('message %s', var)` pattern established in `photoListHelpers.js`
- Preserve identical log output and developer experience

**Non-Goals:**
- Adding a logging abstraction or wrapper
- Removing or changing any console statements
- Changing log levels

## Decisions

**Same pattern as photoListHelpers.js fix**
- Rationale: Consistency with the already-archived fix; proven to resolve the Opengrep finding
- All trailing object/error arguments remain as separate arguments after the format string

**Fix all 5 files in a single change**
- Rationale: All 12 instances are the same mechanical transformation — splitting into per-file changes adds overhead with no benefit

## Risks / Trade-offs

- [Minimal risk] → All changes are to diagnostic logging only, no production logic affected
- [12 mechanical edits across 5 files] → Straightforward, same transformation applied uniformly
