## MODIFIED Requirements

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

### Requirement: Quick Actions Modal — Ban/Report Action
The system SHALL keep the modal open and update the button state when the user reports a photo via the quick-actions modal.

#### Scenario: User reports a photo from the modal
- **WHEN** the user taps the Report icon in the quick-actions modal
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

## RENAMED Requirements

### Requirement: Quick Actions Modal — Star Action
**FROM:** Quick Actions Modal — Star Action
**TO:** Quick Actions Modal — Bookmark Action
