## ADDED Requirements

### Requirement: Wave name display normalization
The `WaveCard` component SHALL normalize old date-range wave names to season format for display consistency. The stored wave name in the database SHALL NOT be modified. Only the displayed text in the wave card is affected.

The normalization SHALL convert these old auto-generated formats:
- `"<Locality>, <Mon> <D>, <YYYY>"` → `"<Locality>, <Season> <Year>"`
- `"<Locality>, <Mon> <YYYY>"` → `"<Locality>, <Season> <Year>"`
- `"<Locality>, <Mon> – <Mon> <YYYY>"` → `"<Locality>, <Season> <Year>"` (use start month)
- `"<Locality>, <Mon> <YYYY> – <Mon> <YYYY>"` → `"<Locality>, <Season> <Year>"` (use start month/year)

Season mapping (matching backend `getSeasonKey`):
- Dec, Jan, Feb → Winter (Jan/Feb use previous year: "Jan 2026" → "Winter 2025")
- Mar, Apr, May → Spring
- Jun, Jul, Aug → Summer
- Sep, Oct, Nov → Fall

Wave names already in season format (e.g. `"NYC, Spring 2026"`) or that do not match any date-range pattern SHALL pass through unchanged.

#### Scenario: Old single-date wave name normalized
- **WHEN** a wave has name `"New York, Mar 5, 2026"`
- **THEN** the WaveCard SHALL display `"New York, Spring 2026"`

#### Scenario: Old month-year wave name normalized
- **WHEN** a wave has name `"New York, Mar 2026"`
- **THEN** the WaveCard SHALL display `"New York, Spring 2026"`

#### Scenario: Old date-range same-year wave name normalized
- **WHEN** a wave has name `"New York, Mar – Jun 2026"`
- **THEN** the WaveCard SHALL display `"New York, Spring 2026"`

#### Scenario: Old date-range cross-year wave name normalized
- **WHEN** a wave has name `"New York, Mar 2025 – Jun 2026"`
- **THEN** the WaveCard SHALL display `"New York, Spring 2025"`

#### Scenario: Winter season year adjustment for January
- **WHEN** a wave has name `"New York, Jan 2026"`
- **THEN** the WaveCard SHALL display `"New York, Winter 2025"`

#### Scenario: Winter season year adjustment for February
- **WHEN** a wave has name `"New York, Feb 2026"`
- **THEN** the WaveCard SHALL display `"New York, Winter 2025"`

#### Scenario: December uses same year for winter
- **WHEN** a wave has name `"New York, Dec 2025"`
- **THEN** the WaveCard SHALL display `"New York, Winter 2025"`

#### Scenario: New season-format name passes through
- **WHEN** a wave has name `"New York, Spring 2026"`
- **THEN** the WaveCard SHALL display `"New York, Spring 2026"` unchanged

#### Scenario: User-created wave name passes through
- **WHEN** a wave has a manually set name `"My Vacation Photos"`
- **THEN** the WaveCard SHALL display `"My Vacation Photos"` unchanged

#### Scenario: Coordinate-based wave name normalized
- **WHEN** a wave has name `"40.7°N, 74.0°W, Mar 2026"`
- **THEN** the WaveCard SHALL display `"40.7°N, 74.0°W, Spring 2026"`
