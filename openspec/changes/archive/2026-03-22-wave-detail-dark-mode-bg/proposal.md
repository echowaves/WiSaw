## Why

The WaveDetail screen uses `theme.BACKGROUND` (#121212 in dark mode) for its container, while the theming spec requires all content browsing screens (PhotosList, WavesHub, WaveDetail) to use `theme.INTERACTIVE_BACKGROUND` (#563027 in dark mode). This creates a jarring visual mismatch when navigating between the waves list and a wave's detail view.

## What Changes

- Change WaveDetail container background from `theme.BACKGROUND` to `theme.INTERACTIVE_BACKGROUND` to match WavesHub and PhotosList

## Capabilities

### New Capabilities
_(none)_

### Modified Capabilities
- `theming`: No requirement change needed — the spec already requires WaveDetail to use `INTERACTIVE_BACKGROUND`. This is an implementation compliance fix.

## Impact

- **File**: `src/screens/WaveDetail/index.js` — single line change to container backgroundColor
- No API, dependency, or breaking changes
