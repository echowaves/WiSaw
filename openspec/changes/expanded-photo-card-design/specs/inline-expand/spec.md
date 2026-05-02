## MODIFIED Requirements

### Requirement: Expanded height estimation
The system SHALL provide a `getExpandedHeight` callback that returns a deterministic pixel height for expanded items. The initial estimate SHALL be computed from the photo's aspect ratio and a fixed UI chrome height (action bar + comments estimate + padding). The estimate SHALL account for the outer card wrapper's vertical chrome (margins and borders) when the photo is rendered in embedded mode.

#### Scenario: Initial height calculation
- **WHEN** `getExpandedHeight` is called for an item with no cached measured height
- **THEN** it returns `imageHeight(aspectRatio, fullWidth) + ACTION_BAR_HEIGHT + COMMENTS_ESTIMATE + PADDING + CARD_CHROME_HEIGHT`
- **THEN** `CARD_CHROME_HEIGHT` SHALL account for the outer card's `marginVertical` and `borderWidth` (approximately 18px)

#### Scenario: Cached height used on re-expansion
- **WHEN** `getExpandedHeight` is called for an item that was previously expanded and measured
- **THEN** it returns the cached measured height from the `expandedHeights` ref

### Requirement: Expanded item renders Photo component
The expanded masonry item SHALL render `<Photo embedded={true} onHeightMeasured={updateCache} />` wrapped in a `PhotosListContext.Provider` that provides `removePhoto`. The collapse control SHALL use a close (X) icon to visually distinguish it from the scroll-to-top FOB. The close button SHALL be positioned as a floating overlay above the outer card wrapper so it is not clipped by the card's `overflow: 'hidden'`.

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
