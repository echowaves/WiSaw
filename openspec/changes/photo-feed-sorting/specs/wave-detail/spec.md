## MODIFIED Requirements

### Requirement: Wave Photo Masonry Display
The system SHALL display a wave's photos in a masonry grid layout using `PhotosListMasonry` and `ExpandableThumb` components with the starred-layout configuration (spacing: 8, responsive columns, baseHeight: 200), providing full interaction parity with the main feed's starred segment. The `fetchWavePhotos` reducer SHALL pass `sortBy` and `sortDirection` parameters to the `feedForWave` GraphQL query. When sort preferences change, the screen SHALL reset pagination to page 0 with a new batch and re-fetch photos. When a photo is expanded inline, the view SHALL automatically scroll so the expanded photo's top edge is visible below the header. When a photo is deleted, removed from the wave, or moved to another wave — whether from the collapsed QuickActionsModal or from within the expanded `Photo` component — the photo SHALL be immediately filtered from the wave's local photo list and the masonry grid SHALL re-render without it.

#### Scenario: User opens wave detail
- **WHEN** the user taps a wave card in the Waves Hub
- **THEN** a Wave Detail screen is pushed onto the waves Stack at `/waves/<waveUuid>` showing all photos in that wave in a masonry layout matching the starred photos segment style

#### Scenario: Sort params passed to feedForWave
- **WHEN** the wave detail screen fetches photos
- **THEN** `fetchWavePhotos` SHALL pass the current `sortBy` and `sortDirection` to the `feedForWave` query

#### Scenario: Sort change triggers re-fetch
- **WHEN** the user changes the sort option in the wave detail kebab menu
- **THEN** the photo list SHALL reset to page 0 with a new batch UUID
- **THEN** photos SHALL be re-fetched with the updated sort parameters
