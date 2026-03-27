## Why

When a user adds a comment from a photo expanded in WaveDetail, `router.back()` returns to the PhotosList instead of back to WaveDetail. This is because `modal-input` lives inside the `(tabs)` Stack, so navigating to it from the `waves` Stack crosses navigator boundaries. After submission, `router.back()` pops within `(tabs)`, landing on its index (PhotosList) rather than the originating `waves/[waveUuid]` screen.

## What Changes

- Move `modal-input.tsx` from `app/(drawer)/(tabs)/` to `app/` (root level), making it a navigator-agnostic modal route
- Register it in the root `Stack` with `presentation: 'modal'` so it overlays the current screen regardless of which stack the user is in
- After `router.back()`, the user returns to whichever screen they came from — PhotosList, WaveDetail, or shared photo detail
- Remove the old `modal-input` route from the `(tabs)` Stack layout

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `comments`: The "Comment Input Modal" requirement changes — the modal is now a root-level route with `presentation: 'modal'` instead of a screen within the `(tabs)` stack

## Impact

- Moved file: `app/(drawer)/(tabs)/modal-input.tsx` → `app/modal-input.tsx`
- Modified: `app/_layout.tsx` — register `modal-input` screen with `presentation: 'modal'`
- Modified: `app/(drawer)/(tabs)/_layout.tsx` — remove `modal-input` screen registration
- No changes to the Photo component's `router.push({ pathname: '/modal-input', ... })` — the pathname resolves to the new root-level route automatically
