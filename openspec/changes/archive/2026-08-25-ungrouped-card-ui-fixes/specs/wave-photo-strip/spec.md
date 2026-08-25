## ADDED Requirements

### Requirement: Selection mode checkbox overlay renders valid distinguishable states
When `WavePhotoStrip` is in selection mode, each thumbnail SHALL display a checkbox badge whose unchecked and checked states are visually distinguishable. The unchecked badge SHALL render as an empty outlined box (no solid fill), and the checked badge SHALL render as a solid accent-colored box containing a check glyph. All icons used in the badge SHALL be valid glyph names in the icon set actually used by the project (FontAwesome 5), so that no fallback/mystery glyph (e.g., `?`) is ever rendered.

#### Scenario: Unchecked photo shows empty checkbox
- **WHEN** the strip is in selection mode and a photo is not in the selection
- **THEN** its badge SHALL appear as an empty outlined box
- **THEN** no fallback glyph (such as `?`) SHALL be visible

#### Scenario: Selected photo shows checked checkbox
- **WHEN** the strip is in selection mode and a photo is in the selection
- **THEN** its badge SHALL appear as a solid accent-colored box containing a check glyph
- **THEN** tapping the thumbnail SHALL toggle the badge between the two states
