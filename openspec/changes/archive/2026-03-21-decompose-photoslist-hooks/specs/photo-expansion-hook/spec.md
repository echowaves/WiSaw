## ADDED Requirements

### Requirement: usePhotoExpansion hook encapsulates expansion state
The `usePhotoExpansion` hook SHALL manage all state related to expanding/collapsing photos inline: `expandedPhotoIds`, `isPhotoExpanding`, `measuredHeights`, `justCollapsedId`, `scrollToIndex`, and associated refs (`photoHeightRefs`, `lastExpandedIdRef`, `scrollingInProgressRef`, `lastScrollY`, `masonryRef`).

#### Scenario: Hook returns expansion state and handlers
- **WHEN** `usePhotoExpansion` is called with `{ width, height, insets, segmentConfig, photosList }`
- **THEN** it SHALL return `{ expandedPhotoIds, setExpandedPhotoIds, isPhotoExpanded, handlePhotoToggle, getCalculatedDimensions, updatePhotoHeight, ensureItemVisible, handleScroll, resetAnchorState, performScroll, masonryRef, justCollapsedId, scrollToIndex, measuredHeights }`

### Requirement: handlePhotoToggle supports multi-expand
The hook SHALL support multiple photos expanded simultaneously. Toggling a photo that is expanded SHALL collapse it; toggling a collapsed photo SHALL expand it.

#### Scenario: Expanding a collapsed photo
- **WHEN** `handlePhotoToggle(photoId)` is called and `photoId` is not in `expandedPhotoIds`
- **THEN** `photoId` SHALL be added to `expandedPhotoIds` and `lastExpandedIdRef` SHALL be set to `photoId`

#### Scenario: Collapsing an expanded photo
- **WHEN** `handlePhotoToggle(photoId)` is called and `photoId` is in `expandedPhotoIds`
- **THEN** `photoId` SHALL be removed from `expandedPhotoIds`, its measured height SHALL be cleared, and `justCollapsedId` SHALL be set to `photoId`

#### Scenario: Rapid toggle prevention
- **WHEN** `handlePhotoToggle` is called while `isPhotoExpanding` is true
- **THEN** the call SHALL be ignored

### Requirement: resetAnchorState clears all expansion state
The hook SHALL provide a `resetAnchorState` function that clears anchor refs, scroll positions, measured heights, expanded photo IDs, and optionally scrolls the masonry list to top.

#### Scenario: Full reset on segment switch
- **WHEN** `resetAnchorState()` is called without arguments
- **THEN** all anchor refs, measured heights, and expanded IDs SHALL be cleared and the list SHALL scroll to top

#### Scenario: Reset without scroll
- **WHEN** `resetAnchorState({ skipScrollToTop: true })` is called
- **THEN** state SHALL be cleared but the list SHALL NOT scroll to top

### Requirement: ensureItemVisible scrolls expanded photo into view
The hook SHALL provide `ensureItemVisible` that scrolls the masonry list so the last expanded photo is visible under the header.

#### Scenario: Auto-scroll to expanded photo
- **WHEN** `ensureItemVisible({ id, y, height, alignTop, topPadding })` is called and `id` matches `lastExpandedIdRef`
- **THEN** the list SHALL scroll to position the photo below the header reserve area

#### Scenario: Ignore stale or concurrent scroll requests
- **WHEN** `ensureItemVisible` is called with an `id` that does not match `lastExpandedIdRef` or `scrollingInProgressRef` is true
- **THEN** the call SHALL be ignored

### Requirement: getCalculatedDimensions computes photo sizes
The hook SHALL provide `getCalculatedDimensions` that returns `{ width, height }` for a photo, using measured heights for expanded photos and `calculatePhotoDimensions` for collapsed ones.

#### Scenario: Expanded photo with measured height
- **WHEN** `getCalculatedDimensions(photo)` is called and the photo is expanded with a measured height
- **THEN** it SHALL return `{ width: screenWidth, height: measuredHeight }`

#### Scenario: Collapsed photo
- **WHEN** `getCalculatedDimensions(photo)` is called and the photo is not expanded
- **THEN** it SHALL return dimensions from `calculatePhotoDimensions`
