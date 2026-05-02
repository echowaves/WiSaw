## MODIFIED Requirements

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
