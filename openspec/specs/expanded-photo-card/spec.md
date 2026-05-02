## Purpose
Defines the visual card wrapper and layout structure for photos expanded inline within the masonry grid feed.

## Requirements

### Requirement: Unified card wrapper for expanded photo
When a photo is expanded inline in the masonry grid (`embedded === true`), the entire expanded view SHALL be wrapped in a single card container with `borderRadius: 20`, `overflow: 'hidden'`, and themed background. The card's shadow, border, and margins SHALL match the collapsed `ExpandableThumb` exactly: `shadowColor: '#000'`, `shadowOffset: { width: 0, height: 4 }`, `shadowOpacity: 0.4`, `shadowRadius: 6`, `elevation: 8`, `borderWidth: 0`, `borderColor: 'transparent'`, and zero explicit margins. The outer measurement container SHALL NOT obscure the card's rounded appearance.

#### Scenario: Expanded photo appears as floating rounded card
- **WHEN** a photo thumbnail is tapped to expand in the masonry feed
- **THEN** the expanded view SHALL appear as a floating rounded card with no visible rectangular background behind it

#### Scenario: Card shadow matches collapsed thumb
- **WHEN** the expanded card renders inside the masonry grid
- **THEN** the card's shadow SHALL use `shadowColor: '#000'`, `shadowOpacity: 0.4`, `shadowRadius: 6`, `shadowOffset: { width: 0, height: 4 }`, `elevation: 8` — identical to the collapsed `ExpandableThumb`

#### Scenario: Card has no stroke border
- **WHEN** the expanded card renders
- **THEN** `borderWidth` SHALL be `0` and `borderColor` SHALL be `'transparent'` — matching the collapsed thumb

#### Scenario: Card uses no explicit margins
- **WHEN** the expanded card renders inside the masonry grid
- **THEN** `marginVertical` and `marginHorizontal` SHALL be `0` — the masonry `spacing` prop handles inter-item gaps

#### Scenario: Outer container is transparent in embedded mode
- **WHEN** the Photo component renders with `embedded === true`
- **THEN** the outer container `View` SHALL have `backgroundColor: 'transparent'` and SHALL NOT have `overflow: 'hidden'`

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
