# Photo Feed Sort Specification

## Purpose
Manages sort preferences for wave and friend photo feeds with persistence across app restarts.

## Requirements

### Requirement: Photo feed sort state and persistence
The system SHALL maintain sort preferences (`sortBy`, `sortDirection`) for wave photo feeds and friend photo feeds via jotai atoms. Sort preferences SHALL be persisted to SecureStore so they survive app restarts. Default sort SHALL be `createdAt` descending.

#### Scenario: Sort preference persists across app restarts
- **WHEN** the user sets wave feed sort to "Created, Oldest First" and restarts the app
- **THEN** the wave feed sort preference SHALL be restored to `createdAt` ascending

#### Scenario: Default sort on first use
- **WHEN** no sort preference has been saved
- **THEN** the default sort SHALL be `createdAt` descending (newest first)

### Requirement: Photo feed sort options in kebab menu
Both the wave detail and friend detail kebab menus SHALL include sort options after a separator: "Updated, Newest First", "Updated, Oldest First", "Created, Newest First", "Created, Oldest First". The active sort option SHALL display a checkmark. Selecting a sort option SHALL update the sort state and trigger a full re-fetch from page 0 with a new batch.

#### Scenario: Sort menu displays current selection
- **WHEN** the user opens the kebab menu on a photo feed screen
- **THEN** the active sort option SHALL display a checkmark icon

#### Scenario: Changing sort re-fetches photos
- **WHEN** the user selects a different sort option
- **THEN** the photo list SHALL reset to page 0 with a new batch
- **THEN** photos SHALL be re-fetched with the new `sortBy` and `sortDirection` params
