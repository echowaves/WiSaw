## MODIFIED Requirements

### Requirement: Wave Selector Modal Display
The system SHALL provide a modal overlay component that displays the user's waves in a searchable, paginated scrollable list for selecting a wave to assign a photo to.

#### Scenario: Modal opens with user's waves
- **WHEN** the wave selector modal is opened
- **THEN** the user's waves are fetched via `listWaves` query (page 0)
- **THEN** waves are displayed in a scrollable list showing wave name and photo count
- **THEN** a loading indicator is shown while waves are being fetched

#### Scenario: User scrolls to load more waves
- **WHEN** the user scrolls near the bottom of the wave list
- **THEN** the system SHALL fetch the next page of waves via `listWaves` with incremented `pageNumber` and the same `batch`
- **THEN** new waves SHALL be appended to the existing list
- **THEN** a loading indicator SHALL be shown at the bottom while fetching

#### Scenario: All waves loaded
- **WHEN** the API returns `noMoreData: true`
- **THEN** the system SHALL stop requesting additional pages on scroll

#### Scenario: User searches for a wave
- **WHEN** the user types in the search field at the top of the modal
- **THEN** after a 300ms debounce, the system SHALL call `listWaves` with the `searchTerm` parameter
- **THEN** pagination SHALL reset to page 0 with a new batch UUID
- **THEN** the wave list SHALL be replaced with server-filtered results

#### Scenario: Photo is already in a wave
- **WHEN** the modal opens and `currentWaveUuid` is provided
- **THEN** a "None (remove from wave)" option is shown at the top of the list
- **THEN** the current wave is visually highlighted in the list

#### Scenario: User selects a wave
- **WHEN** the user taps a wave in the list
- **THEN** the `onSelectWave` callback is called with the selected wave object
- **THEN** the modal closes

#### Scenario: User removes photo from wave
- **WHEN** the user taps "None (remove from wave)"
- **THEN** the `onRemoveFromWave` callback is called
- **THEN** the modal closes

#### Scenario: User dismisses modal
- **WHEN** the user taps outside the modal or presses the close button
- **THEN** the modal closes without any wave changes

#### Scenario: User creates a new wave from modal
- **WHEN** the user taps "Create New Wave" at the top of the wave list
- **THEN** an inline text input is shown for entering the wave name
- **WHEN** the user submits the name
- **THEN** the `onCreateWave` callback is called with the entered name
- **THEN** the modal closes

#### Scenario: User cancels new wave creation
- **WHEN** the user taps "Create New Wave" and then clears the input or taps cancel
- **THEN** the inline input is hidden and the wave list returns to normal

#### Scenario: User has no waves
- **WHEN** the user has no waves
- **THEN** the modal shows the "Create New Wave" option and an empty state message below it
