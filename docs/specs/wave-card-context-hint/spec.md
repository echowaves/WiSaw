## Purpose
This specification defines expected user-visible behavior, constraints, and validation scenarios for wave card context hint in WiSaw.

## Requirements

### Requirement: WaveCard displays a tappable three-dot icon
Each WaveCard SHALL display a vertical three-dot (⋮) icon in the info row, right-aligned, that opens the same context menu as long-press.

#### Scenario: User taps the ⋮ icon
- **WHEN** the user taps the ⋮ icon on a WaveCard
- **THEN** the system SHALL open the context menu (same as long-press)

#### Scenario: Icon is always visible
- **WHEN** a WaveCard is rendered
- **THEN** the ⋮ icon SHALL be visible in the info row regardless of wave ownership

### Requirement: One-time tooltip for context menu discoverability
The system SHALL display the shared `InteractionHintBanner` component at the top of WavesHub to teach the long-press / tap interaction.

#### Scenario: First visit to WavesHub
- **WHEN** the user opens WavesHub for the first time (SecureStore key `interactionHintShown` is not set)
- **THEN** the `InteractionHintBanner` component SHALL be rendered with `hasContent` set to whether waves exist
- **THEN** the shared banner SHALL display with unified text "Tap and hold for options or tap ⋮"

#### Scenario: User dismisses the tooltip
- **WHEN** the user taps the ✕ dismiss button on the hint banner
- **THEN** the banner SHALL be removed from view
- **THEN** the system SHALL set SecureStore key `interactionHintShown` to `"true"`

#### Scenario: Subsequent visits to WavesHub
- **WHEN** the user opens WavesHub and SecureStore key `interactionHintShown` is set
- **THEN** the hint banner SHALL NOT be displayed
