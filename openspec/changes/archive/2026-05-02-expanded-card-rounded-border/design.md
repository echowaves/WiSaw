## Context

The `Photo` component renders inside an outer `View` (`containerRef`) with `styles.container` which sets `backgroundColor: theme.BACKGROUND`. The inline style override adds `overflow: 'hidden'`. Inside this, when `embedded === true`, the content is wrapped in `expandedCardContainer` which has `borderRadius: 20`, `overflow: 'hidden'`, border, and shadow. The problem: the outer container's opaque background and square corners are visible around the rounded inner card.

The QuickActionsModal uses a single `content` View with `borderRadius: 16` directly — no outer rectangular wrapper.

## Goals / Non-Goals

**Goals:**
- The expanded photo should appear as a clean floating rounded card with no visible rectangular background behind it
- Match the visual quality of the QuickActionsModal's rounded appearance

**Non-Goals:**
- Changing the standalone (non-embedded) photo detail screen layout
- Changing the collapsed thumb's styling

## Decisions

### 1. Make outer container transparent and remove overflow clipping in embedded mode

**Decision**: When `embedded === true`, apply `backgroundColor: 'transparent'` and remove `overflow: 'hidden'` from the outer container. The `expandedCardContainer` already has its own `overflow: 'hidden'` to clip image corners. The outer container doesn't need to clip anything — the inner card handles it.

**Rationale**: Simplest fix with minimal changes. The outer `View` only needs to be a measurement wrapper in embedded mode — it shouldn't contribute visual styling.

**Alternatives considered**:
- Merging outer container and expandedCardContainer into one View — would require restructuring the onLayout/measurement logic, higher risk

### 2. Match expanded card shadow to collapsed thumb exactly

**Decision**: Change `expandedCardContainer` shadow to match `ExpandableThumb`'s `Animated.View`:
- `shadowColor: '#000'` (was `theme.CARD_SHADOW`)
- `shadowOpacity: 0.4` (was `0.3`)
- `shadowRadius: 6` (was `8`)
- `shadowOffset: { width: 0, height: 4 }` (already matches)
- `elevation: 8` (already matches)

**Rationale**: When a user taps a thumbnail to expand, the shadow should feel continuous — same depth, same spread. Using different shadow values creates a visual discontinuity.

### 3. Remove border (thumb has none)

**Decision**: Set `borderWidth: 0`, `borderColor: 'transparent'` on `expandedCardContainer`. The collapsed thumb uses `borderWidth: 0, borderColor: 'transparent'`.

**Rationale**: The thumb floats with shadow only, no stroke border. The expanded card should do the same.

### 4. Remove explicit margins (masonry handles spacing)

**Decision**: Set `marginVertical: 0`, `marginHorizontal: 0` on `expandedCardContainer`. Update `CARD_CHROME_HEIGHT` from 18 to 0.

**Rationale**: The masonry layout applies `spacing` between all items — collapsed and expanded alike. The collapsed thumb uses zero explicit margin. Adding `marginVertical/Horizontal: 8` on the expanded card creates extra gaps that the thumb doesn't have, making the expand transition feel jarring.

## Risks / Trade-offs

**[Measurement still works]** → The outer container's `onLayout` only fires when `!embedded`, so removing `overflow: 'hidden'` in embedded mode has no measurement impact.

**[Shadow visibility]** → With no overflow clipping on the outer container, the card's shadow will be fully visible. This is the desired behavior.

**[Height estimate changes]** → `CARD_CHROME_HEIGHT` drops from 18 to 0. The self-correcting mechanism in `usePhotoExpansion` handles any residual drift.
