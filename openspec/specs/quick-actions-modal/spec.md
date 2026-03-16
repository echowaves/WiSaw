# Quick Actions Modal Specification

## Purpose
The quick-actions modal provides instant access to all 5 photo actions (Report, Delete, Star, Wave, Share) from the feed via long-press, without needing to expand the photo. It shows a thumbnail preview and a loading state while fetching photo details.

## Requirements

### Requirement: Quick Actions Modal Display
The system SHALL display a modal overlay when the user long-presses a photo thumbnail in the feed, showing a photo preview and all 5 action buttons.

#### Scenario: Modal opens on long-press
- **WHEN** the user long-presses a photo thumbnail in the feed
- **THEN** haptic feedback is triggered
- **THEN** a modal overlay appears immediately with the photo's thumbnail preview
- **THEN** a loading spinner is displayed below the preview while photo details are being fetched
- **THEN** action buttons are NOT shown until photo details have loaded

#### Scenario: Photo details load successfully
- **WHEN** the `getPhotoDetails` query completes while the modal is open
- **THEN** the loading spinner is hidden
- **THEN** all 5 action buttons (Report, Delete, Star, Wave, Share) appear in their enabled state based on the photo's data

#### Scenario: User dismisses the modal
- **WHEN** the user taps outside the modal content area
- **THEN** the modal closes without any changes

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

#### Scenario: User tries to report a starred photo
- **WHEN** the user taps Report on a photo that is starred
- **THEN** a toast shows "Unable to Report Starred photo"
- **THEN** the modal stays open

#### Scenario: User tries to report an already-reported photo
- **WHEN** the user taps Report on a photo they have already reported
- **THEN** a toast shows "Looks like you already Reported this Photo"
- **THEN** the modal stays open

### Requirement: Quick Actions Modal — Star Action
The system SHALL keep the modal open and toggle the star state when the user stars or un-stars a photo via the quick-actions modal.

#### Scenario: User stars a photo from the modal
- **WHEN** the user taps Star in the quick-actions modal
- **THEN** the `watchPhoto` mutation is called
- **THEN** the modal stays open
- **THEN** the Star button updates to show "Starred" with gold color

#### Scenario: User un-stars a photo from the modal
- **WHEN** the user taps Starred in the quick-actions modal
- **THEN** the `unwatchPhoto` mutation is called
- **THEN** the modal stays open
- **THEN** the Star button updates to show "Star" with default color

### Requirement: Quick Actions Modal — Wave Action
The system SHALL open the WaveSelectorModal on top of the quick-actions modal when the user taps the Wave button.

#### Scenario: User taps Wave on own photo
- **WHEN** the user taps the Wave button on their own photo in the quick-actions modal
- **THEN** the WaveSelectorModal opens on top of the quick-actions modal
- **THEN** the quick-actions modal stays visible behind the wave selector

#### Scenario: User taps Wave on another user's photo
- **WHEN** the user taps the Wave button on a photo not owned by them
- **THEN** a toast shows "Only your own photos can be added to waves"
- **THEN** the modal stays open

### Requirement: Quick Actions Modal — Share Action
The system SHALL open the system share sheet over the modal when the user taps Share.

#### Scenario: User shares a photo from the modal
- **WHEN** the user taps Share in the quick-actions modal
- **THEN** the system share sheet opens over the modal
- **THEN** the quick-actions modal stays open behind the share sheet
