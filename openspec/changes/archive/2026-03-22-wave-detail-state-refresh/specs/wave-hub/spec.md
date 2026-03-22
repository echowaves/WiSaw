## ADDED Requirements

### Requirement: Waves List Focus Refresh
The system SHALL re-fetch the waves list and ungrouped photo count from the API every time the Waves screen gains focus, ensuring wave names, photo counts, and the ungrouped badge reflect the latest server state.

#### Scenario: User returns to Waves screen after viewing wave detail
- **WHEN** the Waves screen (WavesHub) regains focus (via `useFocusEffect`)
- **THEN** the system SHALL reset pagination and call `loadWaves` with page 0 and a new batch UUID in refresh mode
- **THEN** the waves list SHALL be replaced with the fresh server response including updated names and photo counts

#### Scenario: Ungrouped count refreshes on focus
- **WHEN** the Waves index screen regains focus
- **THEN** the system SHALL call `fetchUngroupedCount()` to re-query `getUngroupedPhotosCount`
- **THEN** the badge on the auto-group button SHALL display the current count

#### Scenario: Wave was renamed while viewing detail
- **WHEN** the user renamed a wave in WaveDetail and navigates back
- **THEN** the waves list SHALL show the updated wave name after the focus refresh completes

#### Scenario: Photos were removed while viewing detail
- **WHEN** photos were removed from a wave while viewing its detail and the user navigates back
- **THEN** the wave's `photosCount` in the list SHALL reflect the current count after the focus refresh completes
