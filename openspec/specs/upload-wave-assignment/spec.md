# Upload Wave Assignment Specification

## Purpose
Wave assignment logic runs during photo upload (not capture time). Photos upload as ungrouped and are assigned to waves by the backend during auto-grouping. Before uploading, the system flushes any pending ungrouped photos.

## Requirements

### Requirement: Flush ungrouped photos before upload
The system SHALL flush any pending ungrouped photos via `autoGroupPhotosIntoWaves` before processing each photo for upload, ensuring uploads start from a clean state. **When auto-grouping is disabled (`grouping.enabled === false`), the flush step SHALL be skipped entirely.**

#### Scenario: Ungrouped photos exist — flush before upload
- **WHEN** `processCompleteUpload` is called and there are pending ungrouped photos in the queue
- **AND** grouping is enabled
- **THEN** the system SHALL call `autoGroupPhotosIntoWaves` to process them first
- **THEN** after flushing, proceed with uploading the current photo as ungrouped (no client-side wave assignment)

#### Scenario: No ungrouped photos — skip flush
- **WHEN** `processCompleteUpload` is called and there are no pending ungrouped photos
- **THEN** the system SHALL skip the flush step
- **THEN** proceed directly to uploading the current photo as ungrouped

#### Scenario: Auto-grouping disabled — skip flush entirely
- **WHEN** `processCompleteUpload` is called with grouping disabled (`grouping.enabled === false`)
- **AND** there are pending ungrouped photos in the queue
- **THEN** the system SHALL skip the flush step regardless of pending items
