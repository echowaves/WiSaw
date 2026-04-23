## Purpose
This specification defines expected user-visible behavior, constraints, and validation scenarios for wave detail in WiSaw.

## Requirements

### Requirement: Wave Photo Masonry Display
The system SHALL display a wave's photos in a masonry grid layout using `PhotosListMasonry` and `ExpandableThumb` components with the starred-layout configuration (spacing: 8, responsive columns, baseHeight: 200), providing full interaction parity with the main feed's starred segment. The WaveDetail screen SHALL pass a comment-screen column profile (`{ 402: 2, 440: 3, 834: 5, 1024: 7, default: 9 }`) to `PhotosListMasonry` via the `columns` prop. The `fetchWavePhotos` reducer SHALL pass `sortBy` and `sortDirection` parameters to the `feedForWave` GraphQL query. When sort preferences change, the screen SHALL reset pagination to page 0 with a new batch and re-fetch photos. When a photo is expanded inline, the view SHALL automatically scroll so the expanded photo's top edge is visible below the header. When a photo is deleted, removed from the wave, or moved to another wave — whether from the collapsed QuickActionsModal or from within the expanded `Photo` component — the photo SHALL be immediately filtered from the wave's local photo list and the masonry grid SHALL re-render without it. WaveDetail SHALL provide a `PhotosListContext` so the `Photo` component's deletion handler updates the correct screen-local state. Uploaded photos SHALL only be prepended to the wave's photo list when the upload bus emits an event with a `waveUuid` matching the current wave. The screen SHALL subscribe to the `photoDeletionBus` and remove matching photos from its local state when a deletion event is received from another screen. The initial data load and full state reset (pagination, expanded photos, batch) SHALL only occur when `waveUuid` changes, NOT on every focus return. Expanded photo state SHALL be preserved when returning from modal overlays such as the comment input modal. Photo actions (remove, delete, comment) SHALL be gated by the user's `myRole` and the wave's `isFrozen` state.

#### Scenario: User opens wave detail
- **WHEN** the user taps a wave card in the Waves Hub
- **THEN** a Wave Detail screen is pushed onto the waves Stack at `/waves/<waveUuid>` showing all photos in that wave in a masonry layout matching the starred photos segment style

#### Scenario: Wave detail uses comment-screen columns
- **WHEN** the WaveDetail screen renders `PhotosListMasonry`
- **THEN** it SHALL pass `columns={{ 402: 2, 440: 3, 834: 5, 1024: 7, default: 9 }}` to the masonry component

#### Scenario: Role displayed in wave detail header
- **WHEN** the user opens the wave detail screen
- **THEN** the header SHALL display the user's role (owner/facilitator/contributor)

#### Scenario: Frozen wave banner
- **WHEN** the user opens a wave detail screen for a frozen wave
- **THEN** a banner SHALL indicate the wave is frozen and content is immutable

#### Scenario: Role-gated photo actions in wave detail
- **WHEN** a user interacts with photos in the wave detail
- **THEN** available actions SHALL respect the role permission matrix and frozen state

#### Scenario: Sort params passed to feedForWave
- **WHEN** the wave detail screen fetches photos
- **THEN** `fetchWavePhotos` SHALL pass the current `sortBy` and `sortDirection` to the `feedForWave` query

#### Scenario: Sort change triggers re-fetch
- **WHEN** the user changes the sort option in the wave detail kebab menu
- **THEN** the photo list SHALL reset to page 0 with a new batch UUID
- **THEN** photos SHALL be re-fetched with the updated sort parameters

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

#### Scenario: Uploaded photo matches current wave
- **WHEN** the upload bus emits `{ photo, waveUuid }` and `waveUuid` matches the current wave
- **THEN** the photo SHALL be prepended (via `createFrozenPhoto`) to the wave's local photo list with deduplication

#### Scenario: Uploaded photo does not match current wave
- **WHEN** the upload bus emits `{ photo, waveUuid }` and `waveUuid` does NOT match the current wave (or is `undefined`)
- **THEN** the wave's local photo list SHALL NOT be modified

