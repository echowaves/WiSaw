## Why

Tapping the Wave button on a non-own photo crashes the app with `ReferenceError: Property 'showToast' doesn't exist`. `src/hooks/usePhotoActions.js` calls bare `showToast(...)` in 5 places (wave guard, frozen-wave delete/remove guards, wave report success, add/remove success toasts) but only imports the named helpers from `src/utils/showToast.js` — the default export `showToast` is never imported. Every one of these 5 call sites is a latent crash, including the "success" paths of add-to-wave and remove-from-wave.

## What Changes

- `usePhotoActions` toast calls SHALL work: the `showToast` default import from `src/utils/showToast.js` is added (merged into the existing import statements to also resolve the duplicate-import lint errors).
- Tapping Wave on a non-own photo SHALL show the info toast "Only your own photos can be added to waves" without crashing (behavior already specced for the quick-actions modal; now also guaranteed in the expanded photo view).
- `src/hooks/usePhotoActions.js` SHALL pass `ts-standard` lint cleanly (removes pre-existing unused `Alert` import and indentation errors in the same file).

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `expanded-photo-card`: pressing the Wave button on a non-own photo SHALL display an info toast and leave the app in a stable state (no crash, no wave modal opened).

## Impact

- `src/hooks/usePhotoActions.js` — import statements and two indentation fixes; no behavior changes beyond toasts actually appearing.
- Consumers: `src/components/Photo/index.js` (expanded view) and `src/components/QuickActionsModal/index.js` (preview overlay) — both share the hook, so one fix covers both.
- No API, dependency, or backend impact.
