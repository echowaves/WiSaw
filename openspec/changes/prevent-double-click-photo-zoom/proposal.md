## Why

Double-clicking on a photo thumbnail in the feed causes the zoomed/pinch view to open unintentionally. Each tap in the double-click fires the `TapGestureHandler`, triggering navigation to `/pinch` for both taps. This creates a jarring UX where users who double-tap (even accidentally) see the zoom modal appear.

## What Changes

- Add debounce logic to `ImageView`'s `onSingleTapEvent` handler to prevent rapid successive taps from triggering zoom navigation
- Only the first tap of a double-click sequence will navigate to the zoom view; subsequent taps within a 500ms window are ignored
- No behavioral changes to the zoom view itself (`PinchableView`) or any other photo interaction

## Capabilities

### New Capabilities
- `photo-tap-debounce`: Prevents rapid successive taps from triggering photo zoom navigation, filtering out double-clicks while preserving single-tap behavior

### Modified Capabilities
<!-- None — no existing spec-level requirements are changing -->

## Impact

- `src/components/Photo/ImageView.js` — the tap handler that triggers zoom navigation
- Photos are rendered via `ExpandableThumb` → `ImageView`, so this affects all photo thumbnails in the feed, wave detail, friend feeds, and shared photo screens
- No API, GraphQL, or state changes
- No new dependencies