## 1. Checkbox fix (WavePhotoStrip)

- [x] 1.1 In `src/components/WavePhotoStrip/index.js`, replace the invalid `square-o` icon in the selection-mode branch with valid FontAwesome 5 glyphs: unchecked = `square` with `iconStyle='regular'`, checked = `check-square` with `iconStyle='solid'`
- [x] 1.2 Restyle the unchecked badge: transparent (or subtle dark-tint) background, 2px `#007AFF` border, white outline glyph; keep the checked badge as solid `#007AFF` with white `check-square` (per design.md decision 1)

## 2. Card layout (UngroupedPhotosCard)

- [x] 2.1 In `src/components/UngroupedPhotosCard/index.js`, split the current 3-way `actionBar` into two rows: keep "Create a wave" / "Add to an existing wave" as the existing 50/50 manual row
- [x] 2.2 Add a new bottom row below the manual row: "Auto-Group everything" button (flex-1, accent background, existing `autoGrouping` ActivityIndicator behavior) with inline explanation text to its right — "Automatically groups all ungrouped photos into waves based on location." (`theme.TEXT_SECONDARY`, 12px, `numberOfLines={3}`, flexShrink)
- [x] 2.3 Remove the now-redundant `infoBox` ("Photos are auto-grouped into waves when you upload new ones...") and its styles
- [x] 2.4 Verify no other component depends on the removed `infoBox` styles or the old `actionBar` structure

## 3. Validation

- [x] 3.1 Run `npm run lint` (ts-standard) and fix any new findings
- [x] 3.2 Manually verify in the Waves Hub: unchecked thumbnails show an empty outlined box (no `?`), tapping toggles to solid blue check; Auto-Group button sits on its own bottom row with explanation text; confirm dialog still appears on press
- [x] 3.3 Verify `WaveCard` and `FriendCard` strips render unchanged (selection mode not enabled there)
