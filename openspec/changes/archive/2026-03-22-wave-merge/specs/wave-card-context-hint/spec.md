## ADDED Requirements

### Requirement: WaveCard displays a tappable three-dot icon
Each WaveCard SHALL display a vertical three-dot (⋮) icon in the info row, right-aligned, that opens the same context menu as long-press.

#### Scenario: User taps the ⋮ icon
- **WHEN** the user taps the ⋮ icon on a WaveCard
- **THEN** the system SHALL open the context menu (same as long-press)

#### Scenario: Icon is always visible
- **WHEN** a WaveCard is rendered
- **THEN** the ⋮ icon SHALL be visible in the info row regardless of wave ownership

### Requirement: One-time tooltip for context menu discoverability
The system SHALL display a tooltip near the ⋮ icon the first time the user visits WavesHub, to teach the long-press / tap interaction.

#### Scenario: First visit to WavesHub
- **WHEN** the user opens WavesHub for the first time (no SecureStore key `waveContextMenuTooltipShown`)
- **THEN** the system SHALL display a tooltip with text "Hold or tap ⋮ for options"
- **THEN** the system SHALL set the SecureStore key `waveContextMenuTooltipShown` to `"true"`

#### Scenario: Subsequent visits to WavesHub
- **WHEN** the user opens WavesHub and SecureStore key `waveContextMenuTooltipShown` is `"true"`
- **THEN** the system SHALL NOT display the tooltip

#### Scenario: User dismisses the tooltip
- **WHEN** the tooltip is visible and the user taps anywhere
- **THEN** the tooltip SHALL dismiss