#### Scenario: Cross-screen photo deletion received
- **WHEN** the `photoDeletionBus` emits `{ photoId }`
- **THEN** the WaveDetail screen SHALL remove the photo with that ID from its local state
- **THEN** the masonry grid SHALL re-render without the deleted photo

#### Scenario: Deletion bus subscription cleanup
- **WHEN** the WaveDetail screen unmounts
- **THEN** the `photoDeletionBus` subscription SHALL be cleaned up via the `useEffect` return function

#### Scenario: Expanded photo preserved after modal return
- **WHEN** the user opens a modal overlay (e.g., comment input) from an expanded photo in WaveDetail
- **THEN** upon returning from the modal, the photo SHALL remain expanded
- **THEN** the photo list SHALL NOT reload from scratch

#### Scenario: Full reset on wave change
- **WHEN** the user navigates to a different wave (waveUuid changes)
- **THEN** expanded photo state SHALL be reset
- **THEN** pagination SHALL be reset to page 0
- **THEN** photos SHALL be reloaded from the server

### Requirement: Photo viewing in wave detail
The wave detail photo feed SHALL use inline expansion for photo detail viewing instead of modal navigation, consistent with the main feed behavior.

#### Scenario: Tap photo in wave detail
- **WHEN** user taps a photo thumbnail in a wave's photo feed
- **THEN** the photo expands inline showing full detail

### Requirement: Wave Detail Footer with Camera
The system SHALL display a `PhotosListFooter` at the bottom of the Wave Detail screen with camera, video, drawer, and friends buttons. Photos captured from this footer SHALL be automatically tagged to the current wave. The `enqueueCapture` function SHALL be consumed from `UploadContext`.

#### Scenario: User views wave detail
- **WHEN** the Wave Detail screen is displayed
- **THEN** a footer bar is shown with camera, video, navigation, and friends buttons matching the main feed footer

#### Scenario: User takes a photo from wave detail
- **WHEN** the user taps the camera button in the wave detail footer
- **THEN** `enqueueCapture` from `UploadContext` SHALL be called with the current wave's UUID attached
- **THEN** the captured photo is queued for upload with the wave UUID

#### Scenario: User records a video from wave detail
- **WHEN** the user taps the video button in the wave detail footer
- **THEN** `enqueueCapture` from `UploadContext` SHALL be called with the current wave's UUID attached
- **THEN** the recorded video is queued for upload with the wave UUID

### Requirement: Wave Detail Pending Uploads Banner
The system SHALL display a `PendingPhotosBanner` in the Wave Detail screen showing all pending uploads regardless of wave context. Upload state SHALL be consumed from `UploadContext` instead of a local `usePhotoUploader` instance.

#### Scenario: Uploads are pending
- **WHEN** one or more photos are in the upload queue while viewing wave detail
- **THEN** a pending uploads banner is displayed showing count and progress
- **THEN** `pendingPhotos` and `isUploading` SHALL be read from `UploadContext`

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

### Requirement: WaveDetail header menu options
The WaveDetail header SHALL display a kebab (three-dot vertical) menu icon using `MaterialCommunityIcons` `dots-vertical` (size 22) with styled button appearance matching the Waves list header (`SHARED_STYLES.interactive.headerButton`, themed background, and border). Tapping the icon SHALL open an `ActionMenu` modal with icon + label items for wave management. The menu SHALL include: Rename (`pencil-outline`), Edit Description (`text-box-edit-outline`), Merge Into Another Wave... (`call-merge`), and Delete Wave (`trash-can-outline`, destructive). A separator SHALL appear before the Delete item. All handler functions referenced by menu items MUST be defined before the `headerMenuItems` array that references them, to ensure valid function references at construction time.

#### Scenario: Wave Detail header renders kebab icon
- **WHEN** the user navigates to a Wave Detail screen
- **THEN** the header's right slot SHALL contain a TouchableOpacity styled with `SHARED_STYLES.interactive.headerButton`, `backgroundColor: theme.INTERACTIVE_BACKGROUND`, `borderWidth: 1`, `borderColor: theme.INTERACTIVE_BORDER`
- **THEN** the button SHALL contain a `dots-vertical` icon from `MaterialCommunityIcons` at size 22 with `theme.TEXT_PRIMARY` color

