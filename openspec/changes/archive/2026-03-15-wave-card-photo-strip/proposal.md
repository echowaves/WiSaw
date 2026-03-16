## Why

The WaveCard currently displays in a 2-column grid with a square 2×2 photo collage, making each card tall and limiting how many waves are visible on screen. Switching to a full-width single-column layout with photos in a horizontal row creates a more compact, scannable list that better utilizes screen width and shows more waves at once.

## What Changes

- Change the WavesHub FlatList from `numColumns={2}` to single-column (`numColumns` removed)
- Redesign WaveCard to be full-width with preview photos laid out in a single horizontal row
- Replace the 2×2 collage grid with a horizontal strip of up to 4 thumbnails
- Adjust card and placeholder aspect ratios for the wider, shorter layout

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `wave-hub`: Wave grid changes from 2-column to single-column; WaveCard preview changes from 2×2 collage to horizontal photo strip

## Impact

- `src/components/WaveCard/index.js`: Collage container and image styles reworked to horizontal single-row layout
- `src/screens/WavesHub/index.js`: Remove `numColumns={2}` from FlatList
