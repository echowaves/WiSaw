# Quick Actions Modal Specification

## Purpose
The quick-actions modal provides instant access to all 5 photo actions (Report, Delete, Bookmark, Wave, Share) from the feed via long-press, without needing to expand the photo. It shows a progressively-loaded photo preview and a loading state while fetching photo details.

## Requirements

### Requirement: Quick Actions Modal Display
The system SHALL display a modal overlay when the user long-presses a photo thumbnail OR taps the ⋮ pill on a photo thumbnail in the feed, showing a progressively-loaded photo preview and all 5 action buttons. The modal SHALL appear within a single animation frame of the long-press event, without waiting for photo details to load. The photo preview SHALL load progressively — thumbnail first, then full-resolution image on top.

#### Scenario: Modal opens on long-press
- **WHEN** the user long-presses a photo thumbnail in the feed
- **THEN** haptic feedback is triggered
- **THEN** a modal overlay appears within a single animation frame with a loading spinner in the preview area
- **THEN** the photo's thumbnail loads and replaces the spinner
- **THEN** the full-resolution image loads on top of the thumbnail when ready
- **THEN** a loading spinner is displayed below the preview while photo details are being fetched
- **THEN** action buttons are NOT shown until photo details have loaded
- **THEN** the long-press state update SHALL NOT trigger a re-render of the photo feed list

#### Scenario: Modal opens on ⋮ pill tap
- **WHEN** the user taps the ⋮ pill overlay on a photo thumbnail
- **THEN** haptic feedback is triggered
- **THEN** a modal overlay appears with the same behavior as long-press (progressive image loading, action buttons after detail fetch)

#### Scenario: Progressive image loading layers
- **WHEN** the modal is visible and the photo has both a valid thumbUrl and imgUrl
- **THEN** the system SHALL render a thumbnail CachedImage layer (zIndex: 1) with an ActivityIndicator placeholder
- **THEN** the system SHALL render a full-resolution CachedImage layer (zIndex: 2) on top
- **THEN** both layers SHALL use consistent cache keys: `${photo.id}-thumb` for thumbnail and `${photo.id}` for full image
- **THEN** both layers SHALL use `resizeMode: 'cover'` within the square preview container

#### Scenario: Only thumbnail URL is valid
- **WHEN** the modal is visible and the photo has a valid thumbUrl but invalid imgUrl
- **THEN** the system SHALL render only the thumbnail layer with an ActivityIndicator placeholder
- **THEN** the full-resolution layer SHALL NOT be rendered

#### Scenario: Neither URL is valid
- **WHEN** the modal is visible and the photo has neither a valid thumbUrl nor a valid imgUrl
- **THEN** the system SHALL render an ActivityIndicator spinner in the preview area

#### Scenario: Photo details load successfully
- **WHEN** the `getPhotoDetails` query completes while the modal is open
- **THEN** the loading spinner is hidden
- **THEN** all 5 action buttons (Report, Delete, Bookmark, Wave, Share) appear as icon-only buttons (no text labels) in their enabled state based on the photo's data

#### Scenario: User dismisses the modal
- **WHEN** the user taps outside the modal content area
- **THEN** the modal closes without any changes

#### Scenario: Modal is hidden
- **WHEN** the modal is not visible
- **THEN** the modal component SHALL remain mounted in the component tree
- **THEN** the modal SHALL NOT fetch photo details or perform side effects

### Requirement: Quick Actions Modal — Delete Action
The system SHALL close the modal and remove the photo from the feed when the user deletes a photo via the quick-actions modal.

#### Scenario: User deletes a photo from the modal
- **WHEN** the user taps Delete in the quick-actions modal
- **THEN** a confirmation Alert is shown ("Will delete photo for everyone!")
- **WHEN** the user confirms deletion
- **THEN** the `deletePhoto` mutation is called
- **THEN** the modal closes
- **THEN** the photo is removed from the feed list

#### Scenario: User cancels deletion
- **WHEN** the user taps Delete and then taps "No" on the confirmation Alert
- **THEN** the modal remains open with no changes

### Requirement: Quick Actions Modal — Ban/Report Action
The system SHALL keep the modal open and update the button state when the user reports a photo via the quick-actions modal.

#### Scenario: User reports a photo from the modal
- **WHEN** the user taps Report in the quick-actions modal
- **THEN** a confirmation Alert is shown ("Report abusive Photo?")
- **WHEN** the user confirms
- **THEN** the `banPhoto` mutation is called
- **THEN** the modal stays open
- **THEN** the Report button updates to disabled/banned state

#### Scenario: User tries to report a bookmarked photo
- **WHEN** the user taps Report on a photo that is bookmarked
- **THEN** a toast shows "Can't report bookmarked photo"
- **THEN** a toast shows "Remove bookmark first"
- **THEN** the modal stays open

#### Scenario: User tries to report an already-reported photo
- **WHEN** the user taps Report on a photo they have already reported
- **THEN** a toast shows "Looks like you already Reported this Photo"
- **THEN** the modal stays open

