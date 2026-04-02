# Friend Card Specification

## Purpose
Visual card component for displaying confirmed friends with photo strip previews in the friends list.

## Requirements

**Requirement: FriendCard renders photo strip and friend info**
The `FriendCard` component SHALL accept `friend`, `onPress`, `onLongPress`, and `theme` props. It SHALL render a `WavePhotoStrip` showing the friend's photos with `initialPhotos` from `friend.photos` and a `fetchFn` that calls `fetchFriendPhotos`. Below the strip, it SHALL render an info row with the friend's display name and a vertical ellipsis menu button.

#### Scenario: Render confirmed friend with photos
- **WHEN** `FriendCard` renders with a friend who has photos
- **THEN** it SHALL display a horizontal photo strip with thumbnails
- **THEN** it SHALL display the friend's name below the strip

#### Scenario: Render confirmed friend without photos
- **WHEN** `FriendCard` renders with a friend who has no photos
- **THEN** it SHALL display a placeholder in the photo strip area
- **THEN** it SHALL display the friend's name below

#### Scenario: Tap navigates to friend photo feed
- **WHEN** the user taps the info row or a photo thumbnail
- **THEN** `onPress(friend)` SHALL be called

#### Scenario: Long press opens context menu
- **WHEN** the user long-presses the card or taps the menu button
- **THEN** `onLongPress(friend)` SHALL be called
