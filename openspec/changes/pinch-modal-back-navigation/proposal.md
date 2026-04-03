## Why

The pinch/zoom photo view (`pinch.tsx`) lives inside the `(tabs)` stack at `app/(drawer)/(tabs)/pinch.tsx`. When users tap a photo from screens **outside** this stack — Bookmarks, Wave Detail, or Friend Detail — and then press the back button, they land on the home screen (tabs index) instead of returning to the screen they came from. This breaks expected navigation behavior.

## What Changes

- Move `pinch.tsx` from `app/(drawer)/(tabs)/` to `app/` as a root-level route
- Register the pinch screen in the root `_layout.tsx` with `presentation: 'fullScreenModal'`
- Remove the pinch screen entry from the `(tabs)` stack layout
- `router.back()` from the pinch modal will now correctly return to origin regardless of which screen pushed it

## Capabilities

### New Capabilities
- `pinch-modal-navigation`: Root-level modal presentation for the pinch/zoom photo view, ensuring back navigation always returns to the originating screen

### Modified Capabilities

## Impact

- `app/(drawer)/(tabs)/pinch.tsx` — deleted (moved to root)
- `app/pinch.tsx` — new file (same content)
- `app/_layout.tsx` — add pinch screen to root Stack
- `app/(drawer)/(tabs)/_layout.tsx` — remove pinch Stack.Screen entry
- `src/components/Photo/ImageView.js` — no change needed (already uses absolute `/pinch` path)
- `src/components/Photo/PinchableView.js` — no change needed (already uses `router.back()`)
- Animation changes: pinch view will slide up as a modal instead of pushing from the right