#### Scenario: Owner taps header kebab
- **WHEN** a wave owner taps the header kebab icon
- **THEN** an `ActionMenu` modal SHALL display with items:
  - `pencil-outline` icon: "Rename"
  - `text-box-edit-outline` icon: "Edit Description"
  - `call-merge` icon: "Merge Into Another Wave..."
  - separator
  - `trash-can-outline` icon: "Delete Wave" (destructive)

#### Scenario: User deletes wave from header menu
- **WHEN** the user selects Delete Wave from the ActionMenu
- **THEN** a confirmation `Alert.alert` dialog SHALL be shown with title "Delete Wave" and message "Are you sure? This cannot be undone." with Cancel and Delete buttons
- **THEN** upon confirmation, the `deleteWave` mutation SHALL be called with `{ waveUuid, uuid }`
- **THEN** the system SHALL emit `autoGroupDone` to trigger an ungrouped-photos count refresh
- **THEN** a success toast SHALL be shown with text "Wave deleted"
- **THEN** the system SHALL navigate back via `router.back()`

#### Scenario: Delete wave fails
- **WHEN** the `deleteWave` mutation throws an error
- **THEN** an error toast SHALL be shown with the error message
- **THEN** the user SHALL remain on the WaveDetail screen

#### Scenario: Handler declaration order
- **WHEN** the component defines `headerMenuItems`
- **THEN** all `onPress` handler functions (`handleDeleteWave`, etc.) MUST be declared above the `headerMenuItems` array in the source code to ensure valid references at construction time

#### Scenario: Owner renames wave
- **WHEN** the user edits the wave name and taps Save
- **THEN** the `updateWave` mutation SHALL be called
- **THEN** on success, `router.setParams({ waveName: editName })` SHALL update route params
- **THEN** the local `waveName` state SHALL be updated
- **THEN** a success toast SHALL be shown

#### Scenario: Post-merge navigation
- **WHEN** a merge completes successfully from WaveDetail
- **THEN** the system SHALL navigate back (via `router.back()`)

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
- **THEN** a success toast SHALL be shown with the target wave name

### Requirement: WaveDetail displays interaction hint banner
The WaveDetail screen SHALL render the shared `InteractionHintBanner` component to teach users about long-press photo interactions, positioned above the photo masonry grid.

#### Scenario: First visit to WaveDetail with photos
- **WHEN** the user opens a wave detail screen that has photos and SecureStore key `interactionHintShown` is not set
- **THEN** the `InteractionHintBanner` SHALL be displayed above the photo grid with text "Tap and hold for options or tap ⋮"

#### Scenario: WaveDetail with no photos
- **WHEN** the user opens a wave detail screen with zero photos
- **THEN** the `InteractionHintBanner` SHALL NOT be displayed

#### Scenario: Hint already dismissed
- **WHEN** the user opens a wave detail screen and SecureStore key `interactionHintShown` is set
- **THEN** the `InteractionHintBanner` SHALL NOT be displayed

### Requirement: Wave Detail Focus Refresh
The system SHALL re-fetch the wave's photos from the API every time the WaveDetail screen gains focus, ensuring photos removed or deleted while away are no longer displayed.

#### Scenario: User returns to WaveDetail after navigating away
- **WHEN** the WaveDetail screen regains focus (via `useFocusEffect`)
- **THEN** the system SHALL reset pagination to page 0 with a new batch UUID
- **THEN** the system SHALL call `loadPhotos` to fetch fresh data from the `feedForWave` query
- **THEN** the photos list SHALL be replaced with the server response
- **THEN** all expanded photo states SHALL be cleared

#### Scenario: Photo was removed from wave while away
- **WHEN** the user navigates away, a photo is removed from the wave (via another screen or device), and the user returns
- **THEN** the removed photo SHALL no longer appear in the masonry grid after the focus refresh completes

