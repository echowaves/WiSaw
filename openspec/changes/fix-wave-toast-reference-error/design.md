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

## Risks / Trade-offs

- [Other files may have the same missing-default-import pattern] → `ts-standard` catches `no-undef` project-wide; a full `npm run lint` run during verification surfaces any siblings. If more files fail, surface and scope rather than silently expanding.
- [Behavior change: success toasts will now actually appear] → Intended; previously these paths crashed mid-flow.
