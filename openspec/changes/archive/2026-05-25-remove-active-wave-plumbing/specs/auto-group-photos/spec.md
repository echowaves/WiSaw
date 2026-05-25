## MODIFIED Requirements

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
