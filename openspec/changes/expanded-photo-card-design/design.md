## Context

The expanded photo in the masonry feed currently renders as a flat `View` with `theme.BACKGROUND`. The `Photo` component (`src/components/Photo/index.js`) renders sections in this order: close button → action card → loading indicator → photo → info → comments → add comment → AI recognitions. Each sub-section (action card, comments card, info card, AI cards) has its own `SHARED_STYLES.containers.card` styling with `marginHorizontal: 16`, `borderRadius: 20`, and shadow.

The masonry layout (`ExpoMasonryLayout`) relies on height estimation via `usePhotoExpansion` and `estimateExpandedHeight` to allocate space for expanded items. The current estimation does not account for any outer card chrome.

## Goals / Non-Goals

**Goals:**
- Give the expanded photo a unified card appearance with rounded corners, border, and shadow
- Reorder sections: photo first, then actions, then content (info, comments, AI)
- Flatten inner sections to avoid nested card-in-card visual weight
- Maintain correct masonry height estimation with the new card chrome

**Non-Goals:**
- Changing the collapsed thumbnail appearance
- Modifying the standalone (non-embedded) photo detail screen layout
- Changing the action buttons themselves (icons, behavior, spacing)
- Redesigning the AI recognition or comments sections beyond de-carding them

## Decisions

### 1. Single outer card wrapper with `overflow: 'hidden'`

**Decision**: Wrap the entire expanded `Photo` return JSX in a single card-styled `View` with `borderRadius: 20` and `overflow: 'hidden'`.

**Rationale**: The `overflow: 'hidden'` on the outer card naturally clips the full-bleed image's corners without needing to add `borderRadius` to the image itself. This is the standard pattern for media cards in modern mobile apps.

**Alternatives considered**:
- Adding `borderRadius` directly to `ImageView` — fragile, requires coordinating top-only radius, breaks if image container changes
- Separate card for photo vs. content — more complex, doesn't achieve the unified "single object" feel

### 2. Apply card only in embedded mode

**Decision**: The outer card wrapper only applies when `embedded === true` (masonry expanded view). The standalone detail screen (`embedded === false`) keeps its current full-screen layout.

**Rationale**: The card design makes sense for an item "popping out" of a grid. The standalone screen is already a full modal — wrapping it in a card would waste screen space.

### 3. Flatten inner sections

**Decision**: When inside the outer card, inner sections (photoInfoCard, commentsCard, actionCard, aiRecognitionCard) drop their `marginHorizontal`, `borderRadius`, `borderWidth`, and `shadow` styles. They become flat content rows separated by subtle `borderTopWidth: 1` dividers or vertical spacing.

**Rationale**: Nested cards with independent margins and borders create visual clutter. Flat sections inside a single card produce a cleaner, more cohesive appearance.

### 4. Render order change

**Decision**: Move `renderActionCard()` from before `renderPhotoRow()` to after it. New order:
1. Close button (overlay)
2. Loading indicator
3. Photo/Video
4. Action buttons
5. Photo info (author, date, stats)
6. Comments
7. Add comment button
8. AI recognitions

**Rationale**: Users should see the content first, then act on it. Action-after-content is the dominant pattern in social media (Instagram, Twitter, etc.).

### 5. Height estimation adjustment

**Decision**: Add the outer card's vertical chrome (top/bottom margin + border) to `estimateExpandedHeight` in `photoListHelpers.js`. The card uses `marginVertical: 8` and `borderWidth: 1`, so the added height is approximately `8 + 8 + 1 + 1 = 18px`.

**Rationale**: The masonry layout needs accurate height predictions to avoid jarring layout shifts. The correction-based system (`usePhotoExpansion`) will handle small measurement drift, but the initial estimate should be close.

## Risks / Trade-offs

**[Height estimation drift]** → The self-correcting mechanism in `usePhotoExpansion` (up to `MAX_CORRECTIONS = 5`) will handle minor inaccuracies. The initial estimate just needs to be in the right ballpark.

**[Close button on rounded corner]** → The floating close button at `top: 8, right: 8` in `PhotosListMasonry.js` sits outside the `Photo` component. With the outer card having `overflow: 'hidden'`, the close button could get clipped if it's rendered inside the card. It's currently rendered in the masonry's `renderMasonryItem` as a sibling overlay, so it should remain above the card. Verify during implementation.

**[Performance]** → Adding one extra `View` wrapper with shadow/border per expanded item is negligible — only one item is expanded at a time.

**[Flattened inner sections look different from standalone screen]** → Acceptable divergence. The embedded and standalone contexts serve different purposes. The standalone screen can retain its current card-per-section style.
