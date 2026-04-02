## MODIFIED Requirements

### Requirement: Photo thumbnail displays a tappable three-dot pill overlay
Each photo thumbnail in the masonry grid (collapsed mode) SHALL display a ⋮ icon inside a semi-transparent dark pill in the bottom-right corner, that opens the QuickActionsModal when tapped.

#### Scenario: ⋮ pill is visible on collapsed thumbnail
- **WHEN** an ExpandableThumb component renders in collapsed (masonry) mode
- **THEN** a ⋮ icon SHALL be visible in the bottom-right corner of the thumbnail
- **THEN** the icon SHALL be white, inside a pill with background color `rgba(0,0,0,0.4)`
- **THEN** the pill SHALL be absolutely positioned with a small margin from the bottom and right edges

#### Scenario: User taps the ⋮ pill
- **WHEN** the user taps the ⋮ pill on a photo thumbnail
- **THEN** haptic feedback SHALL be triggered
- **THEN** the QuickActionsModal SHALL open for that photo (same behavior as long-press)

#### Scenario: ⋮ pill is hidden in expanded mode
- **WHEN** an ExpandableThumb component renders in expanded (full-width) mode
- **THEN** the ⋮ pill SHALL NOT be visible

#### Scenario: ⋮ pill layers above the comments overlay
- **WHEN** a thumbnail has both a comment overlay and the ⋮ pill
- **THEN** the ⋮ pill SHALL render above the comment overlay via zIndex
- **THEN** the pill SHALL remain tappable
