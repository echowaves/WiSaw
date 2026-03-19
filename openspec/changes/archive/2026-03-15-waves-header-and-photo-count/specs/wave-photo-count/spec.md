## ADDED Requirements

### Requirement: Accurate Photo Count from GraphQL
The system SHALL display the wave photo count using the `photosCount` field from the GraphQL `Wave` type instead of computing it from the `photos` array length.

#### Scenario: WaveCard displays photo count
- **WHEN** a WaveCard is rendered in the Waves Hub grid
- **THEN** the photo count SHALL be read from `wave.photosCount`
- **THEN** the display text SHALL show "{count} photo" or "{count} photos"

#### Scenario: listWaves query includes photosCount
- **WHEN** the `listWaves` GraphQL query is executed
- **THEN** the query SHALL request the `photosCount` field on each Wave
- **THEN** the query SHALL NOT request the `photos` field (since it is no longer needed for counting)

#### Scenario: Wave has zero photos
- **WHEN** a wave has no photos assigned
- **THEN** `photosCount` SHALL be `0` (or null, displayed as "0 photos")

#### Scenario: Wave photo count updates after adding/removing photos
- **WHEN** the waves list is refreshed after adding or removing photos from a wave
- **THEN** the `photosCount` SHALL reflect the updated server-side count
