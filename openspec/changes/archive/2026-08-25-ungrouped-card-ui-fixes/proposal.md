## Why

Two visible defects in the Ungrouped Photos card on the Waves Hub:

1. **Broken unchecked checkbox.** In selection mode, `WavePhotoStrip` renders the unchecked state with the icon name `square-o` — a Font Awesome 4 name that does not exist in the FontAwesome 5 glyph maps (`@react-native-vector-icons/fontawesome5`, verified against both the solid and regular glyph maps). The font renders its fallback glyph, so users see a `?` in the badge instead of an empty checkbox.
2. **Confusing action layout.** The "Auto-Group everything" button currently shares a single 3-way row with "Create a wave" and "Add to an existing wave", and the card's explanatory text sits in a detached info box. The primary bulk action should have its own line at the very bottom of the card, paired with an explanation of what it does.

## What Changes

- Replace the invalid `square-o` icon in `WavePhotoStrip`'s selection-mode checkbox with a valid FontAwesome 5 glyph, and adopt conventional checkbox styling: unchecked = outlined/empty box (no solid fill), checked = solid accent box with check.
- Restructure the `UngroupedPhotosCard` action area:
  - "Create a wave" and "Add to an existing wave" remain in their own row (manual actions, gated on selection).
  - "Auto-Group everything" moves to a separate, full-width row at the very bottom of the card, on the same line as new explanation text describing what the action does.
  - The existing detached info box ("Photos are auto-grouped into waves when you upload new ones...") is removed as redundant with the new inline explanation.
- No behavior, API, or dependency changes. Pure UI fix.

## Capabilities

### New Capabilities

(None)

### Modified Capabilities

- `ungrouped-photos-card`: The auto-group action's placement and accompanying explanation text change (own bottom row with inline explanation; standalone info box removed).
- `wave-photo-strip`: New requirement — the selection-mode checkbox overlay MUST use valid FontAwesome 5 glyphs and render a distinguishable empty (unchecked) vs. selected (checked) state.

## Impact

- `src/components/WavePhotoStrip/index.js` — checkbox icon names and badge styling in the selection-mode branch.
- `src/components/UngroupedPhotosCard/index.js` — action bar layout, new explanation text, removal of the info box.
- No new dependencies, no backend changes, no API/schema changes, no state/atom changes.
- `WaveCard` and `FriendCard` also use `WavePhotoStrip` but do not enable selection mode, so the checkbox fix is visible only in `UngroupedPhotosCard`.
