## MODIFIED Requirements

### Requirement: Wave Photo Masonry Display
The system SHALL display a wave's photos in a masonry grid layout using `PhotosListMasonry` and `ExpandableThumb` components with the starred-layout configuration (spacing: 8, responsive columns, baseHeight: 200), providing full interaction parity with the main feed's starred segment. The `fetchWavePhotos` reducer SHALL pass `sortBy` and `sortDirection` parameters to the `feedForWave` GraphQL query. When sort preferences change, the screen SHALL reset pagination to page 0 with a new batch and re-fetch photos. When a photo is expanded inline, the view SHALL automatically scroll so the expanded photo's top edge is visible below the header. When a photo is deleted, removed from the wave, or moved to another wave — whether from the collapsed QuickActionsModal or from within the expanded `Photo` component — the photo SHALL be immediately filtered from the wave's local photo list and the masonry grid SHALL re-render without it. WaveDetail SHALL provide a `PhotosListContext` so the `Photo` component's deletion handler updates the correct screen-local state. Uploaded photos SHALL only be prepended to the wave's photo list when the upload bus emits an event with a `waveUuid` matching the current wave. The screen SHALL subscribe to the `photoDeletionBus` and remove matching photos from its local state when a deletion event is received from another screen. The initial data load and full state reset (pagination, expanded photos, batch) SHALL only occur when `waveUuid` changes, NOT on every focus return. Expanded photo state SHALL be preserved when returning from modal overlays such as the comment input modal. Photo actions (remove, delete, comment) SHALL be gated by the user's `myRole` and the wave's `isFrozen` state.

#### Scenario: User opens wave detail
- **WHEN** the user taps a wave card in the Waves Hub
- **THEN** a Wave Detail screen is pushed onto the waves Stack at `/waves/<waveUuid>` showing all photos in that wave in a masonry layout matching the starred photos segment style

#### Scenario: Role displayed in wave detail header
- **WHEN** the user opens the wave detail screen
- **THEN** the header SHALL display the user's role (owner/facilitator/contributor)

#### Scenario: Frozen wave banner
- **WHEN** the user opens a wave detail screen for a frozen wave
- **THEN** a banner SHALL indicate the wave is frozen and content is immutable

#### Scenario: Role-gated photo actions in wave detail
- **WHEN** a user interacts with photos in the wave detail
- **THEN** available actions SHALL respect the role permission matrix and frozen state

## ADDED Requirements

### Requirement: Wave detail header menu extended
The wave detail header menu SHALL include new items for sharing, member management, moderation, and settings, gated by role.

#### Scenario: Owner opens header menu
- **WHEN** the wave owner opens the wave detail header menu
- **THEN** the menu SHALL include: Edit Wave, Share Wave, Manage Members, Wave Settings, Delete Wave, and sort options

#### Scenario: Facilitator opens header menu
- **WHEN** a facilitator opens the wave detail header menu
- **THEN** the menu SHALL include: Share Wave, Moderation, and sort options

#### Scenario: Contributor opens header menu
- **WHEN** a contributor opens the wave detail header menu
- **THEN** the menu SHALL include sort options and Report Content
