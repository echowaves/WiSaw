## Why

The Waves Hub was recently changed to a single-column full-width layout with horizontal photo strips, which works well on phones but wastes horizontal space on tablets and wider screens. Adding responsive column count based on screen width ensures the layout looks good across all device sizes.

## What Changes

- Dynamically calculate `numColumns` for the WavesHub FlatList based on screen width, using the existing 768px tablet breakpoint from `sharedStyles.js`
- On phones (< 768px): keep single-column full-width layout
- On tablets (≥ 768px): use 2-column layout
- WaveCard width adjusts automatically via FlatList's column mechanism
- Photo strip aspect ratio remains consistent regardless of column count

## Capabilities

### New Capabilities

_None — this is a modification to an existing capability._

### Modified Capabilities

- `wave-hub`: The "Albums-Style Wave Grid Display" requirement changes from a fixed single-column layout to a responsive layout that adapts column count based on screen width.

## Impact

- `src/screens/WavesHub/index.js` — add `useWindowDimensions`, compute `numColumns`, pass to FlatList with `key` prop for re-render on column change
- `src/components/WaveCard/index.js` — may need minor style adjustments to ensure horizontal photo strip scales well at narrower card widths
- Existing responsive pattern in `PhotosList/index.js` (`getResponsiveColumns`) serves as reference but this is simpler (just 1 vs 2 columns)
