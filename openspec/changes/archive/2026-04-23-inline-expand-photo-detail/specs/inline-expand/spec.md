## ADDED Requirements

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
The system SHALL provide a `getExpandedHeight` callback that returns a deterministic pixel height for expanded items. The initial estimate SHALL be computed from the photo's aspect ratio and a fixed UI chrome height (action bar + comments estimate + padding).

#### Scenario: Initial height calculation
- **WHEN** `getExpandedHeight` is called for an item with no cached measured height
- **THEN** it returns `imageHeight(aspectRatio, fullWidth) + ACTION_BAR_HEIGHT + COMMENTS_ESTIMATE + PADDING`

#### Scenario: Cached height used on re-expansion
- **WHEN** `getExpandedHeight` is called for an item that was previously expanded and measured
- **THEN** it returns the cached measured height from the `expandedHeights` ref

### Requirement: Dynamic height correction
The system SHALL use the Photo component's `onHeightMeasured` callback to update the expanded height cache and re-trigger masonry layout when the actual rendered height differs from the estimate.

#### Scenario: Async content changes height
- **WHEN** the Photo component loads comments or photo details that change its rendered height
- **THEN** `onHeightMeasured` fires, the height cache is updated, and the masonry layout recalculates

#### Scenario: Height stabilizes after correction
- **WHEN** the measured height matches the cached height
- **THEN** no re-trigger occurs (prevents infinite relayout loops)

### Requirement: Expanded item renders Photo component
The expanded masonry item SHALL render `<Photo embedded={true} onHeightMeasured={updateCache} />` wrapped in a `PhotosListContext.Provider` that provides `removePhoto`.

#### Scenario: Photo component receives correct props
- **WHEN** an item is expanded in the masonry grid
- **THEN** the `renderItem` callback receives `isExpanded: true` and renders the full Photo component with `embedded={true}`

#### Scenario: Photo context provides removePhoto
- **WHEN** the expanded Photo component deletes a photo
- **THEN** `removePhoto` from `PhotosListContext` removes the photo from the feed list

### Requirement: Expansion state management hook
The `usePhotoExpansion` hook SHALL manage `expandedPhotoId` state and provide `expandedItemIds` array, `getExpandedHeight` callback, and `toggleExpand` function to the masonry component.

#### Scenario: Hook returns expand API
- **WHEN** `usePhotoExpansion` is called
- **THEN** it returns `{ expandedItemIds, getExpandedHeight, toggleExpand, handleScroll, masonryRef }`
