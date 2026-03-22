## MODIFIED Requirements

### Requirement: One-time tooltip for context menu discoverability
The system SHALL display the shared `InteractionHintBanner` component at the top of WavesHub to teach the long-press / tap interaction. The inline tooltip implementation (state, effect, dismiss handler, JSX, styles) SHALL be removed and replaced with a single `<InteractionHintBanner hasContent={waves.length > 0} />` render.

#### Scenario: First visit to WavesHub
- **WHEN** the user opens WavesHub for the first time (no relevant SecureStore keys set)
- **THEN** the `InteractionHintBanner` component SHALL be rendered with `hasContent` set to whether waves exist
- **THEN** the shared banner SHALL display with unified text "Tap and hold for options or tap ⋮"

#### Scenario: User dismisses the tooltip
- **WHEN** the user taps the ✕ dismiss button on the hint banner
- **THEN** the banner SHALL be removed from view
- **THEN** the system SHALL set SecureStore key `interactionHintShown` to `"true"`

#### Scenario: Subsequent visits to WavesHub
- **WHEN** the user opens WavesHub and any of the SecureStore keys (`interactionHintShown`, `waveContextMenuTooltipShown`, `photoActionsHintShown`) is set
- **THEN** the hint banner SHALL NOT be displayed

## REMOVED Requirements

### Requirement: Inline tooltip state and styling in WavesHub
**Reason**: Replaced by the shared `InteractionHintBanner` component. The `showTooltip` state, `checkTooltip` effect, `dismissTooltip` handler, inline tooltip JSX, and `tooltipContainer`/`tooltipText` styles are no longer needed.
**Migration**: Replace with `<InteractionHintBanner hasContent={waves.length > 0} />` rendered in the same position.
