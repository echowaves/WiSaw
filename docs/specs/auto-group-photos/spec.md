## Purpose
This specification defines expected user-visible behavior, constraints, and validation scenarios for auto group photos in WiSaw.

## Requirements

### Requirement: Auto-group button on Waves screen
The Waves screen SHALL display an "Auto-Group" action button in the upper-right nav bar header that shows the number of ungrouped photos as a badge. The badge SHALL update after auto-group operations complete and on screen mount.

#### Scenario: Auto-group button shows ungrouped count
- **WHEN** the user navigates to the Waves screen and there are ungrouped photos
- **THEN** the auto-group button in the upper-right nav bar SHALL display a red badge with the ungrouped photo count
- **THEN** counts above 99 SHALL display as "99+"

#### Scenario: No ungrouped photos
- **WHEN** the user navigates to the Waves screen and there are no ungrouped photos
- **THEN** the auto-group button SHALL NOT display a badge

#### Scenario: Badge refreshes after auto-group
- **WHEN** the auto-group operation completes
- **THEN** the header button badge SHALL update to reflect the new ungrouped photo count

#### Scenario: Auto-group button is disabled during loading
- **WHEN** the auto-group operation is in progress
- **THEN** the auto-group button SHALL be disabled and display a loading indicator

### Requirement: Confirmation before auto-grouping
The system SHALL display a confirmation dialog before executing the auto-group operation to prevent accidental invocations. The confirmation dialog SHALL include the number of ungrouped photos available for grouping.

#### Scenario: User confirms auto-group
- **WHEN** the user taps the "Auto-Group" button
- **THEN** the system SHALL display a confirmation dialog that includes the ungrouped photo count (e.g. "You have 42 ungrouped photos. This will automatically group them into waves. Continue?")
- **WHEN** the user confirms
- **THEN** the system SHALL call the `autoGroupPhotosIntoWaves` mutation with the user's UUID

#### Scenario: User cancels auto-group
- **WHEN** the user taps the "Auto-Group" button and the confirmation dialog appears
- **WHEN** the user cancels
- **THEN** no mutation SHALL be called and the screen SHALL remain unchanged

### Requirement: Auto-group uses persisted grouping level
The system SHALL call the `autoGroupPhotosIntoWaves(uuid: String!, groupingLevel: GroupingLevel!)` GraphQL mutation with the **persisted** `groupingLevel` value from the user's settings in ALL code paths that trigger auto-grouping, including:
- User-triggered via Waves Hub UI (menu action, explainer view, ungrouped photos card)
- Automatic location-drift trigger
- Post-upload flush (`flushUngroupedPhotos`)

The `groupingLevel` SHALL be read from `groupingAtom` (in React components) or `_groupingState` (in non-React code like `photoUploadService.js`). If the value is not yet hydrated, the default value `CITY` SHALL be used as fallback. The system SHALL NOT hardcode a grouping level in any call site.

#### Scenario: Auto-group uses persisted grouping level after restart
- **WHEN** the user sets grouping level to "DISTRICT" in Settings, closes the app, and restarts it
- **THEN** `groupingAtom` SHALL be hydrated from AsyncStorage with `groupingLevel: "DISTRICT"` during app startup
- **THEN** when the user triggers auto-group, the mutation SHALL be called with `groupingLevel: "DISTRICT"`

#### Scenario: Auto-group uses configured grouping level
- **WHEN** the user triggers auto-group with grouping level set to "DISTRICT" in settings
- **THEN** the `autoGroupPhotosIntoWaves` mutation SHALL be called with `groupingLevel: "DISTRICT"`

#### Scenario: Auto-group uses CITY grouping level (default)
- **WHEN** the user triggers auto-group with grouping level set to "CITY" (default)
- **THEN** the `autoGroupPhotosIntoWaves` mutation SHALL be called with `groupingLevel: "CITY"`

#### Scenario: Auto-group uses REGION grouping level
- **WHEN** the user triggers auto-group with grouping level set to "REGION" in settings
- **THEN** the `autoGroupPhotosIntoWaves` mutation SHALL be called with `groupingLevel: "REGION"`

#### Scenario: Auto-group uses COUNTRY grouping level
- **WHEN** the user triggers auto-group with grouping level set to "COUNTRY" in settings
- **THEN** the `autoGroupPhotosIntoWaves` mutation SHALL be called with `groupingLevel: "COUNTRY"`

#### Scenario: Grouping level change creates new wave
- **WHEN** the user changes grouping level from "CITY" to "DISTRICT" and triggers auto-group
- **THEN** the server SHALL detect the grouping level change
- **THEN** the server SHALL create a new wave with `groupingLevel: "DISTRICT"` stored on it
- **THEN** the server SHALL deactivate the previous active wave

#### Scenario: Post-upload auto-group uses configured grouping level
- **WHEN** a photo upload completes and `flushUngroupedPhotos` is called
- **THEN** the mutation SHALL be called with `groupingLevel` from `_groupingState.groupingLevel`
- **AND** SHALL NOT use a hardcoded `'CITY'` value

#### Scenario: Post-upload auto-group falls back to CITY when state not hydrated
- **WHEN** `flushUngroupedPhotos` is called before `_groupingState` is hydrated
- **THEN** the mutation SHALL be called with `groupingLevel: 'CITY'` as a fallback

#### Scenario: Auto-group mutation fails without grouping level
- **WHEN** the `groupingLevel` parameter is not provided
- **THEN** the server SHALL throw an error (no default fallback)
- **AND** the client SHALL display an error toast

