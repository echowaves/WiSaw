## Why

Toggling the bookmark action (or any button status update) changes the rendered width of the action buttons in both the expanded photo view and the photo preview overlay, causing visible reflow/shift. The root cause is in the shared `PhotoActionButtons` component: its `actionButtonDisabled` style overrides `minWidth` (72 → 32) and `borderRadius` (20 → 16), so buttons that become disabled (Report, Delete, Share when status unknown/bookmarked) shrink. Button status should only affect appearance (color/enabled state), never geometry.

## What Changes

- `PhotoActionButtons` disabled styling (`actionButtonDisabled`) SHALL no longer alter button geometry (`minWidth`, `borderRadius`); disabled state SHALL only change appearance (background, border, opacity, shadow) and icon color.
- All 5 action buttons (Report, Delete, Bookmark, Wave, Share) SHALL retain identical width/height/margin/padding regardless of enabled or disabled state, in both the expanded photo view and the quick-actions (preview overlay) modal.
- The Wave button SHALL have a fixed width (e.g. 120) with the wave label truncated with an ellipsis when it does not fit, so its geometry never depends on the wave name length or on details-load timing.
- The Wave button SHALL be the last element in the action button list and SHALL always render on its own line (a second row below Report/Delete/Bookmark/Share), in both the expanded photo view and the quick-actions modal.
- Disabled buttons SHALL remain non-interactive and visually de-emphasized (existing behavior preserved).

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `quick-actions-modal`: action buttons SHALL keep stable geometry across enabled/disabled state transitions; only color/enabled appearance changes.
- `expanded-photo-card`: action buttons below the expanded photo SHALL keep stable geometry across enabled/disabled state transitions; only color/enabled appearance changes.

## Impact

- `src/components/PhotoActionButtons/index.js` — style definitions (the only code change expected).
- Consumers: `src/components/Photo/index.js` (expanded view) and `src/components/QuickActionsModal/index.js` (preview overlay) — behavior-only, no code changes expected.
- No API, dependency, or backend impact.
