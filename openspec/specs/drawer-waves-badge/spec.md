## Requirements

### Requirement: Waves drawer item shows ungrouped photo count badge
The Waves drawer item SHALL display a small red dot (no text) when the ungrouped photos count is greater than zero. The badge SHALL be hidden when the count is 0 or null.

#### Scenario: Ungrouped photos exist
- **WHEN** the ungrouped photos count atom has a value greater than 0
- **THEN** the Waves drawer icon SHALL display a small red dot without any text

#### Scenario: No ungrouped photos
- **WHEN** the ungrouped photos count atom is 0 or null
- **THEN** the Waves drawer icon SHALL NOT display a badge

#### Scenario: Count not yet loaded
- **WHEN** the ungrouped photos count atom is null (not yet fetched)
- **THEN** the Waves drawer icon SHALL NOT display a badge

### Requirement: Badge visual styling
The badge SHALL be a small red dot positioned at the top-right corner of the icon, matching the style used by other drawer icon badges (e.g., IdentityDrawerIcon).

#### Scenario: Badge appearance
- **WHEN** the badge is visible
- **THEN** it SHALL be an 8×8 circular View with `#FF3B30` background color
- **THEN** it SHALL be positioned absolutely at the top-right of the icon container (top: 0, right: 0)
- **THEN** it SHALL NOT contain any text

### Requirement: Waves drawer icon color reflects activity state
The Waves drawer icon SHALL use `MAIN_COLOR` when wave activity exists and the item is not focused. When no activity exists or the item is focused, the icon SHALL use the drawer's default `color` prop. Activity is defined as `wavesCount > 0` or `ungroupedPhotosCount > 0`, matching the `WaveHeaderIcon` logic.

#### Scenario: Waves activity exists and item is not focused
- **WHEN** the `wavesCount` atom is greater than 0 or the `ungroupedPhotosCount` atom is greater than 0
- **AND** the drawer item is not focused
- **THEN** the Waves drawer icon SHALL render in `MAIN_COLOR`

#### Scenario: No wave activity
- **WHEN** the `wavesCount` atom is 0 or null
- **AND** the `ungroupedPhotosCount` atom is 0 or null
- **THEN** the Waves drawer icon SHALL render using the drawer's default `color` prop

#### Scenario: Item is focused/active
- **WHEN** the Waves drawer item is focused (active)
- **THEN** the Waves drawer icon SHALL render using the drawer's default `color` prop regardless of activity state
