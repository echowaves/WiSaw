## ADDED Requirements

### Requirement: WaveDetail displays interaction hint banner
The WaveDetail screen SHALL render the shared `InteractionHintBanner` component to teach users about long-press photo interactions, positioned above the photo masonry grid.

#### Scenario: First visit to WaveDetail with photos
- **WHEN** the user opens a wave detail screen that has photos and no relevant SecureStore keys are set
- **THEN** the `InteractionHintBanner` SHALL be displayed above the photo grid with text "Tap and hold for options or tap ⋮"

#### Scenario: WaveDetail with no photos
- **WHEN** the user opens a wave detail screen with zero photos
- **THEN** the `InteractionHintBanner` SHALL NOT be displayed

#### Scenario: Hint already dismissed
- **WHEN** the user opens a wave detail screen and any of the SecureStore keys (`interactionHintShown`, `photoActionsHintShown`, `waveContextMenuTooltipShown`) is set
- **THEN** the `InteractionHintBanner` SHALL NOT be displayed