#### Scenario: Photo was deleted while away
- **WHEN** the user navigates away, a photo is deleted, and the user returns
- **THEN** the deleted photo SHALL no longer appear in the masonry grid after the focus refresh completes

### Requirement: Wave Detail Header Title Sync
The system SHALL update the header title immediately after a successful wave rename, without requiring navigation.

#### Scenario: User renames wave from WaveDetail
- **WHEN** the user renames a wave via the edit modal in WaveDetail and the `updateWave` mutation succeeds
- **THEN** `router.setParams({ waveName: editName })` SHALL be called
- **THEN** the header title displayed by `AppHeader` in `[waveUuid].tsx` SHALL update to the new name immediately

### Requirement: Wave edit modal keyboard avoidance
The wave edit modal in WaveDetail SHALL use `KeyboardAwareScrollView` from `react-native-keyboard-controller` so text inputs remain visible when the keyboard is open.

#### Scenario: Editing wave details with keyboard open
- **WHEN** a user taps the description field in the WaveDetail edit modal
- **THEN** the modal content SHALL scroll so the description input and Save button remain visible above the keyboard

## REMOVED Requirements

### Requirement: Set Upload Target from Wave Detail
The system SHALL **Reason**: The upload target concept is being removed entirely. Photos are now tagged to waves contextually via the footer camera when viewing a wave detail screen.
**Migration**: Users take photos directly from the wave detail screen's camera footer instead of pre-selecting an upload target.

#### Scenario: Requirement is exercised
- **WHEN** the relevant action occurs
- **THEN** the system SHALL satisfy this requirement
### Requirement: Remove Photo from Wave
The system SHALL **Reason**: Long-press on a photo in wave detail now opens the QuickActionsModal (matching main feed behavior) instead of showing a context menu with "Remove from Wave." Photo-to-wave management is handled through the Wave action button in the QuickActionsModal or full photo view.
**Migration**: Users use the Wave button in the expanded photo view or QuickActionsModal to manage wave assignment.

#### Scenario: Requirement is exercised
- **WHEN** the relevant action occurs
- **THEN** the system SHALL satisfy this requirement
### Requirement: WaveDetail reads global network atom
The WaveDetail screen SHALL read `STATE.netAvailable` via `useAtom` instead of creating its own `NetInfo.addEventListener` subscription. It SHALL remove the local `netAvailable` state and `NetInfo` listener effect.

#### Scenario: WaveDetail uses atom for network state
- **WHEN** the WaveDetail component renders
- **THEN** it SHALL read `STATE.netAvailable` via `useAtom`
- **THEN** it SHALL NOT import `NetInfo` or subscribe to `NetInfo.addEventListener`

### Requirement: WaveDetail offline card
The WaveDetail screen SHALL show an offline card when `netAvailable` is `false`.

#### Scenario: WaveDetail renders offline card
- **WHEN** `netAvailable` is `false`
- **THEN** the WaveDetail screen SHALL display an `EmptyStateCard` with `icon='wifi-off'`
- **THEN** it SHALL NOT fire API calls to load wave photos

### Requirement: Wave Detail Centered Loading Spinner
The system SHALL **Reason**: Replaced by the `LinearProgress` bar for consistency with PhotosList. The centered `ActivityIndicator` that showed when `loading && photos.length === 0` is no longer used.
**Migration**: The `LinearProgress` bar at the top provides loading feedback in all cases. The `EmptyStateCard` continues to render when photos array is empty after load completes.

#### Scenario: Requirement is exercised
- **WHEN** the relevant action occurs
- **THEN** the system SHALL satisfy this requirement
### Requirement: Wave GraphQL Field Names
The `listWaves` query, `createWave` mutation, and `updateWave` mutation SHALL request and send the following renamed fields in their GraphQL operations:
- `splashDate` (previously `startDate`): the date when the wave goes live
- `freezeDate` (previously `endDate`): the date when the wave auto-freezes
- `isFrozen` (retained): computed boolean indicating wave is currently frozen

The operations SHALL NOT request or send the removed fields: `frozen`, `startDate`, `endDate`, `isActive`.

