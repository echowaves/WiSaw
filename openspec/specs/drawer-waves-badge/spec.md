## Purpose
This specification defines expected user-visible behavior, constraints, and validation scenarios for drawer waves badge in WiSaw.

## Requirements

### Requirement: Waves drawer item shows wave activity badge
The Waves drawer item SHALL display a small red dot (no text) when the waves count is greater than zero. The badge SHALL be hidden when the waves count is 0 or null. **The ungrouped photos count is no longer used for badge display.**

#### Scenario: Waves exist and item is not focused
- **WHEN** the `wavesCount` atom has a value greater than 0
- **AND** the ungrouped photos count is any value (ignored)
- **THEN** the Waves drawer icon SHALL display a small red dot without any text

#### Scenario: No waves
- **WHEN** the waves count atom is 0 or null
- **THEN** the Waves drawer icon SHALL NOT display a badge

#### Scenario: Count not yet loaded
- **WHEN** the waves count atom is null (not yet fetched)
- **THEN** the Waves drawer icon SHALL NOT display a badge

### Requirement: Badge visual styling
The badge SHALL be a small red dot positioned at the top-right corner of the icon, matching the style used by other drawer icon badges (e.g., IdentityDrawerIcon).

#### Scenario: Badge appearance
- **WHEN** the badge is visible
- **THEN** it SHALL be an 8×8 circular View with `#FF3B30` background color
- **THEN** it SHALL be positioned absolutely at the top-right of the icon container (top: 0, right: 0)
- **THEN** it SHALL NOT contain any text

### Requirement: Waves drawer icon color reflects wave activity state
The Waves drawer icon SHALL use `MAIN_COLOR` when wave activity exists and the item is not focused. When no activity exists or the item is focused, the icon SHALL use the drawer's default `color` prop. Activity is defined as `wavesCount > 0` only — **ungrouped photos count is no longer considered.**

#### Scenario: Waves activity exists and item is not focused
- **WHEN** the `wavesCount` atom is greater than 0
- **AND** the drawer item is not focused
- **THEN** the Waves drawer icon SHALL render in `MAIN_COLOR`

#### Scenario: No wave activity
- **WHEN** the `wavesCount` atom is 0 or null
- **THEN** the Waves drawer icon SHALL render using the drawer's default `color` prop

#### Scenario: Item is focused/active
- **WHEN** the Waves drawer item is focused (active)
- **THEN** the Waves drawer icon SHALL render using the drawer's default `color` prop regardless of activity state