### Requirement: Quick Actions Modal — Bookmark Action
The system SHALL keep the modal open and toggle the bookmark state when the user bookmarks or removes a bookmark from a photo via the quick-actions modal. The Bookmark button SHALL display as icon-only (`Ionicons bookmark`/`bookmark-outline`) with no text label, using `#FFD700` gold color when bookmarked.

#### Scenario: User bookmarks a photo from the modal
- **WHEN** the user taps the Bookmark icon (outline) in the quick-actions modal
- **THEN** the `watchPhoto` mutation is called
- **THEN** the modal stays open
- **THEN** the Bookmark icon updates to filled bookmark with gold color

#### Scenario: User removes bookmark from a photo in the modal
- **WHEN** the user taps the filled Bookmark icon in the quick-actions modal
- **THEN** the `unwatchPhoto` mutation is called
- **THEN** the modal stays open
- **THEN** the Bookmark icon updates to outline bookmark with default color

### Requirement: Quick Actions Modal — Action Button Labels
All action buttons (Report, Delete, Bookmark, Share) SHALL display as icon-only with no text labels. The Wave button SHALL retain its text label showing the wave name or "Add to Wave".

#### Scenario: Action buttons are icon-only
- **WHEN** the quick-actions modal displays action buttons after photo details load
- **THEN** Report SHALL show only the ban icon with no "Report" text
- **THEN** Delete SHALL show only the trash icon with no "Delete" text
- **THEN** Bookmark SHALL show only the bookmark icon with no "Bookmark" text
- **THEN** Share SHALL show only the share icon with no "Share" text
- **THEN** Wave SHALL show the water icon WITH its text label (wave name or "Add to Wave")

### Requirement: Quick Actions Modal — Wave Action
The system SHALL open the WaveSelectorModal on top of the quick-actions modal when the user taps the Wave button. When the user removes a photo from its wave or moves a photo to a different wave, the system SHALL close the QuickActionsModal immediately and notify the parent via callback.

#### Scenario: User taps Wave on own photo
- **WHEN** the user taps the Wave button on their own photo in the quick-actions modal
- **THEN** the WaveSelectorModal opens on top of the quick-actions modal
- **THEN** the quick-actions modal stays visible behind the wave selector

#### Scenario: User taps Wave on another user's photo
- **WHEN** the user taps the Wave button on a photo not owned by them
- **THEN** a toast shows "Only your own photos can be added to waves"
- **THEN** the modal stays open

#### Scenario: User removes photo from wave via quick-actions modal
- **WHEN** the user selects "None (remove from wave)" in the WaveSelectorModal
- **THEN** the WaveSelectorModal closes
- **THEN** the QuickActionsModal closes immediately (optimistic)
- **THEN** `onPhotoRemovedFromWave` callback is called with the photo ID
- **THEN** `removePhotoFromWave` mutation is called
- **THEN** a success toast confirms removal

#### Scenario: User moves photo to different wave via quick-actions modal
- **WHEN** the user selects a different wave in the WaveSelectorModal
- **THEN** the WaveSelectorModal closes
- **THEN** the QuickActionsModal closes immediately (optimistic)
- **THEN** `onPhotoRemovedFromWave` callback is called with the photo ID
- **THEN** `addPhotoToWave` mutation is called for the new wave
- **THEN** a success toast confirms the move

#### Scenario: Remove from wave mutation fails
- **WHEN** the `removePhotoFromWave` mutation fails after the modal has closed
- **THEN** an error toast is shown
- **THEN** the photo remains removed from the local list (corrected on next focus refresh)

#### Scenario: Move to wave mutation fails
- **WHEN** the `addPhotoToWave` mutation fails after the modal has closed
- **THEN** an error toast is shown
- **THEN** the photo remains removed from the local list (corrected on next focus refresh)

#### Scenario: onPhotoRemovedFromWave not provided
- **WHEN** the QuickActionsModal is rendered without the `onPhotoRemovedFromWave` prop (e.g. in PhotosList)
- **THEN** wave remove and move actions SHALL still close the WaveSelectorModal and QuickActionsModal
- **THEN** mutations and toasts SHALL still fire normally
- **THEN** no parent list filtering occurs

### Requirement: Quick Actions Modal — Share Action
The system SHALL open the system share sheet over the modal when the user taps Share.

#### Scenario: User shares a photo from the modal
- **WHEN** the user taps Share in the quick-actions modal
- **THEN** the system share sheet opens over the modal
- **THEN** the quick-actions modal stays open behind the share sheet

### Requirement: Preview image tap closes overlay and expands photo in feed
The quick-actions modal SHALL treat a tap on the photo preview image area as a "select this photo" gesture: it closes the overlay and expands the tapped photo inline in the host feed via the screen's existing `toggleExpand` expansion mechanism, with the masonry's existing auto-scroll behavior bringing the expanded item into view. The tap target SHALL be limited to the photo preview image container (the progressive two-layer `CachedImage` area). The dimmed backdrop and the action buttons SHALL retain their existing behavior — a backdrop tap closes the overlay WITHOUT expanding, and action buttons perform their existing actions.

