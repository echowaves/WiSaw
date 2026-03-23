## Why

The reusable `ActionMenu` component lacks an explicit close button. Users can only dismiss it by tapping the background overlay, which is not discoverable. Other modals in the app (`WaveSelectorModal`, `MergeWaveModal`) include a visible close (×) button in the upper-right corner of the header. Adding the same pattern to `ActionMenu` improves consistency and discoverability.

## What Changes

- Add a close button (Ionicons `close` icon, 24px) to the upper-right corner of the `ActionMenu` card
- Reuse the same close-button pattern from `WaveSelectorModal` / `MergeWaveModal` (icon, hitSlop, theme color)
- The close button always renders, regardless of whether a `title` prop is provided
- Tapping the close button calls the existing `onClose` callback

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `action-menu`: Adding a close button to the card header as a new dismiss affordance

## Impact

- **Code**: `src/components/ActionMenu/index.js` — layout change to card header, new Ionicons import
- **Consumers**: No API change — `onClose` prop already exists, no new props needed
- **Dependencies**: Ionicons already bundled (loaded in `_layout.tsx`)
