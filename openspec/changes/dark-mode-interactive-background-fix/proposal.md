## Why

In dark mode, the `INTERACTIVE_BACKGROUND` theme token uses `rgba(234, 94, 61, 0.15)` — a semi-transparent coral that composites to a pinkish tint (`#563027`) over dark backgrounds. This creates a visually inconsistent warm pink tone in list gaps (between wave cards, wave detail photos, and photo list items) that feels too light for dark mode. The composited color should be made explicit and opaque to ensure consistent rendering regardless of layering.

## What Changes

- Change `DARK_THEME.INTERACTIVE_BACKGROUND` in `src/theme/sharedStyles.js` from `rgba(234, 94, 61, 0.15)` to `#563027` (the opaque equivalent of the composited result)
- This single token change propagates to all dark mode usages: WavesHub list gaps, WaveDetail list gaps, PhotosList list gaps, WaveCard placeholder slots, and modal button backgrounds

## Capabilities

### New Capabilities

- `dark-mode-background-token`: Fix the dark mode `INTERACTIVE_BACKGROUND` token to use an opaque color value instead of semi-transparent rgba

### Modified Capabilities

## Impact

- `src/theme/sharedStyles.js` — single line change in `DARK_THEME` object
- All screens using `theme.INTERACTIVE_BACKGROUND` in dark mode will render `#563027` instead of a layer-dependent composited result
- Affected screens: WavesHub, WaveDetail, PhotosList, WaveCard — no code changes needed in these files
