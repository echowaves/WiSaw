## MODIFIED Requirements

### Requirement: Waves List Loading Progress Bar
The system SHALL display a `LinearProgress` bar at the top of the WavesHub content area whenever wave data is loading, matching the PhotosList loading indicator pattern. The bar SHALL be rendered in `WavesHub` (the component used by the route), positioned between the search bar and the FlatList.

#### Scenario: Waves are loading
- **WHEN** the `loading` state is true (initial load, pagination, or refresh)
- **THEN** a 3px `LinearProgress` bar SHALL be displayed between the search bar and the waves FlatList
- **THEN** the bar SHALL use `CONST.MAIN_COLOR` as the color and `theme.HEADER_BACKGROUND` as the track background

#### Scenario: Waves finish loading
- **WHEN** the `loading` state becomes false
- **THEN** the `LinearProgress` bar SHALL be hidden

#### Scenario: User interacts while loading
- **WHEN** the progress bar is visible
- **THEN** the waves list and all other UI elements SHALL remain interactive (non-blocking)
