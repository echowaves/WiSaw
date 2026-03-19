## MODIFIED Requirements

### Requirement: Quick Actions Modal Display
The system SHALL display a modal overlay when the user long-presses a photo thumbnail in the feed, showing a photo preview and all 5 action buttons. The modal SHALL appear within a single animation frame of the long-press event, without waiting for photo details to load.

#### Scenario: Modal opens on long-press
- **WHEN** the user long-presses a photo thumbnail in the feed
- **THEN** haptic feedback is triggered
- **THEN** a modal overlay appears within a single animation frame with the photo's thumbnail preview
- **THEN** a loading spinner is displayed below the preview while photo details are being fetched
- **THEN** action buttons are NOT shown until photo details have loaded
- **THEN** the long-press state update SHALL NOT trigger a re-render of the photo feed list

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
