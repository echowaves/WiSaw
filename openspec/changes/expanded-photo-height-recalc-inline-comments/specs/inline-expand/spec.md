## MODIFIED Requirements

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

### Requirement: Expanded height estimation
The system SHALL provide a `getExpandedHeight` callback that returns a deterministic pixel height for expanded items as an initial estimate. The library's auto-measurement SHALL correct the estimate after the first render. The estimate SHALL be computed from the photo's aspect ratio and a fixed UI chrome height (action bar + comments estimate + padding).

#### Scenario: Initial height calculation
- **WHEN** `getExpandedHeight` is called for an item
- **THEN** it returns `imageHeight(aspectRatio, fullWidth) + ACTION_BAR_HEIGHT + COMMENTS_ESTIMATE + PADDING + CARD_CHROME_HEIGHT`

#### Scenario: Library auto-corrects after render
- **WHEN** the expanded item renders and its actual height differs from the estimate
- **THEN** the library SHALL auto-measure and re-layout without client-side intervention
