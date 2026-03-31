## Requirements

### Requirement: Starred screen accessible from drawer
The Starred screen SHALL be accessible as a drawer menu item positioned between Identity and Friends. It SHALL use the `star` icon (AntDesign) and the label "Starred". The drawer item SHALL be disabled when the device is offline (`netAvailable === false`).

#### Scenario: Drawer shows Starred item
- **WHEN** the user opens the drawer
- **THEN** a "Starred" menu item SHALL appear between the Identity and Friends items
- **THEN** the item SHALL display an AntDesign `star` icon and the label "Starred"

#### Scenario: Starred drawer item disabled offline
- **WHEN** the device is offline (`netAvailable === false`)
- **THEN** the Starred drawer item SHALL be visually disabled (reduced opacity)
- **THEN** tapping the item SHALL have no effect

### Requirement: Starred screen displays watched photos feed
The Starred screen SHALL display the user's watched/starred photos using the `feedForWatcher` GraphQL query. It SHALL use `useFeedLoader` with `requestWatchedPhotos` as the fetch function. It SHALL NOT require GPS location. It SHALL use the starred-specific layout config (larger tiles, fewer columns, square aspect ratios).

#### Scenario: Starred screen loads watched photos
- **WHEN** the user navigates to the Starred screen
- **THEN** the screen SHALL call `requestWatchedPhotos` with the user's `uuid`, `pageNumber`, `batch`, and optional `searchTerm`
- **THEN** photos SHALL be displayed in a masonry grid with the starred layout config

#### Scenario: Starred screen works without location
- **WHEN** the user opens the Starred screen and location is pending or denied
- **THEN** the feed SHALL load normally using only `uuid`
- **THEN** no location-related empty states or banners SHALL be shown

### Requirement: Starred screen uses AppHeader
The Starred screen SHALL use the shared `AppHeader` component with the title "Starred". It SHALL NOT include segment controls. The header SHALL support the drawer back button for navigation.

#### Scenario: Starred screen header rendering
- **WHEN** the Starred screen is displayed
- **THEN** the header SHALL show "Starred" as the title
- **THEN** no segment control SHALL be present in the header

### Requirement: Starred screen empty state
When the Starred feed has no content, the screen SHALL display an empty state with the message "No Starred Content Yet" and a "Discover Content" action button that navigates to the home screen.

#### Scenario: Empty starred feed
- **WHEN** the Starred screen loads and `feedForWatcher` returns no photos
- **THEN** an empty state card SHALL be displayed with message "No Starred Content Yet"
- **THEN** a "Discover Content" button SHALL be shown
- **WHEN** the user taps "Discover Content"
- **THEN** the app SHALL navigate to `/(drawer)/(tabs)` (the home/Global feed)

### Requirement: Starred screen supports search
The Starred screen SHALL include `SearchFab` and use `useFeedSearch` for search state management. Search terms SHALL be passed to `feedForWatcher` as the `searchTerm` parameter.

#### Scenario: Search on starred screen
- **WHEN** the user opens the search FAB on the Starred screen and enters a search term
- **THEN** the Starred feed SHALL reload with the search term passed to `feedForWatcher`
- **WHEN** the user clears the search
- **THEN** the feed SHALL reload without a search term

### Requirement: Bookmarks screen footer with drawer menu and camera buttons
The Bookmarks screen SHALL render `PhotosListFooter` at the bottom of the screen with drawer menu and camera capture buttons. The footer SHALL behave identically to the home feed footer: menu button absolutely positioned left, video and camera buttons centered. The screen SHALL consume `UploadContext` for `enqueueCapture` and use the `useCameraCapture` hook for camera permission handling. The footer's `locationReady` prop SHALL reflect `locationAtom.status === 'ready'`.

#### Scenario: Footer renders on bookmarks screen
- **WHEN** the Bookmarks screen is displayed
- **THEN** a `PhotosListFooter` SHALL render at the bottom with drawer menu, video, and camera buttons
- **THEN** `FOOTER_HEIGHT` SHALL be 90 to accommodate the footer bar

#### Scenario: Drawer menu button opens drawer
- **WHEN** the user presses the menu button in the bookmarks footer
- **THEN** the drawer navigation SHALL open via `navigation.openDrawer()`

#### Scenario: Camera buttons capture photos from bookmarks
- **WHEN** the user presses the camera or video button in the bookmarks footer
- **THEN** the `useCameraCapture` hook SHALL handle permissions and enqueue the capture via `UploadContext`
- **THEN** captured photos SHALL enter the normal upload flow (appearing in the home feed, not automatically bookmarked)

#### Scenario: Camera buttons disabled when location unavailable
- **WHEN** `locationAtom.status` is not `ready`
- **THEN** the camera buttons in the footer SHALL appear visually disabled (opacity 0.4)

#### Scenario: Footer renders in all screen states
- **WHEN** the Bookmarks screen is in any state (offline, loading, empty, or has content)
- **THEN** the footer SHALL be rendered

### Requirement: Starred screen does not subscribe to upload events
The Starred screen SHALL NOT subscribe to the upload completion bus. Newly uploaded photos SHALL NOT be prepended to the Starred feed.

#### Scenario: Upload does not affect starred feed
- **WHEN** a photo upload completes while the Starred screen is active
- **THEN** the Starred photo list SHALL NOT be modified
- **THEN** the new photo SHALL only appear in Starred after the user interacts with it and the feed is reloaded
