## ADDED Requirements

### Requirement: PhotosListHeader component extracts header rendering
The `PhotosListHeader` component SHALL render the 3-tab segmented control header with a loading progress bar, replacing the inline `renderCustomHeader` function.

#### Scenario: Component renders with correct props
- **WHEN** `PhotosListHeader` is rendered with `{ theme, activeSegment, updateIndex, loading, segmentWidth, styles }`
- **THEN** it SHALL display a SafeAreaView header with three segment buttons (Global, Starred, Search), a WaveHeaderIcon, and a conditional loading progress bar

### Requirement: Segment buttons trigger index update
Each segment button SHALL call `updateIndex` with its index (0, 1, or 2) when pressed.

#### Scenario: User taps Global segment
- **WHEN** the user presses the Global (index 0) segment button
- **THEN** `updateIndex(0)` SHALL be called

#### Scenario: User taps Search segment
- **WHEN** the user presses the Search (index 2) segment button
- **THEN** `updateIndex(2)` SHALL be called

### Requirement: Active segment visual state
The component SHALL visually distinguish the active segment with `activeSegmentButton` styles and `TEXT_PRIMARY` color, while inactive segments use `TEXT_SECONDARY` color.

#### Scenario: Segment 1 is active
- **WHEN** `activeSegment` is 1
- **THEN** the Starred button SHALL use `activeSegmentButton` style and `TEXT_PRIMARY` color, while Global and Search SHALL use `TEXT_SECONDARY` color

### Requirement: Loading progress bar
The component SHALL show a `LinearProgress` bar below the header when `loading` is true.

#### Scenario: Loading is true
- **WHEN** `loading` is true
- **THEN** a 3px-high `LinearProgress` bar SHALL be visible below the segment control

#### Scenario: Loading is false
- **WHEN** `loading` is false
- **THEN** no progress bar SHALL be rendered
