## Context

Opengrep rule `javascript.lang.security.audit.unsafe-string-comparison` flags `secret !== secretConfirm` as needing timing-safe comparison. However, both values originate from `useState` in the same React Native component — this is a "do your two fields match?" UX validation, not a server-side secret verification.

## Goals / Non-Goals

**Goals:**
- Suppress the false positive so it no longer appears in Codacy findings
- Document the rationale inline for future developers

**Non-Goals:**
- Implementing timing-safe comparison (would be misleading security theater)
- Changing any validation logic

## Decisions

**Use `// nosemgrep` inline suppression**
- Rationale: This is the standard suppression mechanism for Opengrep/semgrep-based rules. Adding it on the flagged line with a justification comment is the least-invasive approach.
- Alternative considered: Codacy dashboard suppression — less visible to developers reading the code.

## Risks / Trade-offs

- [Suppression could mask future real issues on the same line] → Mitigated by the justification comment explaining exactly why this is safe.
