## Why

Photo thumbnails support long-press to open the QuickActionsModal, but there is no visual affordance indicating this. Users must discover the interaction by accident. The wave merge feature introduced a ⋮ icon + tooltip pattern on WaveCards that proved effective — this change brings the same discoverability pattern to photo thumbnails.

## What Changes

- Add a semi-transparent dark ⋮ pill overlay to every photo thumbnail (top-right corner), tappable as a shortcut to QuickActionsModal
- Add a one-time hint banner at the top of the main photo feed ("Long-press any photo for quick actions") with a dismiss button, persisted via SecureStore
- Banner appears only on the main feed screen, not on wave detail or other photo-showing screens

## Capabilities

### New Capabilities
- `photo-thumb-context-hint`: Visual discoverability for photo thumbnail long-press — ⋮ pill overlay on thumbnails and one-time hint banner on the main feed

### Modified Capabilities
- `quick-actions-modal`: Add ⋮ tap as an additional trigger (currently only long-press opens the modal)

## Impact

- `src/components/ExpandableThumb/index.js` — add ⋮ pill overlay with tap handler
- Main feed screen component — add hint banner with SecureStore-persisted dismissal
- No new dependencies, no API changes, no breaking changes