#### Scenario: Tap preview image to expand in main feed
- **WHEN** the user long-presses a photo thumbnail in the main feed and the quick-actions modal opens
- **THEN** the user taps the photo preview image inside the modal
- **THEN** haptic feedback is triggered
- **THEN** the modal closes
- **THEN** the tapped photo expands inline in the masonry feed (full-width `<Photo embedded>` card) at the current waterline position
- **THEN** the masonry auto-scrolls so the expanded item is near the top of the viewport with the existing 8px offset

#### Scenario: Tap preview image in wave detail feed
- **WHEN** the quick-actions modal is opened from a photo thumbnail in a wave detail screen and the user taps the preview image
- **THEN** the modal closes and the tapped photo expands inline in the wave detail masonry feed

#### Scenario: Tap preview image in friend feed
- **WHEN** the quick-actions modal is opened from a photo thumbnail in a friend detail screen and the user taps the preview image
- **THEN** the modal closes and the tapped photo expands inline in the friend detail masonry feed

#### Scenario: Tap target is limited to the preview image
- **WHEN** the user taps the dimmed backdrop outside the modal content
- **THEN** the modal closes WITHOUT expanding any photo
- **WHEN** the user taps an action button (Report, Delete, Bookmark, Wave, Share)
- **THEN** the button's existing action is performed and the preview image tap behavior does NOT fire

#### Scenario: Expand replaces a different expanded photo
- **WHEN** a different photo is already expanded in the host feed when the user taps the preview image
- **THEN** the previously expanded photo collapses and the tapped photo expands, consistent with the existing single-expansion invariant

#### Scenario: Stale photo id does not expand
- **WHEN** the tapped photo is no longer present in the host feed's photo list (e.g., the feed reloaded or the photo was deleted elsewhere before the tap)
- **THEN** the modal still closes
- **THEN** no expansion is attempted (the feed is left unchanged)

#### Scenario: Expansion timing is immediate
- **WHEN** the user taps the preview image
- **THEN** the close and the expand are triggered in the same event handler (the masonry expansion animates while the modal fade-out completes)
- **THEN** no deferred/pending-expansion state keyed to modal `onDismiss` is used

#### Scenario: Video post preview behaves identically
- **WHEN** the quick-actions modal is showing a video post's preview (poster frame) and the user taps the preview image
- **THEN** the modal closes and the video post expands inline in the feed like any photo

### Requirement: Quick Actions Modal — Stable Action Button Geometry
The quick-actions modal's action buttons (Report, Delete, Bookmark, Wave, Share) SHALL keep identical geometry (width, height, padding, margin, border radius) regardless of their enabled or disabled state. A change in button state (e.g., toggling the bookmark, which disables Report and Delete) SHALL change only the buttons' visual appearance (background, border, opacity, icon color) and interactivity — never their size or position within the row.

#### Scenario: Bookmarking does not shift other buttons
- **WHEN** the user bookmarks a photo in the quick-actions modal
- **AND** the Report and Delete buttons become disabled as a result
- **THEN** the Report and Delete buttons SHALL retain the same width, height, and position they had while enabled
- **THEN** no visible reflow or shift of any action button SHALL occur

#### Scenario: Unbookmarking does not shift other buttons
- **WHEN** the user removes a bookmark from a photo in the quick-actions modal
- **AND** the Report and Delete buttons become enabled as a result
- **THEN** the Report and Delete buttons SHALL retain the same width, height, and position they had while disabled
- **THEN** no visible reflow or shift of any action button SHALL occur

#### Scenario: Disabled button appearance
- **WHEN** an action button is in its disabled state
- **THEN** the button SHALL be rendered de-emphasized (muted background, border, icon color, reduced opacity)
- **THEN** the button SHALL NOT be shrinkable below the same geometry as its enabled state

### Requirement: Quick Actions Modal — Wave Button Layout
The Wave button in the quick-actions modal SHALL be the last element of the action button list and SHALL always render on its own line, below the row of icon-only buttons (Report, Delete, Bookmark, Share). The Wave button SHALL have a fixed width regardless of the wave name; a wave label that does not fit SHALL be truncated with an ellipsis. The button's width SHALL NOT change when photo details load and the label switches from "Add to Wave" to the actual wave name.

#### Scenario: Wave button on separate line
- **WHEN** the quick-actions modal displays action buttons after photo details load
- **THEN** Report, Delete, Bookmark, and Share SHALL appear on one line
- **THEN** the Wave button SHALL appear on the line below, as the last element

#### Scenario: Wave label truncation
- **WHEN** the wave name is longer than the fixed Wave button width allows
- **THEN** the label SHALL be truncated with an ellipsis
- **THEN** the Wave button SHALL keep its fixed width

#### Scenario: Label swap on details load
- **WHEN** the Wave button label changes from "Add to Wave" to the wave name as photo details load
- **THEN** the Wave button SHALL keep its fixed width and position
- **THEN** no reflow or shift of any action button SHALL occur
