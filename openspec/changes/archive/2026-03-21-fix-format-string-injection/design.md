## Context

`src/utils/photoListHelpers.js` contains 11 `console.warn` / `console.error` calls that use ES6 template literals with interpolated variables. Codacy/Opengrep flags these as format string injection risks because the resulting string is non-literal at call time. All affected code paths are dev-only (inside `__DEV__` guards or Proxy traps).

## Goals / Non-Goals

**Goals:**
- Eliminate all format string injection findings in `photoListHelpers.js`
- Pass variables as separate `console` arguments using `%s` / `%d` format tokens
- Preserve identical log output and developer experience

**Non-Goals:**
- Adding a logging abstraction or utility wrapper
- Changing log levels or removing any console statements
- Addressing console statements in other files (scoped to this one file)

## Decisions

**Use `console.warn('message %s', var)` pattern over string concatenation**
- Rationale: Native `console` API supports `%s` (string), `%d` (number) substitution — this is the idiomatic fix recommended by Opengrep rule `javascript.lang.security.audit.unsafe-formatstring`
- Alternative considered: String concatenation with `+` — still produces a non-literal first argument and doesn't fully resolve the finding
- Alternative considered: Tagged template literal helper — over-engineered for dev-only diagnostics

**Keep trailing object arguments as-is**
- Several `console.warn` calls pass a trailing object (e.g., `{ width, height }`). These remain as the last argument after the format string and substitution values, which `console` renders correctly.

## Risks / Trade-offs

- [Minimal visual difference in some JS engines] → Console output with `%s`/`%d` is functionally identical in React Native's Hermes/JSC and browser consoles. No mitigation needed.
- [11 mechanical changes in one file] → Low risk since all paths are dev-only and the transformation is straightforward.
