## MODIFIED Requirements

### Requirement: Auto-group mutation execution
The system SHALL call the `autoGroupPhotosIntoWaves(uuid: String!, groupingLevel: GroupingLevel!)` GraphQL mutation in a loop to group ungrouped photos into waves in batches. Each call returns `{ waveUuid: String, name: String, photosGrouped: Int!, photosRemaining: Int!, hasMore: Boolean!, wavesCreated: Int! }`. The loop SHALL continue while `hasMore` is `true`. **The `groupingLevel` parameter SHALL be read from the user's configured grouping settings (`groupingAtom.groupingLevel`) at the time of each call.** After the loop completes, the system SHALL set the ungrouped photos count to `photosRemaining` from the final API response instead of hardcoding to `0`. During execution, a progress overlay SHALL be displayed.

#### Scenario: Progress overlay appears during auto-group
- **WHEN** the user confirms the auto-group action
- **THEN** a semi-transparent modal overlay SHALL appear with an ActivityIndicator and progress text
- **THEN** the overlay SHALL block interaction with the underlying UI

#### Scenario: Progress overlay updates after each batch
- **WHEN** a batch completes (each `autoGroupPhotosIntoWaves` call returns)
- **THEN** the overlay text SHALL update to show the running total of photos grouped, waves created, and photos remaining
- **THEN** the text format SHALL be: "N photos grouped into M waves" on one line and "R remaining" on a second line when `photosRemaining > 0`

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
