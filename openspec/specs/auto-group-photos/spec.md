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

### Requirement: Auto-group mutation execution
The system SHALL call the `autoGroupPhotosIntoWaves(uuid: String!)` GraphQL mutation in a loop to group ungrouped photos into waves one wave at a time. Each call returns `{ waveUuid: String, name: String, photosGrouped: Int!, photosRemaining: Int!, hasMore: Boolean! }`. The loop SHALL continue while `hasMore` is `true`.

#### Scenario: Successful auto-group with results
- **WHEN** the user confirms the auto-group action
- **THEN** the system SHALL call the `autoGroupPhotosIntoWaves` mutation
- **THEN** for each call where `hasMore` is `true`, the system SHALL prepend the new wave to the waves list and continue calling
- **THEN** when `hasMore` is `false`, the loop SHALL stop
- **THEN** the system SHALL display a success toast showing the total number of waves created and total photos grouped
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
The system SHALL provide visual feedback while the auto-group loop is in progress.

#### Scenario: Loading indicator during auto-group loop
- **WHEN** the auto-group mutation loop is running
- **THEN** the system SHALL display a loading indicator
- **THEN** the auto-group button SHALL be disabled to prevent duplicate calls
- **THEN** newly created waves SHALL appear incrementally in the list as each mutation returns

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
