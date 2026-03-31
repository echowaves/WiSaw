## ADDED Requirements

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
