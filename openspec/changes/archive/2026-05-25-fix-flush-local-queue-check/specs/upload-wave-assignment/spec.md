## MODIFIED Requirements

### Requirement: Flush ungrouped photos after upload queue drains
The system SHALL flush any pending ungrouped photos via `autoGroupPhotosIntoWaves` after all queued photos have been uploaded successfully, with a 5-second delay to allow backend processing. The flush SHALL NOT run during individual photo uploads. **When auto-grouping is disabled (`grouping.enabled === false`), the flush step SHALL be skipped entirely.** The flush SHALL NOT check the local upload queue for ungrouped items — the server determines which photos are ungrouped.

#### Scenario: Flush calls server without local queue check
- **WHEN** `flushUngroupedPhotos` is called after queue drain
- **AND** grouping is enabled
- **THEN** the system SHALL call `autoGroupPhotos` on the server directly
- **THEN** the system SHALL NOT read the local upload queue as a precondition