#### Scenario: listWaves uses renamed fields
- **WHEN** the `listWaves` query is executed
- **THEN** the query SHALL request `splashDate`, `freezeDate`, and `isFrozen` on each wave
- **THEN** the query SHALL NOT request `frozen`, `startDate`, `endDate`, or `isActive`

#### Scenario: createWave response uses renamed fields
- **WHEN** the `createWave` mutation returns a wave
- **THEN** the response SHALL request `splashDate`, `freezeDate`, and `isFrozen`
- **THEN** the response SHALL NOT request `frozen`, `startDate`, `endDate`, or `isActive`

#### Scenario: updateWave sends renamed fields
- **WHEN** the `updateWave` function is called with scheduling parameters
- **THEN** it SHALL send `splashDate` (not `startDate`) and `freezeDate` (not `endDate`) as GraphQL variables
- **THEN** it SHALL NOT send a `frozen` variable
- **THEN** the mutation declaration SHALL use `$splashDate: AWSDateTime` and `$freezeDate: AWSDateTime` parameter types

### Requirement: WaveSettings Freeze Model
The WaveSettings screen SHALL NOT render an explicit freeze/unfreeze toggle switch. Wave freezing SHALL be controlled exclusively through the `freezeDate` date picker. When `isFrozen` is `true`, all settings except the `freezeDate` picker SHALL be disabled. The `freezeDate` picker SHALL remain active when frozen so the owner can set a future date to unfreeze the wave. The frozen banner SHALL display when `isFrozen` is `true`.

#### Scenario: No freeze toggle displayed
- **WHEN** the WaveSettings screen renders
- **THEN** there SHALL be no switch labeled "Freeze Wave"
- **THEN** the only freeze-related control SHALL be the freeze date picker

#### Scenario: Frozen wave disables all controls except freeze date
- **WHEN** `isFrozen` is `true`
- **THEN** the frozen banner SHALL display with a snowflake icon
- **THEN** the "Open Wave" toggle SHALL be disabled
- **THEN** the "Splash Date" picker SHALL be disabled
- **THEN** the "Freeze Date" picker SHALL remain enabled

#### Scenario: User unfreezes wave by setting future freeze date
- **WHEN** `isFrozen` is `true`
- **THEN** the user taps the freeze date picker and selects a future date
- **THEN** `updateWave` is called with `freezeDate` set to the selected future date
- **THEN** the wave becomes unfrozen and all controls re-enable

#### Scenario: User clears freeze date on unfrozen wave
- **WHEN** `isFrozen` is `false` and a `freezeDate` is set
- **THEN** the user taps the clear button on the freeze date
- **THEN** `updateWave` is called with `freezeDate: null`
- **THEN** the wave will not auto-freeze

### Requirement: WaveSettings Date Labels
The WaveSettings screen SHALL label the date pickers as "Splash Date" (with description "Wave goes live on this date") and "Freeze Date" (with description "Wave auto-freezes after this date"). State variables, handlers, and UI text SHALL use `splashDate`/`freezeDate` naming consistently.

#### Scenario: Date picker labels
- **WHEN** the WaveSettings screen renders
- **THEN** the first date section SHALL show title "Splash Date" with description "Wave goes live on this date"
- **THEN** the second date section SHALL show title "Freeze Date" with description "Wave auto-freezes after this date"

### Requirement: WaveSettings Load Settings
The WaveSettings screen SHALL derive its initial state from a wave object, reading `isFrozen` for the frozen banner and `splashDate`/`freezeDate` for date values. It SHALL NOT read `frozen`, `isActive`, `startDate`, or `endDate`.

#### Scenario: Settings loaded from wave response
- **WHEN** the WaveSettings screen loads
- **THEN** `isFrozen` SHALL be set from `wave.isFrozen`
- **THEN** the splash date SHALL be set from `wave.splashDate`
- **THEN** the freeze date SHALL be set from `wave.freezeDate`
- **THEN** the screen SHALL NOT reference `wave.frozen`, `wave.startDate`, `wave.endDate`, or `wave.isActive`
