## ADDED Requirements

### Requirement: Upload queue removal by stable key
A successfully uploaded queue item SHALL be removed from the upload queue exactly once, identified by its stable `photoId`, regardless of how the stored queue entry was enriched during processing (e.g., added local file URLs or the created photo record). The upload completion event for an item SHALL be emitted exactly once per successful upload.

#### Scenario: Item removed after successful upload despite enrichment
- **WHEN** a queue item is processed, its stored queue entry is replaced with an enriched version during processing
- **AND** the S3 upload and photo creation succeed
- **THEN** the item SHALL be removed from the queue by its `photoId`
- **THEN** the item SHALL NOT be processed a second time in the same queue pass
- **THEN** exactly one upload completion event SHALL be emitted for the item

#### Scenario: Re-processed item does not evict a dimensioned feed entry
- **WHEN** a photo is returned from the upload pipeline in the "already active" state (created earlier, backend processing finished)
- **THEN** the returned photo SHALL carry valid `width` and `height` values
- **THEN** the emitted upload completion event SHALL contain a photo with valid dimensions in every pipeline outcome (newly created, inactive re-upload, and already-active)

### Requirement: Photo lookup returns dimensions
The upload pipeline's photo lookup (by photo ID and device UUID) SHALL return the photo's `width` and `height` when the backend has populated them, so that any pipeline path returning an existing photo emits a fully dimensioned photo to the upload event bus.

#### Scenario: Lookup of a fully processed photo
- **WHEN** the upload pipeline looks up a photo whose backend processing has completed (dimensions stored)
- **THEN** the lookup result SHALL include numeric `width` and `height`

#### Scenario: Lookup of a not-yet-processed photo
- **WHEN** the upload pipeline looks up a photo whose backend processing has not yet stored dimensions
- **THEN** the lookup result MAY include null or missing `width`/`height`
- **THEN** the pipeline SHALL fall back to local dimension extraction for the emitted photo
