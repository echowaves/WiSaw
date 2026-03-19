## Context

WavesHub renders waves in a `FlatList` with `numColumns={2}`. Each WaveCard has `flex: 1` and `margin: 8`, sized for the 2-column layout. The collage is a square 2×2 grid (`aspectRatio: 1`, `flexWrap: 'wrap'`). Changing to single-column means each card spans the full screen width, so the photo strip should be wider and shorter.

## Goals / Non-Goals

**Goals:**
- Display wave cards in a single-column full-width list
- Lay preview thumbnails in one horizontal row per card
- Make cards more compact vertically

**Non-Goals:**
- Changing the info section (wave name, photo count)
- Adding scrolling to the photo strip
- Changing photo count or thumbnail fetching logic

## Decisions

**Remove `numColumns={2}` from WavesHub FlatList**
- Single-column layout lets each card use full width
- Also remove the spacer logic comment in `renderItem` (no longer needed for grid alignment)

**Change collage to horizontal strip with `aspectRatio: 5`**
- With full screen width, a 5:1 ratio gives a pleasant thin strip (~70px tall on a 360px screen)
- Remove `flexWrap: 'wrap'`; keep `flexDirection: 'row'`
- Each thumbnail uses `flex: 1, height: '100%'` to fill equally
- Placeholder uses matching `aspectRatio: 5`
- Alternative: `aspectRatio: 4` — rejected because at full width the strip would be too tall (~90px)

## Risks / Trade-offs

- [Fewer waves visible per screen than 2-column at first glance] → Offset by shorter card height; net result is similar or better density
- [Photos are narrower vertically in the strip] → `resizeMode: 'cover'` ensures good fill; these are just previews
