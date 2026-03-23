## Context

The `ActionMenu` component (`src/components/ActionMenu/index.js`) is a centered-card modal used for contextual actions across the app (waves list, wave detail, auto-group header). It currently dismisses only via overlay tap or item selection. Other modals in the codebase (`WaveSelectorModal`, `MergeWaveModal`) use a consistent close-button pattern: an Ionicons `close` icon (24px) in the upper-right corner with `hitSlop` for touch area and `theme.TEXT_PRIMARY` color.

## Goals / Non-Goals

**Goals:**
- Add a visible close button to the ActionMenu card header, matching existing modal patterns
- Maintain backward compatibility — no new required props, no consumer changes

**Non-Goals:**
- Changing ActionMenu's dismiss behavior (overlay tap still works)
- Refactoring ActionMenu into a fundamentally different layout
- Extracting a shared close-button sub-component (one file change doesn't justify it)

## Decisions

### 1. Header row with title + close button

**Decision**: Add a header `View` at the top of the card with `flexDirection: 'row'`, `justifyContent: 'space-between'`, `alignItems: 'center'`. The title (if provided) is on the left, the close button is on the right. When no title is provided, set `justifyContent: 'flex-end'` so the close button sits alone in the upper-right corner.

**Rationale**: Matches `WaveSelectorModal` header layout exactly. The close button always renders regardless of title presence, ensuring users always have a discoverable dismiss affordance.

**Alternative considered**: Absolute-position the close button. Rejected — flexbox row is simpler and matches existing patterns.

### 2. Ionicons `close` icon, 24px, `theme.TEXT_PRIMARY`

**Decision**: Use `Ionicons` name `'close'`, size 24, color `theme.TEXT_PRIMARY`, with `hitSlop: { top: 10, bottom: 10, left: 10, right: 10 }`.

**Rationale**: Exact same icon, size, color, and hitSlop as `WaveSelectorModal` and `MergeWaveModal`. Ionicons is already bundled and loaded in `_layout.tsx`.

### 3. No new props

**Decision**: The close button calls the existing `onClose` callback. No new props are introduced.

**Rationale**: `onClose` is already required. The close button is just another way to trigger it, like the overlay tap.

## Risks / Trade-offs

- [Header adds vertical space to the card] → Minimal impact (~40px). The card layout is flexible and this matches user expectations from other modals.
- [Close button may feel redundant alongside overlay tap] → Both affordances are standard in mobile modals. The button improves accessibility and discoverability.
