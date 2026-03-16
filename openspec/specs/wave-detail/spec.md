# Wave Detail Specification

## Purpose
The Wave Detail screen displays a wave's photos in a masonry grid, provides wave management actions, and allows users to add/remove photos from the wave.

## Requirements

### Requirement: Wave Photo Masonry Display
The system SHALL display a wave's photos in a masonry grid layout using the existing `ExpoMasonryLayout` and `ExpandableThumb` components.

#### Scenario: User opens wave detail
- **WHEN** the user taps a wave card in the Waves Hub
- **THEN** a Wave Detail screen is pushed showing all photos in that wave in a masonry layout

#### Scenario: Wave has photos
- **WHEN** the wave contains photos
- **THEN** photos are rendered using `ExpandableThumb` with the same visual style as the main feed

#### Scenario: Wave has no photos
- **WHEN** the wave is empty
- **THEN** an empty state is shown with a prompt to add photos

### Requirement: Wave Detail Header
The system SHALL display the wave name, photo count, creation date, and a ⋮ menu button in the Wave Detail header.

#### Scenario: User views wave detail header
- **WHEN** the Wave Detail screen is displayed
- **THEN** the header shows the wave name as the title and a ⋮ menu button on the right

#### Scenario: User views wave metadata
- **WHEN** the Wave Detail screen is displayed
- **THEN** the subtitle area shows photo count and creation date

### Requirement: Set Upload Target from Wave Detail
The system SHALL provide a button in Wave Detail to set the current wave as the upload target.

#### Scenario: User sets upload target
- **WHEN** the user taps "Set as Upload Target" in Wave Detail
- **THEN** the `uploadTargetWave` atom is updated with this wave's data
- **THEN** the wave is persisted to storage as the upload target
- **THEN** the button visual state changes to indicate this wave is the active upload target

#### Scenario: Wave is already the upload target
- **WHEN** the user views Wave Detail for the current upload target wave
- **THEN** the button shows "Upload Target ✓" in an active/highlighted state
- **THEN** tapping the button clears the upload target

### Requirement: Add Photos Action
The system SHALL provide an "Add Photos" button in Wave Detail that navigates to the Photo Selection Mode screen.

#### Scenario: User taps Add Photos
- **WHEN** the user taps the "Add Photos" button
- **THEN** the Photo Selection Mode screen is pushed with this wave's UUID as a parameter

### Requirement: Wave Detail Context Menu
The system SHALL provide a ⋮ menu in the Wave Detail header with management options.

#### Scenario: Owner taps ⋮ menu
- **WHEN** the wave owner taps the ⋮ menu button
- **THEN** an action sheet appears with: Rename, Edit Description, Share Wave, Delete Wave

#### Scenario: User renames wave
- **WHEN** the user selects Rename from the menu
- **THEN** a modal with a text input pre-filled with the current name is shown
- **THEN** upon saving, the wave name is updated via `updateWave` mutation

#### Scenario: User deletes wave from detail
- **WHEN** the user selects Delete Wave from the menu
- **THEN** a confirmation dialog is shown
- **THEN** upon confirmation, the wave is deleted and the user is navigated back to Waves Hub

### Requirement: Remove Photo from Wave
The system SHALL allow users to remove a photo from the wave via long-press context menu within Wave Detail.

#### Scenario: User long-presses a photo in Wave Detail
- **WHEN** the user long-presses a photo in the wave's masonry grid
- **THEN** a context menu appears with "Remove from Wave" option

#### Scenario: User confirms removal
- **WHEN** the user selects "Remove from Wave"
- **THEN** the `removePhotoFromWave` mutation is called
- **THEN** the photo is removed from the masonry grid
- **THEN** a success toast is shown

### Requirement: Wave Detail Pagination
The system SHALL paginate photos in Wave Detail, loading more as the user scrolls.

#### Scenario: User scrolls in Wave Detail
- **WHEN** the user scrolls to the end of loaded photos
- **THEN** the next page of wave photos is fetched using `feedForWatcher` with `waveUuid`
