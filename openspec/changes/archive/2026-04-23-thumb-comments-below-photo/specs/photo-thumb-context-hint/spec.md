## MODIFIED Requirements

### Requirement: Photo thumbnail displays a tappable three-dot pill overlay
Each photo thumbnail in the masonry grid SHALL display a ⋮ icon inside a semi-transparent dark pill in the bottom-right corner of the image area, that opens the QuickActionsModal when tapped. When a comment section is displayed below the image, the pill SHALL be positioned relative to the image container (above the comment section), not relative to the overall thumbnail container.

#### Scenario: ⋮ pill is visible on collapsed thumbnail
- **WHEN** an ExpandableThumb component renders in the masonry grid
- **THEN** a ⋮ icon SHALL be visible in the bottom-right corner of the image area
- **THEN** the icon SHALL be white, inside a pill with background color `rgba(0,0,0,0.4)`
- **THEN** the pill SHALL be absolutely positioned within the image wrapper with a small margin from the bottom and right edges

#### Scenario: User taps the ⋮ pill
- **WHEN** the user taps the ⋮ pill on a photo thumbnail
- **THEN** haptic feedback SHALL be triggered
- **THEN** the QuickActionsModal SHALL open for that photo (same behavior as long-press)

#### Scenario: ⋮ pill positioned above comment section
- **WHEN** a thumbnail has a comment section below the image
- **THEN** the ⋮ pill SHALL render within the image wrapper View (not the outer container)
- **THEN** the pill SHALL appear above the comment section, anchored to the image's bottom-right

#### Scenario: ⋮ pill layers above the image content
- **WHEN** a thumbnail renders with the ⋮ pill
- **THEN** the ⋮ pill SHALL render above the image via zIndex
- **THEN** the pill SHALL remain tappable
