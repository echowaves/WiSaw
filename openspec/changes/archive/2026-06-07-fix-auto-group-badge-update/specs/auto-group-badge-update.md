## Purpose
This specification defines expected user-visible behavior, constraints, and validation scenarios for automatic auto-grouping triggered by photo upload, specifically ensuring wave badge indicators update correctly.

## MODIFIED Requirements

### Requirement: Auto-group badge updates after post-upload auto-group
The system SHALL update the wave badge indicators on the PhotosList header and Waves drawer icon after automatic auto-grouping is triggered by photo upload completion.

#### Scenario: Badge updates after post-upload auto-group completes
- **WHEN** a photo upload completes and `flushUngroupedPhotos` runs automatic auto-grouping
- **WHEN** the auto-grouping loop completes (all batches processed)
- **THEN** the `wavesCount` Jotai atom SHALL be updated with the new wave count
- **AND** the `ungroupedPhotosCount` Jotai atom SHALL be updated with remaining ungrouped count
- **THEN** the WaveHeaderIcon badge SHALL reflect the new `ungroupedPhotosCount` value
- **AND** the Waves drawer icon badge SHALL reflect the new count

#### Scenario: Badge updates even when zero waves created
- **WHEN** automatic auto-grouping runs but creates zero new waves (all ungrouped photos already grouped)
- **THEN** the badge SHALL still update to reflect `photosRemaining` from the final API response
- **AND** the badge SHALL NOT remain stale at the previous count

#### Scenario: Badge updates when not on Waves screen
- **WHEN** automatic auto-grouping completes while the user is on any screen other than Waves Hub
- **THEN** the badge on the PhotosList header SHALL update immediately
- **AND** the badge on the Waves drawer icon SHALL update immediately
- **AND** the user SHALL see the updated badge count when they navigate to the Waves screen

## NEW Requirements

### Requirement: Automatic auto-group does not show toast notification
When auto-grouping is triggered automatically (not via user button tap), the system SHALL NOT display a success toast notification after completion.

#### Scenario: Post-upload auto-group completes without toast
- **WHEN** automatic auto-grouping is triggered by photo upload completion
- **THEN** no success toast SHALL appear after the operation completes
- **AND** no toast SHALL appear even if `wavesCreated > 0`

#### Scenario: Error still shows toast
- **WHEN** automatic auto-grouping encounters an error
- **THEN** an error toast SHALL be displayed describing the failure
- **AND** the error toast SHALL appear even in silent mode

### Requirement: Progress overlay shows for automatic triggers when on Waves screen
When auto-grouping is triggered automatically while the user is on the Waves screen, the system SHALL display the same progress overlay as manual button tap.

#### Scenario: Progress overlay shows for post-upload auto-group on Waves screen
- **WHEN** a photo upload completes and automatic auto-grouping is triggered
- **AND** the user is currently on the Waves Hub screen
- **THEN** a progress overlay SHALL appear showing "Grouping photos into waves..."
- **THEN** the overlay SHALL update to show waves created, photos grouped, and remaining count

#### Scenario: Progress overlay does not block navigation
- **WHEN** the user is on any screen other than Waves Hub when automatic auto-grouping is triggered
- **THEN** no progress overlay SHALL be displayed
- **AND** the user MAY navigate freely between screens
- **AND** the badge SHALL still update after completion

### Requirement: Silent mode bypasses confirmation dialog
The system SHALL support a "silent mode" for auto-grouping that skips the confirmation dialog while showing the same progress feedback.

#### Scenario: Silent mode skips confirmation dialog
- **WHEN** `emitAutoGroupSilent()` is called (e.g., post-upload trigger)
- **THEN** the confirmation dialog SHALL NOT appear
- **AND** auto-grouping SHALL begin immediately

#### Scenario: Silent mode still shows progress
- **WHEN** silent mode is active
- **THEN** the progress overlay SHALL appear (if on Waves screen)
- **AND** progress updates SHALL be visible during the auto-group loop

#### Scenario: Silent mode still updates badge
- **WHEN** silent mode auto-grouping completes
- **THEN** `emitAutoGroupDone()` SHALL be emitted
- **AND** badge indicators SHALL update normally

## Requirement: Auto-group uses persisted grouping level
The system SHALL call the `autoGroupPhotosIntoWaves(uuid: String!, groupingLevel: GroupingLevel!)` GraphQL mutation with the **persisted** `groupingLevel` value from the user's settings in automatic triggers triggered by photo upload.

#### Scenario: Post-upload auto-group uses persisted grouping level
- **WHEN** a photo upload completes and `flushUngroupedPhotos` is called
- **THEN** the mutation SHALL be called with `groupingLevel` from `_groupingState.groupingLevel`
- **AND** the `groupingLevel` SHALL match the user's configured value in Settings

#### Scenario: Post-upload auto-group falls back to CITY when state not hydrated
- **WHEN** `flushUngroupedPhotos` is called before `_groupingState` is hydrated from AsyncStorage
- **THEN** the mutation SHALL be called with `groupingLevel: 'CITY'` as a fallback

## REMOVED Requirements

### Requirement: Badge refresh only on Waves screen mount
**Reason**: Badge must update in real-time after any auto-group operation, not just on screen mount.

**Original requirement** (removed):
- The badge updates only when the user navigates to the Waves screen

**New requirement**:
- The badge updates immediately after auto-grouping completes, regardless of current screen

## Validation Scenarios

### Scenario: Multiple photo uploads in quick succession
- **WHEN** user uploads 3 photos in quick succession
- **AND** each triggers a `flushUngroupedPhotos` call
- **THEN** each auto-group operation SHALL update the badge independently
- **AND** the badge SHALL reflect the cumulative effect of all three operations

### Scenario: Badge update during automatic auto-group with multiple batches
- **WHEN** automatic auto-grouping processes 500 ungrouped photos across 5 API calls
- **THEN** `emitAutoGroupDone()` SHALL be emitted only after the final batch completes
- **AND** the badge SHALL update once at the end of the entire operation

### Scenario: User navigates during automatic auto-group
- **WHEN** automatic auto-grouping starts while user is on PhotosList
- **AND** user navigates to another screen during the 5-second delay or auto-group loop
- **THEN** badge SHALL update when the operation completes, even though user is no longer on the Waves screen

### Scenario: Automatic auto-group with zero ungrouped photos
- **WHEN** `flushUngroupedPhotos` is called but there are zero ungrouped photos
- **THEN** the auto-group loop SHALL NOT execute
- **AND** `emitAutoGroupDone()` SHALL still be emitted (to ensure badge is consistent)
- **AND** no progress overlay shall appear

### Scenario: Automatic auto-group with error
- **WHEN** the `autoGroupPhotosIntoWaves` mutation fails during automatic trigger
- **THEN** an error toast SHALL appear (despite silent mode)
- **AND** `emitAutoGroupDone()` SHALL still be emitted (to refresh counts to current state)
- **AND** the badge SHALL update to reflect current ungrouped count
