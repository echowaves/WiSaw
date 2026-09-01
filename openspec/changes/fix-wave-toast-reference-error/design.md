## Context

`src/hooks/usePhotoActions.js` calls bare `showToast(...)` in 5 places but imports only the named helpers from `src/utils/showToast.js` (whose main export is `export default function showToast`). All 5 sites throw `ReferenceError` at runtime. `ts-standard` already flags all of them (`no-undef`) plus duplicate imports and an unused `Alert` import in the same file — the lint config is fine; the file just shipped un-linted.

## Goals / Non-Goals

**Goals:**
- All 5 `showToast` call sites in `usePhotoActions` resolve to the real utility.
- `src/hooks/usePhotoActions.js` lints clean under `ts-standard`.

**Non-Goals:**
- Changing Wave button interaction semantics (toast-guarded, still tappable — the quick-actions-modal spec pins the toast behavior).
- ESLint/ts-standard configuration changes.
- Adding `disabled` to the Wave button in `PhotoActionButtons`.

## Decisions

**1. Add the default import, merged into one import statement.**
`import showToast, { showInfoToast, showSuccessToast, showErrorToast } from '../utils/showToast'` — one statement covering default + all named helpers. Alternatives considered:
- A separate `import showToast from ...` line — rejected: `import/no-duplicates` flags two imports from the same module; the file already has two named-import lines to merge.
- Switching call sites to `showInfoToast`/`showSuccessToast` shorthands — rejected: more churn; the default export with `{ type }` option is the documented usage in `showToast.js`'s header comment.

**2. Clean the other lint errors in the same file while there.**
Remove the unused `Alert` import; fix the two indentation errors at lines ~97/99. Same file, trivial, keeps `npm run lint` green for this file.

**3. No hook consumer changes.**
`Photo/index.js` and `QuickActionsModal/index.js` both consume `usePhotoActions`; fixing the hook fixes both views.

**4. Include the two sibling modal files (scope expansion, user-approved).**
Project-wide lint (`npm run lint`) during implementation found the identical bug in `ShareOptionsModal.js:47` (friendship share success) and `WaveShareModal.js:90` (wave share success). Both import `showErrorToast` from the separate `utils/showErrorToast.js` but call bare `showToast`. Fix: add `import showToast from '../utils/showToast'` to each (kept as a separate line — these files import only the error util from the toast family, so no merge needed). User approved folding them into this change.

## Risks / Trade-offs

- [More files with the same pattern found later] → `npm run lint` is the standing net; remaining project-wide no-undef hits are `__DEV__` globals (2 files) and missing jest env in a test file — different class, out of scope.
- [Behavior change: success toasts will now actually appear] → Intended; previously these paths crashed mid-flow.
