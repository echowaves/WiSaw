## Why

The friend detail photo feed renders photos using the same `PhotosListMasonry` and `ExpandableThumb` components as the main feed, but the long-press and kebab menu (⋮) interactions are non-functional. Long-pressing a photo or tapping its kebab menu only triggers haptic feedback — no `QuickActionsModal` appears. Users expect the same photo action experience (preview + action buttons) across all photo feeds.

## What Changes

- Wire up `QuickActionsModalWrapper` in the `FriendDetail` screen so long-press and kebab menu taps open the quick-actions modal with photo preview and action buttons
- Handle `onPhotoDeleted` to remove deleted photos from the local feed state

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `friend-photo-feed`: Add requirement for quick-actions modal support on long-press and kebab menu tap, matching the main photo feed behavior

## Impact

- `src/screens/FriendDetail/index.js` — add `QuickActionsModalWrapper` ref, update `handlePhotoLongPress`, render modal component
- No new dependencies — `QuickActionsModalWrapper` is already used by other screens
