# Photo Thumb Context Hint Specification

## Purpose
Visual discoverability for photo thumbnail long-press interactions. Provides a persistent ⋮ pill overlay on thumbnails and a one-time hint banner on the main feed to teach users about quick actions.

## Requirements

### Requirement: Photo thumbnail displays a tappable three-dot pill overlay
Each photo thumbnail in the masonry grid (collapsed mode) SHALL display a ⋮ icon inside a semi-transparent dark pill in the top-right corner, that opens the QuickActionsModal when tapped.

#### Scenario: ⋮ pill is visible on collapsed thumbnail
- **WHEN** an ExpandableThumb component renders in collapsed (masonry) mode
- **THEN** a ⋮ icon SHALL be visible in the top-right corner of the thumbnail
- **THEN** the icon SHALL be white, inside a pill with background color `rgba(0,0,0,0.4)`
- **THEN** the pill SHALL be absolutely positioned with a small margin from the top and right edges

#### Scenario: User taps the ⋮ pill
- **WHEN** the user taps the ⋮ pill on a photo thumbnail
- **THEN** haptic feedback SHALL be triggered
- **THEN** the QuickActionsModal SHALL open for that photo (same behavior as long-press)

#### Scenario: ⋮ pill is hidden in expanded mode
- **WHEN** an ExpandableThumb component renders in expanded (full-width) mode
- **THEN** the ⋮ pill SHALL NOT be visible

#### Scenario: ⋮ pill does not interfere with other overlays
- **WHEN** a thumbnail has both a comment overlay and the ⋮ pill
- **THEN** both SHALL be visible without overlapping (comment overlay is bottom-positioned, ⋮ pill is top-right)

### Requirement: One-time hint banner for photo actions discoverability
The system SHALL display a dismissible hint banner at the top of the main photo feed the first time the user visits, teaching the long-press / ⋮ tap interaction.

#### Scenario: First visit to main feed
- **WHEN** the user opens the main photo feed for the first time (no SecureStore key `photoActionsHintShown`)
- **THEN** the system SHALL display a banner above the photo grid with text "Long-press any photo for quick actions"
- **THEN** the banner SHALL include a dismiss button (✕)

#### Scenario: User dismisses the banner
- **WHEN** the user taps the ✕ dismiss button on the hint banner
- **THEN** the banner SHALL be removed from view
- **THEN** the system SHALL set SecureStore key `photoActionsHintShown` to `"true"`

#### Scenario: Subsequent visits to main feed
- **WHEN** the user opens the main photo feed and SecureStore key `photoActionsHintShown` is `"true"`
- **THEN** the hint banner SHALL NOT be displayed

#### Scenario: Banner does not appear on other screens
- **WHEN** photo thumbnails are displayed on screens other than the main feed (e.g., wave detail)
- **THEN** the hint banner SHALL NOT be displayed on those screens
