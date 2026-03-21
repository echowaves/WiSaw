## Why

WaveDetail and Waves screens lack the `LinearProgress` loading bar that PhotosList uses. WaveDetail shows a large centered spinner only when no photos are loaded; Waves has no list-level loading indicator at all. This creates an inconsistent UX — users see a smooth animated progress bar in the main feed but get different (or no) feedback in wave screens.

## What Changes

- Add `LinearProgress` bar to WaveDetail, shown whenever `loading` is true, matching the PhotosList pattern (3px animated bar at the top of the content area)
- Remove the centered `ActivityIndicator` from WaveDetail (replacing it with the `LinearProgress` bar for consistency)
- Add `LinearProgress` bar to Waves list screen, shown whenever `loading` is true

## Capabilities

### New Capabilities
_(none)_

### Modified Capabilities
- `wave-detail`: Add loading progress bar requirement matching the PhotosList `LinearProgress` pattern; remove the centered `ActivityIndicator` spinner
- `wave-hub`: Add loading progress bar requirement for the waves list screen

## Impact

- `src/screens/WaveDetail/index.js` — add `LinearProgress` import, add progress bar JSX, remove `ActivityIndicator` for loading state
- `src/screens/Waves/index.js` — add `LinearProgress` import, add progress bar JSX
- No new dependencies — `LinearProgress` component already exists at `src/components/ui/LinearProgress.js`
