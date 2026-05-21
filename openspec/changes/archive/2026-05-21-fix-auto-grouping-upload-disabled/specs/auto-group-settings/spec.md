## ADDED Requirements

### Requirement: Enabled flag controls all grouping operations
The `enabled` setting in the grouping configuration SHALL control ALL client-side auto-grouping behavior, including but not limited to:
- The location-drift auto-trigger in WavesHub (existing)
- Batch flushing of ungrouped photos via `autoGroupPhotosIntoWaves` during upload (new)
- Per-photo wave assignment via `checkAndAssignWave()` during upload (new)

When `enabled` is `false`, no automatic grouping or wave assignment SHALL occur. Uploaded photos remain ungrouped and accumulate in the UngroupedPhotosCard for manual grouping later.

#### Scenario: Enabled false disables all auto-grouping
- **WHEN** user sets grouping enabled to `false` in Grouping Settings
- **THEN** location-drift auto-trigger in WavesHub SHALL be skipped (existing behavior)
- **AND** batch flush of ungrouped photos during upload SHALL be skipped (new)
- **AND** per-photo wave assignment via drift check during upload SHALL be skipped (new)

#### Scenario: Enabled true re-enables all grouping operations
- **WHEN** user sets grouping enabled to `true` in Grouping Settings
- **THEN** location-drift auto-trigger in WavesHub resumes (existing behavior)
- **AND** batch flush of ungrouped photos during upload resumes (new)
- **AND** per-photo wave assignment via drift check during upload resumes (new)

#### Scenario: Ungrouped photos persist when disabled
- **WHEN** grouping is disabled and new photos are uploaded
- **THEN** those photos SHALL remain in the ungrouped pool
- **THEN** they SHALL be visible in the `UngroupedPhotosCard` with an "Auto Group Into Waves" CTA
