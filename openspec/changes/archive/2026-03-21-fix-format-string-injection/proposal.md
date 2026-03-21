## Why

Codacy/Opengrep flagged non-literal format strings in `src/utils/photoListHelpers.js`. All `console.warn` and `console.error` calls use template literals with interpolated variables, which constitutes a format string injection risk. Variables should be passed as separate arguments instead of being embedded in the format string.

## What Changes

- Replace all template-literal-based `console.warn()` and `console.error()` calls in `src/utils/photoListHelpers.js` with parameterized format strings using `%s` / `%d` substitution tokens
- Covers 11 console statements across `withDevMutationGuards` (4 calls), `createFrozenPhoto` (1 call), and `validateFrozenPhotosList` (6 calls)

## Capabilities

### New Capabilities

- `secure-logging`: Safe console logging patterns that avoid format string injection by using parameterized arguments instead of template literal interpolation

### Modified Capabilities

## Impact

- `src/utils/photoListHelpers.js` — all 11 `console.warn` / `console.error` calls updated
- Dev-only code paths (guarded by `__DEV__` or Proxy handlers) — no production behavior change
- No API, dependency, or system changes
