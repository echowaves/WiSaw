## Purpose
Defines the inline photo expansion behavior used across all photo feed screens (main feed, wave detail, friend feed, bookmarks). Photos expand in-place within the masonry grid instead of navigating to a separate modal route.

## Requirements

### Requirement: Inline expansion via masonry layout
The photo feed SHALL use `expo-masonry-layout`'s native `expandedItemIds` prop to expand a photo detail view inline within the column grid. When a user taps a thumbnail, that item SHALL expand to full grid width at the current waterline position, rendering the `<Photo>` component inline.

#### Scenario: Tap thumbnail to expand
- **WHEN** user taps a collapsed thumbnail in the masonry grid
- **THEN** the item's ID is added to `expandedItemIds`, the masonry engine flushes columns to the waterline, and the item renders full-width with the `<Photo>` component

#### Scenario: Tap expanded item to collapse
- **WHEN** user taps the collapse button on an expanded item
- **THEN** the item's ID is removed from `expandedItemIds` and the grid returns to normal column flow

#### Scenario: Only one item expanded at a time
- **WHEN** user taps a different thumbnail while one item is already expanded
- **THEN** the previously expanded item collapses and the newly tapped item expands

### Requirement: Expanded height estimation
The system SHALL provide a `getExpandedHeight` callback that returns a deterministic pixel height for expanded items as an initial estimate. The library's auto-measurement SHALL correct the estimate after the first render. The estimate SHALL be computed from the photo's aspect ratio and a fixed UI chrome height (action bar + comments estimate + padding).

#### Scenario: Initial height calculation
- **WHEN** `getExpandedHeight` is called for an item
- **THEN** it returns `imageHeight(aspectRatio, fullWidth) + ACTION_BAR_HEIGHT + COMMENTS_ESTIMATE + PADDING + CARD_CHROME_HEIGHT`

#### Scenario: Library auto-corrects after render
- **WHEN** the expanded item renders and its actual height differs from the estimate
- **THEN** the library SHALL auto-measure and re-layout without client-side intervention

### Requirement: Dynamic height correction
The system SHALL rely on the `expo-masonry-layout` library's built-in auto-measurement to detect and respond to expanded item height changes. The library measures expanded items via `onLayout` and automatically re-layouts when the rendered height differs from the estimate. The client-side height measurement pipeline (`scheduleHeightRecalc`, `onHeightMeasured`, `updateExpandedHeight`, `expandedHeightsCache`, `correctionCounts`, `layoutVersion`) SHALL be removed.

#### Scenario: Async content changes height
- **WHEN** the Photo component loads comments or photo details that change its rendered height
- **THEN** the library's auto-measurement SHALL detect the height change via `onLayout` and re-layout the masonry grid

#### Scenario: Height stabilizes after correction
- **WHEN** the measured height matches the allocated height
- **THEN** no re-layout occurs (the library internally prevents infinite relayout loops)

#### Scenario: Bookmark toggle recalculates height
- **WHEN** the user taps the bookmark button to watch or unwatch a photo
- **THEN** the React re-render SHALL trigger `onLayout` on the expanded cell and the library SHALL re-layout if the height changed

#### Scenario: Comment metadata toggle recalculates height
- **WHEN** the user taps a comment to expand or collapse its metadata (author, date, delete button)
- **THEN** the React re-render SHALL trigger `onLayout` on the expanded cell and the library SHALL re-layout if the height changed

#### Scenario: Comment deletion recalculates height
- **WHEN** the user deletes a comment and photoDetails is updated with the new comment list
- **THEN** the React re-render SHALL trigger `onLayout` on the expanded cell and the library SHALL shrink the cell

#### Scenario: Optimistic comment recalculates height
- **WHEN** an optimistic comment is added to the comments list
- **THEN** the React re-render SHALL trigger `onLayout` on the expanded cell and the library SHALL grow the cell

#### Scenario: Client-side measurement pipeline removed
- **WHEN** the Photo component renders with `embedded === true`
- **THEN** `scheduleHeightRecalc()`, `containerRef` measurement, `onHeightMeasured` prop, and `updateExpandedHeight` SHALL NOT exist
- **THEN** the `usePhotoExpansion` hook SHALL NOT maintain `expandedHeightsCache`, `correctionCounts`, or `layoutVersion` state

### Requirement: Expanded item renders Photo component The close button SHALL be positioned as a floating overlay above the outer card wrapper so it is not clipped by the card's `overflow: 'hidden'`.

#### Scenario: Photo component receives correct props
- **WHEN** an item is expanded in the masonry grid
- **THEN** the `renderItem` callback receives `isExpanded: true` and renders the full Photo component with `embedded={true}`

#### Scenario: Collapse button uses close icon
- **WHEN** an item is expanded in the masonry grid
- **THEN** the collapse button SHALL display a `close` (X) icon instead of `chevron-up`

#### Scenario: Photo context provides removePhoto
- **WHEN** the expanded Photo component deletes a photo
- **THEN** `removePhoto` from `PhotosListContext` removes the photo from the feed list

#### Scenario: Close button not clipped by card
- **WHEN** the expanded photo renders inside a card with `overflow: 'hidden'`
- **THEN** the close button SHALL be positioned outside (above) the card wrapper in the z-order so it remains fully visible and tappable
- **THEN** `removePhoto` from `PhotosListContext` removes the photo from the feed list

### Requirement: Expansion state management hook
The `usePhotoExpansion` hook SHALL manage `expandedPhotoId` state and provide `expandedItemIds` array, `getExpandedHeight` callback, and `toggleExpand` function to the masonry component.

#### Scenario: Hook returns expand API
- **WHEN** `usePhotoExpansion` is called
- **THEN** it returns `{ expandedItemIds, getExpandedHeight, toggleExpand, masonryRef }`

### Requirement: Auto-scroll to expanded item
The masonry grid SHALL automatically scroll to position the expanded item at the top of the viewport (with a small offset for visual breathing room) when a thumbnail is tapped to expand.

#### Scenario: Expand scrolls item into view
- **WHEN** a user taps a collapsed thumbnail to expand it
- **THEN** the masonry grid SHALL animate a scroll so the expanded item's top edge is positioned near the top of the viewport with an 8px offset

#### Scenario: Collapse does not scroll
- **WHEN** a user taps the collapse button on an expanded item
- **THEN** the masonry grid SHALL scroll to the position of the collapsed item so it remains visible

#### Scenario: Scroll is animated
- **WHEN** auto-scroll triggers on expand or collapse
- **THEN** the scroll SHALL be animated (not instant)
