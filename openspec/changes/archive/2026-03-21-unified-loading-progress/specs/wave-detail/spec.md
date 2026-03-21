## ADDED Requirements

### Requirement: Wave Detail Loading Progress Bar
The system SHALL display a `LinearProgress` bar at the top of the WaveDetail content area whenever photo data is loading, matching the PhotosList loading indicator pattern.

#### Scenario: Photos are loading in wave detail
- **WHEN** the `loading` state is true (initial load, pagination, or refresh)
- **THEN** a 3px `LinearProgress` bar SHALL be displayed between the header and the masonry grid
- **THEN** the bar SHALL use `CONST.MAIN_COLOR` as the color and `theme.HEADER_BACKGROUND` as the track background

#### Scenario: Photos finish loading
- **WHEN** the `loading` state becomes false
- **THEN** the `LinearProgress` bar SHALL be hidden

#### Scenario: User interacts while loading
- **WHEN** the progress bar is visible
- **THEN** the masonry grid and all other UI elements SHALL remain interactive (non-blocking)

## REMOVED Requirements

### Requirement: Wave Detail Centered Loading Spinner
**Reason**: Replaced by the `LinearProgress` bar for consistency with PhotosList. The centered `ActivityIndicator` that showed when `loading && photos.length === 0` is no longer used.
**Migration**: The `LinearProgress` bar at the top provides loading feedback in all cases. The `EmptyStateCard` continues to render when photos array is empty after load completes.
