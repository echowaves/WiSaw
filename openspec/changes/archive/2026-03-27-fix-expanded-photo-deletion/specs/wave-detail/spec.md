## MODIFIED Requirements

### Requirement: Wave Photo Masonry Display
The system SHALL display a wave's photos in a masonry grid layout using `PhotosListMasonry` and `ExpandableThumb` components with the starred-layout configuration (spacing: 8, responsive columns, baseHeight: 200), providing full interaction parity with the main feed's starred segment. When a photo is expanded inline, the view SHALL automatically scroll so the expanded photo's top edge is visible below the header. When a photo is deleted, removed from the wave, or moved to another wave — whether from the collapsed QuickActionsModal or from within the expanded `Photo` component — the photo SHALL be immediately filtered from the wave's local photo list and the masonry grid SHALL re-render without it. WaveDetail SHALL provide a `PhotosListContext` so the `Photo` component's deletion handler updates the correct screen-local state.

#### Scenario: User opens wave detail
- **WHEN** the user taps a wave card in the Waves Hub
- **THEN** a Wave Detail screen is pushed onto the waves Stack at `/waves/<waveUuid>` showing all photos in that wave in a masonry layout matching the starred photos segment style

#### Scenario: Wave detail receives waveUuid from route segment
- **WHEN** the Wave Detail screen component mounts
- **THEN** the `waveUuid` is obtained from the dynamic route segment `[waveUuid]` via `useLocalSearchParams()`
- **THEN** the `waveName` is obtained from search params via `useLocalSearchParams()`

#### Scenario: Wave has photos
- **WHEN** the wave contains photos
- **THEN** photos are rendered using `ExpandableThumb` with `showComments={true}`
- **THEN** thumbnails display comment count overlays

#### Scenario: User taps a photo in wave detail
- **WHEN** the user taps a photo tile in the wave masonry grid
- **THEN** the photo expands inline showing the full `Photo` component with image, comments, AI tags, and action buttons

#### Scenario: Expanded photo scrolls into view
- **WHEN** a photo is expanded inline in the wave detail masonry grid
- **THEN** the view SHALL automatically scroll so the expanded photo's top edge is visible below the header, with the same behavior as the main photo feed

#### Scenario: User long-presses a photo in wave detail
- **WHEN** the user long-presses a photo tile in the wave masonry grid
- **THEN** the `QuickActionsModal` opens with the photo preview and action buttons

#### Scenario: Photo removed from wave via quick-actions modal
- **WHEN** the user removes a photo from the wave via the QuickActionsModal (remove or move to another wave)
- **THEN** the QuickActionsModal closes immediately
- **THEN** the photo is filtered from the wave's local photo list
- **THEN** the masonry grid re-renders without the removed photo

#### Scenario: Photo deleted from expanded view
- **WHEN** the user deletes a photo from within the expanded `Photo` component
- **THEN** the `Photo` component SHALL call `removePhoto(photoId)` from `PhotosListContext`
- **THEN** the photo SHALL be immediately filtered from the wave's local photo list
- **THEN** the masonry grid SHALL re-render without the deleted photo

#### Scenario: Photo removed from wave in expanded view
- **WHEN** the user removes a photo from the wave while viewing it in expanded mode
- **THEN** the `Photo` component SHALL call `removePhoto(photoId)` from `PhotosListContext`
- **THEN** the photo SHALL be immediately filtered from the wave's local photo list
- **THEN** the masonry grid SHALL re-render without the removed photo

#### Scenario: Wave has no photos
- **WHEN** the wave is empty
- **THEN** an empty state is shown with a prompt to add photos
