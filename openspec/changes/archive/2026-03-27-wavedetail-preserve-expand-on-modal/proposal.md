## Why

When a user adds a comment from the WaveDetail screen, the comment modal (`/modal-input`) causes WaveDetail to lose and regain focus. The `useFocusEffect` in WaveDetail resets all expanded photos and reloads the entire photo list on every focus return, collapsing the expanded view the user was interacting with. PhotosList does not have this problem because its `useFocusEffect` only checks T&C acceptance — it never touches expansion state or reloads photos.

## What Changes

- Replace WaveDetail's `useFocusEffect` (which resets `expandedPhotoIds`, pagination, and reloads photos on every focus) with a `useEffect` keyed on `[waveUuid]` so the full reset only happens when navigating to a different wave
- Preserve expanded photo state when returning from modals (comment input, T&C, etc.)
- Keep `handleRefresh` (pull-to-refresh) as the manual reload path

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `wave-detail`: Wave Detail SHALL preserve expanded photo state when returning from a modal overlay, and SHALL only perform a full data reset when the `waveUuid` changes

## Impact

- Modified: `src/screens/WaveDetail/index.js` — replace `useFocusEffect` with `useEffect` for initial load, remove `setExpandedPhotoIds(new Set())` from the load path
