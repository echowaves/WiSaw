# Wave Selector Modal Specification

## Purpose
The wave selector modal provides a reusable overlay component for selecting, searching, and creating waves. It is used when assigning photos to waves from the expanded photo view and other contexts.

## Requirements

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

#### Scenario: User creates a new wave with location
- **WHEN** the user taps "Create New Wave" and enters a wave name
- **AND** the user optionally sets a location via "Use My Location" or address input
- **AND** the user optionally adjusts the radius slider
- **WHEN** the user submits
- **THEN** the `onCreateWave` callback SHALL be called with the entered name and optional `lat`, `lon`, `radius` parameters
- **THEN** the modal closes

#### Scenario: User creates a wave without location
- **WHEN** the user taps "Create New Wave" and enters a wave name without setting a location
- **WHEN** the user submits
- **THEN** the `onCreateWave` callback SHALL be called with only the name (no location params)
- **THEN** the modal closes

#### Scenario: Location fields visibility during creation
- **WHEN** the user taps "Create New Wave" and the inline input is shown
- **THEN** a "Set Location (optional)" expandable section SHALL appear below the name input
- **AND** the section SHALL be collapsed by default
- **WHEN** the user taps to expand
- **THEN** the "Use My Location" button, address input, and radius slider SHALL appear

#### Scenario: User cancels new wave creation
- **WHEN** the user taps "Create New Wave" and then clears the input or taps cancel
- **THEN** the inline input is hidden and the wave list returns to normal

#### Scenario: User has no waves
- **WHEN** the user has no waves
- **THEN** the modal shows the "Create New Wave" option and an empty state message below it

### Requirement: Wave selector modal keyboard avoidance
The WaveSelectorModal SHALL use keyboard avoidance from `react-native-keyboard-controller` so search and create inputs remain visible when the keyboard is open.

#### Scenario: Searching waves with keyboard open
- **WHEN** a user taps the search input in the wave selector modal
- **THEN** the modal content SHALL reposition so the search input and wave list remain usable above the keyboard

#### Scenario: Creating a wave inline with keyboard open
- **WHEN** a user taps the create wave input in the wave selector modal
- **THEN** the modal content SHALL reposition so the create input and confirm button remain visible above the keyboard
