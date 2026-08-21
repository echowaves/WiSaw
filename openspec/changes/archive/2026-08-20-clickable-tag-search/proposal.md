# Clickable Tag Search

## Why

The detailed (expanded) image card displays AI tags, but tapping them is broken or misleading in every context: in the feed, the expanded card never receives the `onTriggerSearch` callback (dead tap); in the shared-photo detail screen, the tap silently fires a search event that filters a feed hidden behind the stack. AI tags should be a direct entry point into the search experience: tapping a tag fills the current feed's search bar with that tag and filters the feed in place.

## What Changes

- Wire `onTriggerSearch` through `PhotosListMasonry` to the expanded (embedded) `Photo` card — the prop is already received by the masonry component but never forwarded to the card, making tag taps in the feed inert.
- In the feed, tapping an AI tag chip fills the search bar with the tag, expands the search FAB so the term is visible, and reloads the current feed filtered by that term.
- The expanded card auto-collapses on tag tap so the search bar with the new term and the filtered results are the visible focus.
- Tag tap scope is limited to AI Labels and AI Text detection chips. Moderation label chips are never interactive.
- In non-feed contexts (shared-photo detail, wave detail, friend detail), all tag chips render as plain non-interactive chips with no press affordance. The silent `photoSearchBus` emit from the shared-photo detail screen is removed.
- `usePhotoExpansion` exposes a collapse action consumed by the feed's search-trigger flow.

## Capabilities

### New Capabilities

- `tag-click-search`: AI tag chips on the detailed image card trigger the in-context feed search experience (fill search bar, filter current feed, collapse expanded card); chips in non-feed contexts are non-interactive.

### Modified Capabilities

- `ai-content-recognition`: The "Tag-Based Search Navigation" requirement changes from "navigate to the Search feed segment" to in-context feed search, and moderation labels are excluded from tap-to-search (they are display-only).

## Impact

- `src/components/Photo/index.js` — gate chip interactivity on `onTriggerSearch` availability; moderation chips always plain.
- `src/components/PhotosListMasonry/index.js` — forward `onTriggerSearch` to the expanded `Photo`.
- `src/hooks/usePhotoExpansion.js` — expose a collapse action.
- `src/screens/PhotosList/index.js` — use the collapse action in the search-trigger `onBeforeSearch`.
- `src/screens/PhotosDetailsShared/index.js` — remove the `onTriggerSearch` prop (chips become non-interactive).
- No backend changes, no new dependencies, no routing/navigation changes.
