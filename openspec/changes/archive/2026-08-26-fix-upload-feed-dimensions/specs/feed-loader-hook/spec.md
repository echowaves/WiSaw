## MODIFIED Requirements

### Requirement: Feed loader upload subscription is opt-in
The hook SHALL accept a `subscribeToUploads` parameter (default `false`). When `true`, it SHALL subscribe to the upload completion bus and prepend newly uploaded photos to `photosList`. When `false`, no upload subscription SHALL be created. When deduplicating an incoming upload-completion photo against an existing list entry with the same `id`, the entry with valid positive `width` and `height` SHALL take precedence: a dimensionless incoming photo SHALL NOT replace an existing dimensioned entry.

#### Scenario: Upload subscription enabled
- **WHEN** `useFeedLoader` is called with `subscribeToUploads: true`
- **THEN** it SHALL subscribe to the upload bus
- **WHEN** an upload completes
- **THEN** the uploaded photo SHALL be frozen and prepended to `photosList`

#### Scenario: Upload subscription disabled
- **WHEN** `useFeedLoader` is called with `subscribeToUploads: false` or default
- **THEN** no upload bus subscription SHALL be created

#### Scenario: Dimensioned duplicate wins over dimensionless incoming
- **WHEN** an upload-completion photo has the same `id` as an entry already in `photosList`
- **AND** the existing entry has valid positive `width` and `height` and the incoming photo does not
- **THEN** the existing dimensioned entry SHALL be retained in the list
- **THEN** the dimensionless incoming photo SHALL be discarded
- **THEN** the feed tile for that photo SHALL continue rendering with its correct aspect ratio
