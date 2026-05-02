## ADDED Requirements

### Requirement: Unified card wrapper for expanded photo
When a photo is expanded inline in the masonry grid (`embedded === true`), the entire expanded view SHALL be wrapped in a single card container with `borderRadius: 20`, `overflow: 'hidden'`, themed background, border, and shadow. This card SHALL visually distinguish the expanded photo from the surrounding feed.

#### Scenario: Expanded photo renders inside a card
- **WHEN** a photo thumbnail is tapped to expand in the masonry feed
- **THEN** the expanded Photo component SHALL render inside a card container with rounded corners (`borderRadius: 20`), themed `CARD_BACKGROUND`, `CARD_BORDER`, and shadow

#### Scenario: Card clips photo image corners
- **WHEN** the photo image renders inside the card container
- **THEN** the image SHALL fill the card edge-to-edge (no padding around the image)
- **THEN** the card's `overflow: 'hidden'` SHALL clip the image corners to match the card's rounded corners

#### Scenario: Card wrapper only applies in embedded mode
- **WHEN** the Photo component renders with `embedded === false` (standalone detail screen)
- **THEN** no outer card wrapper SHALL be applied — the layout remains unchanged

### Requirement: Section render order in expanded card
Within the expanded card, content sections SHALL render in this order: photo/video, action buttons, photo info (author/date/stats), comments, add comment button, AI recognitions.

#### Scenario: Action buttons appear below photo
- **WHEN** a photo is expanded in the masonry feed
- **THEN** the action buttons (ban, delete, bookmark, wave, share) SHALL appear immediately below the photo image and above the photo info section

#### Scenario: Comments appear below photo info
- **WHEN** a photo is expanded in the masonry feed
- **THEN** comments SHALL appear below the photo info section (author, date, stats)

### Requirement: Flattened inner sections
When rendered inside the outer card wrapper, inner content sections (photo info, comments, action card, AI recognition cards) SHALL NOT render their own card-level styling (independent margins, border radius, border, shadow). They SHALL render as flat content rows within the unified card.

#### Scenario: Inner sections have no independent card chrome
- **WHEN** the Photo component renders with `embedded === true` inside the outer card
- **THEN** the photo info section, comments section, action card, and AI recognition cards SHALL NOT have `marginHorizontal`, `borderRadius`, `borderWidth`, or `shadowColor` styling of their own

#### Scenario: Inner sections use spacing or dividers
- **WHEN** inner sections render inside the outer card
- **THEN** sections SHALL be visually separated by vertical spacing or subtle border dividers rather than independent card containers
