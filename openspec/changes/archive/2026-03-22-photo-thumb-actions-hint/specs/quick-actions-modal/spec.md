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
- **THEN** all 5 action buttons (Report, Delete, Star, Wave, Share) appear in their enabled state based on the photo's data

#### Scenario: User dismisses the modal
- **WHEN** the user taps outside the modal content area
- **THEN** the modal closes without any changes

#### Scenario: Modal is hidden
- **WHEN** the modal is not visible
- **THEN** the modal component SHALL remain mounted in the component tree
- **THEN** the modal SHALL NOT fetch photo details or perform side effects
