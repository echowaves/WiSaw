## Context

`UngroupedPhotosCard` (`src/components/UngroupedPhotosCard/index.js`) renders on the Waves Hub above the wave list. Its current bottom section is a single `actionBar` row of three flex-1 buttons (Auto-Group everything / Create a wave / Add to existing wave) followed by a detached `infoBox`. The selection-mode checkbox badge is rendered inside `WavePhotoStrip` (`src/components/WavePhotoStrip/index.js`), which is also used by `WaveCard` and `FriendCard` (neither enables selection mode).

Root cause of the `?`: `WavePhotoStrip` uses `square-o` (a Font Awesome 4 name) for the unchecked state. It is absent from both the solid and regular FontAwesome 5 glyph maps shipped with `@react-native-vector-icons/fontawesome5@13.1.2`; the font renders its fallback glyph.

Constraints: no new dependencies; kebab-case conventions; max cyclomatic complexity 8.

## Goals / Non-Goals

**Goals:**
- Unchecked checkbox reads as an empty box; checked as a solid check (no `?` ever).
- Auto-Group everything has its own line at the bottom of the card with an explanation of what it does.

**Non-Goals:**
- No changes to auto-group behavior, API calls, or state atoms.
- No changes to selection flow, `WaveSelectorModal`, or `WaveCard`/`FriendCard` rendering.

## Decisions

1. **Checkbox glyphs — `square` (regular) unchecked / `check-square` (solid) checked.**
   - Unchecked badge: transparent background, 2px accent (`#007AFF`) border, white `square` regular glyph inside (an outline-on-transparent reads as an empty checkbox on any photo).
   - Checked badge: solid `#007AFF` background with solid `check-square` white glyph (unchanged from today).
   - Alternative considered: keep the blue fill for both states and just swap `square-o` → `square` solid. Rejected: a solid white square on a blue box reads as "filled", not "empty" — the current design's core problem was the empty state, so the unchecked badge loses its fill.
   - Badge size/position (22×22, top-right) is unchanged.

2. **Auto-group row — full-width button with explanation text to its right, one line, at the very bottom of the card.**
   - Layout: horizontal row; button (flex-1, accent background, unchanged loading/ActivityIndicator behavior) + trailing text block (max ~40% width, `theme.TEXT_SECONDARY`, 12px, `numberOfLines={3}` — the copy needs three lines at that width).
   - Explanation copy: **"Automatically groups all ungrouped photos into waves based on location."**
   - The row sits below the manual-actions row, replacing the current 3-way row; the `infoBox` is removed (its content — auto-grouping happens on upload — is redundant once the button explains itself).
   - Alternative considered: explanation text below the button (stacked). Rejected per the request: the button should be "all the way on the bottom of the card with the explanation text" on the same line.
   - The existing confirm dialog on press is unchanged (the inline text previews it, the dialog still guards the destructive bulk action).

3. **Manual actions row unchanged** — "Create a wave" / "Add to an existing wave" stay as a 50/50 row above the auto-group row, still gated on selection count.

## Risks / Trade-offs

- [White outline `square` glyph on a light photo may have low contrast at the badge corner] → Badge keeps a subtle `rgba(0,0,0,0.35)` background circle behind the glyph so the outline reads on any thumbnail; verified visually on light and dark photos during apply.
- [Text + button on one line may wrap awkwardly on narrow devices] → Text block is capped at ~40% width with `numberOfLines={2}`; the button keeps `flex: 1`. If cramped at 320pt width, drop to stacked layout (noted, not implemented).
- [`WavePhotoStrip` is shared] → The fix only touches the `selectionMode && onPhotoToggle` branch; `WaveCard`/`FriendCard` are unaffected (they don't pass selection props).

## Migration Plan

Pure UI change in two components. Rollback = revert the two files. No data, schema, or deployment impact.

## Open Questions

- Exact explanation wording — currently "Automatically groups all ungrouped photos into waves based on location." (grouping level is CITY-based; easy to adjust).
- Whether the unchecked badge should get the dark-tint backing (default: yes, per risk mitigation above).
