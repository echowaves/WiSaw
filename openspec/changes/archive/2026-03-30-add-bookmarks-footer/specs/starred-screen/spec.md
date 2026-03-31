## ADDED Requirements

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

## REMOVED Requirements

### Requirement: No camera capture on Starred screen
**Reason**: Camera capture is now available via the footer bar on the Bookmarks screen as a convenience shortcut.
**Migration**: The `useCameraCapture` hook and `UploadContext` are wired into BookmarksList. Photos captured here go through the standard upload flow.
