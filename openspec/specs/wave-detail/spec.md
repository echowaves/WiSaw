## MODIFIED Requirements

### Requirement: Wave Photo Masonry Display
The system SHALL display a wave's photos in a masonry grid layout using `PhotosListMasonry` and `ExpandableThumb` components with the starred-layout configuration (spacing: 8, responsive columns, baseHeight: 200), providing full interaction parity with the main feed's starred segment.

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

#### Scenario: User long-presses a photo in wave detail
- **WHEN** the user long-presses a photo tile in the wave masonry grid
- **THEN** the `QuickActionsModal` opens with the photo preview and action buttons

#### Scenario: Wave has no photos
- **WHEN** the wave is empty
- **THEN** an empty state is shown with a prompt to add photos

### Requirement: Wave Detail Footer with Camera
The system SHALL display a `PhotosListFooter` at the bottom of the Wave Detail screen with camera, video, drawer, and friends buttons. Photos captured from this footer SHALL be automatically tagged to the current wave.

#### Scenario: User views wave detail
- **WHEN** the Wave Detail screen is displayed
- **THEN** a footer bar is shown with camera, video, navigation, and friends buttons matching the main feed footer

#### Scenario: User takes a photo from wave detail
- **WHEN** the user taps the camera button in the wave detail footer
- **THEN** the captured photo is queued for upload with the current wave's UUID attached

#### Scenario: User records a video from wave detail
- **WHEN** the user taps the video button in the wave detail footer
- **THEN** the recorded video is queued for upload with the current wave's UUID attached

### Requirement: Wave Detail Pending Uploads Banner
The system SHALL display a `PendingPhotosBanner` in the Wave Detail screen showing all pending uploads regardless of wave context.

#### Scenario: Uploads are pending
- **WHEN** one or more photos are in the upload queue while viewing wave detail
- **THEN** a pending uploads banner is displayed showing count and progress

#### Scenario: No pending uploads
- **WHEN** the upload queue is empty while viewing wave detail
- **THEN** no pending uploads banner is shown

### Requirement: Wave Detail Pagination
The system SHALL paginate photos in Wave Detail, loading more as the user scrolls. When the user reaches the bottom of the loaded photos, `PhotosListMasonry` SHALL delegate to the parent screen's `onEndReached` callback to fetch the next page of wave photos via the `feedForWave` GraphQL query.

#### Scenario: User scrolls to the end of loaded photos
- **WHEN** the user scrolls to the end of loaded photos in the wave detail masonry grid
- **THEN** `PhotosListMasonry` calls the `onEndReached` prop provided by WaveDetail
- **THEN** WaveDetail's `handleLoadMore` increments the page number and calls `loadPhotos` with the next page and current batch
- **THEN** new photos are appended to the existing list

#### Scenario: All photos already loaded
- **WHEN** the user scrolls to the bottom and `noMoreData` is true
- **THEN** `handleLoadMore` does not fire a new fetch
- **THEN** the loading indicator is not shown

#### Scenario: Fetch is already in progress
- **WHEN** the user scrolls to the bottom while a fetch is in progress
- **THEN** `PhotosListMasonry` does not call `onEndReached` (guarded by `!loading && !stopLoading`)
- **THEN** no duplicate network request is made

#### Scenario: onEndReached prop not provided
- **WHEN** a parent screen does not pass an `onEndReached` prop to `PhotosListMasonry`
- **THEN** `PhotosListMasonry` falls back to calling `setPageNumber` directly (existing behavior for PhotosList)

### Requirement: Wave Detail Loading Progress Bar
The system SHALL display a `LinearProgress` bar at the top of the WaveDetail content area whenever photo data is loading, matching the PhotosList loading indicator pattern.

#### Scenario: Photos are loading in wave detail
- **WHEN** the `loading` state is true (initial load, pagination, or refresh)
- **THEN** a 3px `LinearProgress` bar SHALL be displayed between the header and the masonry grid
- **THEN** the bar SHALL use `CONST.MAIN_COLOR` as the color and `theme.HEADER_BACKGROUND` as the track background

#### Scenario: Photos finish loading
- **WHEN** the `loading` state becomes false
- **THEN** the `LinearProgress` bar SHALL be hidden

#### Scenario: User interacts while loading
- **WHEN** the progress bar is visible
- **THEN** the masonry grid and all other UI elements SHALL remain interactive (non-blocking)

## REMOVED Requirements

### Requirement: Set Upload Target from Wave Detail
**Reason**: The upload target concept is being removed entirely. Photos are now tagged to waves contextually via the footer camera when viewing a wave detail screen.
**Migration**: Users take photos directly from the wave detail screen's camera footer instead of pre-selecting an upload target.

### Requirement: Remove Photo from Wave
**Reason**: Long-press on a photo in wave detail now opens the QuickActionsModal (matching main feed behavior) instead of showing a context menu with "Remove from Wave." Photo-to-wave management is handled through the Wave action button in the QuickActionsModal or full photo view.
**Migration**: Users use the Wave button in the expanded photo view or QuickActionsModal to manage wave assignment.

### Requirement: Wave Detail Centered Loading Spinner
**Reason**: Replaced by the `LinearProgress` bar for consistency with PhotosList. The centered `ActivityIndicator` that showed when `loading && photos.length === 0` is no longer used.
**Migration**: The `LinearProgress` bar at the top provides loading feedback in all cases. The `EmptyStateCard` continues to render when photos array is empty after load completes.
