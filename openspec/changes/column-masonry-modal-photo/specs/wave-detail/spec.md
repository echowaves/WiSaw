## MODIFIED Requirements

### Requirement: Wave Photo Masonry Display
The system SHALL display a wave's photos in a column-based masonry grid layout using `PhotosListMasonry` and `ExpandableThumb` components with the starred-layout configuration (spacing: 8, responsive columns, baseHeight: 200), using `layoutMode='column'` and `columns={2}`. The `fetchWavePhotos` reducer SHALL pass `sortBy` and `sortDirection` parameters to the `feedForWave` GraphQL query. When sort preferences change, the screen SHALL reset pagination to page 0 with a new batch and re-fetch photos. When the user taps a photo thumbnail, the app SHALL navigate to the `/photo-detail` modal route instead of expanding inline. When a photo is deleted or removed from the wave — whether from the QuickActionsModal or from within the Photo component in the detail modal — the photo SHALL be immediately filtered from the wave's local photo list and the masonry grid SHALL re-render without it. WaveDetail SHALL provide a `PhotosListContext` so the `Photo` component's deletion handler (in the modal) updates the correct screen-local state. Uploaded photos SHALL only be prepended to the wave's photo list when the upload bus emits an event with a `waveUuid` matching the current wave. The screen SHALL subscribe to the `photoDeletionBus` and remove matching photos from its local state when a deletion event is received from another screen. The initial data load and full state reset (pagination, batch) SHALL only occur when `waveUuid` changes, NOT on every focus return. Photo actions (remove, delete, comment) SHALL be gated by the user's `myRole` and the wave's `isFrozen` state.

#### Scenario: User opens wave detail
- **WHEN** the user taps a wave card in the Waves Hub
- **THEN** a Wave Detail screen is pushed onto the waves Stack at `/waves/<waveUuid>` showing all photos in that wave in a column-based masonry layout

#### Scenario: Wave has photos
- **WHEN** the wave contains photos
- **THEN** photos are rendered using `ExpandableThumb` with `showComments={true}`
- **THEN** thumbnails display comment sections below the image

#### Scenario: User taps a photo in wave detail
- **WHEN** the user taps a photo tile in the wave masonry grid
- **THEN** the app SHALL set `photoDetailAtom` with the photo and `removePhoto` callback
- **THEN** the app SHALL navigate to `/photo-detail` modal
- **THEN** no inline expansion SHALL occur

#### Scenario: Photo detail modal preserves wave state
- **WHEN** the user opens a photo detail modal from wave detail
- **THEN** upon returning from the modal, the wave photo list and scroll position SHALL be preserved
- **THEN** the photo list SHALL NOT reload from scratch

#### Scenario: User long-presses a photo in wave detail
- **WHEN** the user long-presses a photo tile in the wave masonry grid
- **THEN** the `QuickActionsModal` opens with the photo preview and action buttons

#### Scenario: Photo removed from wave via quick-actions modal
- **WHEN** the user removes a photo from the wave via the QuickActionsModal (remove or move to another wave)
- **THEN** the QuickActionsModal closes immediately
- **THEN** the photo is filtered from the wave's local photo list
- **THEN** the masonry grid re-renders without the removed photo

#### Scenario: Photo deleted in modal removes from wave
- **WHEN** the user deletes a photo from within the photo detail modal (opened from wave detail)
- **THEN** the `removePhoto` function from `photoDetailAtom` SHALL remove the photo from the wave's local list
- **THEN** when the modal dismisses, the masonry grid SHALL re-render without the deleted photo

#### Scenario: Wave has no photos
- **WHEN** the wave is empty
- **THEN** an empty state is shown with a prompt to add photos

#### Scenario: Cross-screen photo deletion received
- **WHEN** the `photoDeletionBus` emits `{ photoId }`
- **THEN** the WaveDetail screen SHALL remove the photo with that ID from its local state

#### Scenario: Full reset on wave change
- **WHEN** the user navigates to a different wave (waveUuid changes)
- **THEN** pagination SHALL be reset to page 0
- **THEN** photos SHALL be reloaded from the server