#### Scenario: Settings UI reflects persisted value after restart
- **WHEN** the user sets grouping level to "DISTRICT", closes and restarts the app
- **THEN** the Grouping Settings screen SHALL display "Near (DISTRICT)" as selected
- **THEN** the `groupingAtom.groupingLevel` SHALL equal `"DISTRICT"` before any user interaction

### Requirement: Auto-group mutation execution
The system SHALL call the `autoGroupPhotosIntoWaves(uuid: String!, groupingLevel: GroupingLevel!)` GraphQL mutation in a loop to group ungrouped photos into waves in batches. Each call returns `{ waveUuid: String, name: String, photosGrouped: Int!, photosRemaining: Int!, hasMore: Boolean!, wavesCreated: Int! }`. The loop SHALL continue while `hasMore` is `true`. **The `groupingLevel` parameter SHALL be read from the user's configured grouping settings (`groupingAtom.groupingLevel`) at the time of each call.** After the loop completes, the system SHALL set the ungrouped photos count to `photosRemaining` from the final API response instead of hardcoding to `0`. During execution, a progress overlay SHALL be displayed. The system SHALL NOT update any active wave state after auto-grouping completes.

#### Scenario: Progress overlay appears during auto-group
- **WHEN** the user confirms the auto-group action
- **THEN** a semi-transparent modal overlay SHALL appear with an ActivityIndicator and progress text
- **THEN** the overlay SHALL block interaction with the underlying UI

#### Scenario: Progress overlay updates after each batch
- **WHEN** a batch completes (each `autoGroupPhotosIntoWaves` call returns)
- **THEN** the overlay text SHALL update to show the running total of photos grouped, waves created, and photos remaining

#### Scenario: Auto-group completes without active wave update
- **WHEN** the auto-group loop finishes (all batches processed, `hasMore` is false)
- **THEN** the system SHALL NOT call `setActiveWave` or `saveActiveWave`
- **THEN** the system SHALL refresh the waves list and update counts only

#### Scenario: Wave count uses server-reported value
- **WHEN** the auto-group loop calls the mutation multiple times
- **THEN** the system SHALL accumulate the `wavesCreated` field from each batch response into a running total
- **THEN** the displayed wave count SHALL reflect the actual number of waves created by the server, not client-side Set counting

#### Scenario: Progress overlay dismisses on completion
- **WHEN** the auto-group loop finishes (either all batches complete or an error occurs)
- **THEN** the progress overlay SHALL be dismissed
- **THEN** the success or error toast SHALL appear

#### Scenario: Successful auto-group with results
- **WHEN** the auto-group loop finishes with `hasMore: false`
- **THEN** the system SHALL display a success toast showing the accumulated wave count and total photos grouped
- **THEN** the system SHALL set ungrouped photos count to `photosRemaining` from the final response
- **THEN** the system SHALL refresh the waves list

#### Scenario: Successful auto-group with no ungrouped photos
- **WHEN** the first mutation call returns `hasMore: false` and `photosGrouped: 0`
- **THEN** the system SHALL display an informational toast indicating no ungrouped photos were found
- **THEN** the waves list SHALL remain unchanged

#### Scenario: Auto-group mutation failure mid-loop
- **WHEN** a mutation call fails with an error after one or more waves have been created
- **THEN** the system SHALL stop the loop
- **THEN** the system SHALL display an error toast that includes how many waves were successfully created
- **THEN** the system SHALL refresh the waves list to reflect partial results

#### Scenario: Auto-group mutation failure on first call
- **WHEN** the first mutation call fails with an error
- **THEN** the system SHALL display an error toast with the error message
- **THEN** the waves list SHALL remain unchanged

### Requirement: Loading state during auto-group
The system SHALL provide visual feedback via a progress overlay while the auto-group loop is in progress.

#### Scenario: Progress overlay during auto-group loop
- **WHEN** the auto-group mutation loop is running
- **THEN** the system SHALL display a modal progress overlay with an ActivityIndicator and running totals
- **THEN** the overlay SHALL block all user interaction to prevent duplicate calls
- **THEN** the overlay SHALL dismiss when the loop completes or fails

### Requirement: Waves drawer badge shows upload target status
The Waves item in the navigation drawer SHALL display a colored dot badge on its icon when an upload target wave is set, using `CONST.MAIN_COLOR`.

#### Scenario: Upload target wave is set
- **WHEN** the drawer is opened and an upload target wave is set
- **THEN** the Waves drawer icon SHALL display a small filled circle badge in `CONST.MAIN_COLOR`

#### Scenario: No upload target wave
- **WHEN** the drawer is opened and no upload target wave is set
- **THEN** the Waves drawer icon SHALL NOT display any badge

#### Scenario: Badge updates reactively
- **WHEN** the upload target wave is set or cleared while the app is running
- **THEN** the drawer badge SHALL update immediately via the `uploadTargetWave` Jotai atom

### Requirement: Waves drawer label shows upload target wave name
The Waves drawer label SHALL display "Waves" as the primary label. When an upload target wave is set, the drawer item SHALL display the wave name on a second line below "Waves" in smaller, muted styling. The wave name line SHALL truncate with ellipsis if the name is too long.

#### Scenario: Upload target wave is set
- **WHEN** the drawer is opened and an upload target wave is set
- **THEN** the drawer item SHALL display "Waves" on the first line
- **THEN** the drawer item SHALL display the upload target wave name on a second line below "Waves"
- **THEN** the second line SHALL use a smaller font size and reduced opacity compared to the primary label

#### Scenario: No upload target wave
- **WHEN** the drawer is opened and no upload target wave is set
- **THEN** the drawer label SHALL display only "Waves" with no second line

#### Scenario: Long wave name truncation
- **WHEN** the upload target wave name exceeds the available drawer width
- **THEN** the wave name line SHALL truncate with an ellipsis
