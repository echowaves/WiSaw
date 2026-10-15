# Spec Delta

## ADDED Requirements

### Requirement: Staged videos remain recoverable after interruption
A queued video SHALL remain recoverable if its original stable file has been moved to the staging path before the queue entry is updated or the backend photo record is created. The client SHALL locate the staged video, restore the queue entry's usable media paths, and resume upload processing instead of classifying the item as missing while the staged video exists.

#### Scenario: App stops after moving the video but before saving its staged path
- **WHEN** the app stops after the stable original video has been moved to its staging path
- **AND** the queue entry still contains only the original stable path
- **THEN** recovery SHALL locate the staged video using the queue item's persisted identity and staging convention
- **THEN** the queue item SHALL remain recoverable and proceed through thumbnail generation and upload

#### Scenario: Photo creation times out after the server creates the record
- **WHEN** the server creates a photo record but the client does not receive the response
- **AND** the staged video exists on disk
- **THEN** the next upload attempt SHALL restore the staged video and its thumbnail paths
- **THEN** the client SHALL resume the existing photo's upload without classifying the queue item as missing

#### Scenario: Staged video is also missing
- **WHEN** neither the original stable video nor its expected staged video exists
- **THEN** the queue item SHALL be classified as unrecoverable for a missing local file
- **THEN** the queue item SHALL remain visible until the user explicitly removes it
