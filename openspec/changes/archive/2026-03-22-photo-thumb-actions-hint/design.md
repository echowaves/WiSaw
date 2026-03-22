## Context

ExpandableThumb is the photo thumbnail component used across the app (main feed, wave detail, etc.). It currently supports long-press → haptic → QuickActionsModal, but has no visual indication of this interaction. The WaveCard component recently gained a ⋮ icon + one-time tooltip pattern for its context menu, and the same approach should be applied to photo thumbnails for consistency.

The main feed screen renders a masonry grid of ExpandableThumb components. The comment overlay (lastComment, commentsCount, watchersCount) already demonstrates the pattern of overlaying semi-transparent elements on thumbnails.

## Goals / Non-Goals

**Goals:**
- Make photo long-press discoverable via a persistent ⋮ pill overlay on every thumbnail
- Teach new users about the interaction via a one-time dismissible banner on the main feed
- Keep the ⋮ tap behavior identical to long-press (opens QuickActionsModal)

**Non-Goals:**
- No changes to QuickActionsModal itself (actions, layout, behavior unchanged)
- No changes to the long-press interaction (still works as before)
- No ⋮ icon in expanded photo mode (only collapsed thumbnails in masonry grid)
- No banner on wave detail or other secondary photo screens

## Decisions

### 1. ⋮ pill as overlay on ExpandableThumb (not in parent grid)

The ⋮ pill lives inside ExpandableThumb, rendered as an absolutely-positioned overlay in the top-right corner. This keeps the feature self-contained in one component rather than requiring changes to every screen that renders thumbnails.

**Alternative considered**: Adding the icon in the parent grid component — rejected because ExpandableThumb is used in multiple places and the icon should appear everywhere thumbnails are shown.

### 2. Semi-transparent dark pill styling (rgba(0,0,0,0.4) background, white icon)

Matches the existing comment overlay pattern already on thumbnails. Provides consistent contrast across varied photo content.

**Alternative considered**: Frosted glass blur effect — rejected as heavier and inconsistent with existing overlay style. Drop shadow with no background — rejected as poor contrast on light photos.

### 3. Tap ⋮ opens QuickActionsModal directly

The ⋮ pill calls the same `onLongPress(photo)` callback that long-press triggers. No intermediate platform menu — the modal is the action interface.

**Alternative considered**: Opening a platform ActionSheet first — rejected because QuickActionsModal already serves as the full action interface with preview.

### 4. Banner at top of main feed only, persisted via SecureStore

A hint banner renders above the photo grid on the main feed screen. Dismissed with ✕ or after first interaction, stored under SecureStore key `photoActionsHintShown`. Only the main feed shows it — wave detail and other screens don't.

**Alternative considered**: Toast/snackbar — rejected as too transient for teaching a new interaction. Tooltip on first thumbnail — rejected as too small and easily missed.

### 5. ⋮ hidden in expanded mode

When ExpandableThumb is in expanded mode (full-width Photo component), the ⋮ is not shown. The expanded view has its own interaction patterns. The pill only appears on collapsed masonry thumbnails.

## Risks / Trade-offs

- [Visual clutter] The ⋮ pill adds an element to every thumbnail → Mitigated by small size (18px icon in ~28px pill) and low-opacity background that blends with photos
- [Tap target overlap] The pill sits in the top-right where users might accidentally tap → Mitigated by small hitSlop and the action being non-destructive (just opens a modal)
- [Banner ignored] Users may scroll past the banner without reading → Acceptable since the ⋮ pill provides ongoing discoverability even without the banner
