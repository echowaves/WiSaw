## Why

The WavesHub screen currently uses `theme.BACKGROUND` (`#ffffff` light / `#121212` dark), while the PhotosList screen uses `theme.INTERACTIVE_BACKGROUND` (`rgba(234, 94, 61, 0.05)` light / `rgba(234, 94, 61, 0.15)` dark). This creates a jarring visual inconsistency when navigating between the two screens — the waves screen appears as plain white/black while the photo feed has a subtle warm coral tint that provides better contrast with content cards and thumbnails.

## What Changes

- Change the WavesHub container background from `theme.BACKGROUND` to `theme.INTERACTIVE_BACKGROUND` to match the PhotosList screen's background in both dark and light modes

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `theming`: WavesHub screen background token aligned with PhotosList to use `INTERACTIVE_BACKGROUND`

## Impact

- `src/screens/WavesHub/index.js` — single line change to container backgroundColor
