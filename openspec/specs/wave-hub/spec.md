# Wave Hub Specification

## Purpose
The Waves Hub is the central management screen for waves — visual albums that group photos. It provides an albums-style grid, wave creation, search, upload target management, and auto-grouping.

## Requirements

### Requirement: Albums-Style Wave Grid Display
The system SHALL display waves in a responsive grid of wave cards. On phones (screen width < 768px), waves display in a single-column full-width list. On tablets and wider screens (screen width ≥ 768px), waves display in a 2-column grid. Each card shows a horizontal photo strip of up to 4 thumbnail images, wave name, and photo count.

#### Scenario: User opens Waves Hub on a phone
- **WHEN** the user navigates to the Waves Hub screen on a device with screen width less than 768px
- **THEN** waves are displayed in a single-column full-width list
- **THEN** each card spans the full width of the screen

#### Scenario: User opens Waves Hub on a tablet
- **WHEN** the user navigates to the Waves Hub screen on a device with screen width of 768px or more
- **THEN** waves are displayed in a 2-column grid
- **THEN** each card occupies approximately half the screen width

#### Scenario: Device rotates or screen resizes
- **WHEN** the screen width changes (rotation, split-screen, window resize)
- **THEN** the column count updates automatically based on the new width
- **THEN** the grid re-renders with the appropriate number of columns

#### Scenario: Wave has fewer than 4 photos
- **WHEN** a wave has 1-3 photos
- **THEN** the card shows available thumbnails filling the horizontal photo strip partially

#### Scenario: Wave has no photos
- **WHEN** a wave has zero photos
- **THEN** the card shows a placeholder icon (water/wave icon) instead of a thumbnail strip

### Requirement: Wave Search Filtering
The system SHALL provide a search bar that filters the wave list by wave name using client-side matching.

#### Scenario: User types in search bar
- **WHEN** the user enters text in the search bar
- **THEN** only waves whose name contains the search text (case-insensitive) are displayed
- **THEN** filtering happens immediately without server request

#### Scenario: User clears search
- **WHEN** the user clears the search bar text
- **THEN** all waves are displayed again

### Requirement: Upload Target Bar Display
The system SHALL display a persistent bar at the top of the Waves Hub showing the current upload target wave, or indicating that no upload target is set.

#### Scenario: Upload target is set
- **WHEN** the user has set an upload target wave
- **THEN** the upload target bar shows the wave name and a clear button

#### Scenario: No upload target set
- **WHEN** no upload target wave is selected
- **THEN** the upload target bar shows "No upload target set"

#### Scenario: User clears upload target from bar
- **WHEN** the user taps the clear button on the upload target bar
- **THEN** the upload target wave is cleared from state and storage
- **THEN** the bar updates to show "No upload target set"

### Requirement: Wave Card Context Menu
The system SHALL show a context menu on long-press of a wave card with management options.

#### Scenario: Owner long-presses their own wave card
- **WHEN** the wave owner long-presses a wave card
- **THEN** a context menu appears with options: Set as Upload Target, Rename, Edit Description, Share Wave, Delete Wave

#### Scenario: User long-presses another user's wave card
- **WHEN** a non-owner long-presses a wave card
- **THEN** a context menu appears with limited options: Set as Upload Target

#### Scenario: User deletes a wave from context menu
- **WHEN** the user selects Delete Wave from the context menu
- **THEN** a confirmation dialog is shown
- **THEN** upon confirmation, the wave is deleted and removed from the grid
- **THEN** if the deleted wave was the upload target, the upload target is cleared

### Requirement: Wave Pagination
The system SHALL load waves with pagination, fetching additional pages as the user scrolls.

#### Scenario: User scrolls to bottom of wave grid
- **WHEN** the user scrolls to the end of the loaded waves
- **THEN** the next page of waves is fetched and appended to the grid

#### Scenario: All waves loaded
- **WHEN** all waves have been fetched
- **THEN** no further fetch requests are made on scroll

### Requirement: Create Wave from Hub
The system SHALL allow users to create a new wave from the Waves Hub via the + button in the header.

#### Scenario: User taps create button
- **WHEN** the user taps the + button in the Waves Hub header
- **THEN** a modal appears with fields for wave name and optional description

#### Scenario: User submits wave creation
- **WHEN** the user fills in the wave name and taps Create
- **THEN** the wave is created via GraphQL mutation
- **THEN** the new wave card appears at the top of the grid

### Requirement: Auto-Group Photos from Hub
The system SHALL provide an Auto-Group button in the Waves Hub header that groups ungrouped photos into waves.

#### Scenario: User taps Auto-Group
- **WHEN** the user taps the Auto-Group button
- **THEN** a confirmation dialog is shown
- **THEN** upon confirmation, the `autoGroupPhotosIntoWaves` mutation is called repeatedly until `hasMore` is false
- **THEN** newly created waves appear in the grid
- **THEN** a success toast shows the count of waves created and photos grouped

### Requirement: Pull-to-Refresh
The system SHALL support pull-to-refresh to reload the wave list.

#### Scenario: User pulls to refresh
- **WHEN** the user pulls down on the wave grid
- **THEN** the wave list is reloaded from the server with a fresh batch
