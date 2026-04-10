## MODIFIED Requirements

### Requirement: Wave Card Pending Badge
The WaveCard component SHALL display a "Pending" badge when the wave has a `splashDate` that is in the future (i.e., the wave has not yet gone live). The badge SHALL NOT use the `isActive` field, which has been removed from the backend response. The pending check SHALL compare `wave.splashDate` against the current date client-side.

#### Scenario: Wave with future splash date shows pending badge
- **WHEN** a wave has `splashDate` set to a date in the future
- **THEN** the WaveCard SHALL display a "Pending" badge with amber styling (background `#FEF3C7`, text color `#D97706`)

#### Scenario: Wave with past splash date does not show pending badge
- **WHEN** a wave has `splashDate` set to a date in the past
- **THEN** the WaveCard SHALL NOT display the "Pending" badge

#### Scenario: Wave with no splash date does not show pending badge
- **WHEN** a wave has `splashDate` set to `null`
- **THEN** the WaveCard SHALL NOT display the "Pending" badge

#### Scenario: Wave card does not reference isActive
- **WHEN** the WaveCard component renders
- **THEN** it SHALL NOT reference `wave.isActive`
- **THEN** the pending state SHALL be derived from `wave.splashDate` only
