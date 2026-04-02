# Friends Explainer Specification

## Purpose
Displays an educational explainer view when the friends list is empty, guiding users to add their first friend.

## Requirements

### Requirement: FriendsExplainerView component
The system SHALL provide a `FriendsExplainerView` component at `src/components/FriendsExplainerView/index.js` that displays a rich educational view when the friends list is empty. The component SHALL follow the same visual pattern as `WavesExplainerView` — a ScrollView with icon circle, explanatory cards, and a CTA button. Explanatory text SHALL describe how to add friends and what friends enable (private photo sharing). References to chat SHALL be removed and replaced with photo sharing descriptions.

#### Scenario: No friends exist
- **WHEN** the user has no friends (pending or confirmed) and is online
- **THEN** the FriendsList SHALL display FriendsExplainerView as the ListEmptyComponent
- **THEN** FriendsExplainerView SHALL show a user-friends icon, a title "Connect with Friends", explanatory cards describing how to add friends and what friends enable (private photo sharing), and a CTA button "Add a Friend"

#### Scenario: User taps the CTA button
- **WHEN** the user taps the "Add a Friend" button on FriendsExplainerView
- **THEN** the system SHALL trigger the add-friend flow (emit addFriend event)

#### Scenario: Dark mode rendering
- **WHEN** the app is in dark mode
- **THEN** FriendsExplainerView SHALL render with dark theme colors using `getTheme(isDarkMode)`

### Requirement: Search-aware empty state
The FriendsList SHALL distinguish between an empty list due to no friends and an empty list due to search filtering returning no results.

#### Scenario: Empty due to search filtering
- **WHEN** friends exist but the active search term matches none
- **THEN** the system SHALL display an EmptyStateCard with search-specific messaging (not FriendsExplainerView)

### Requirement: Privacy explainer card in tutorial
The `FriendsExplainerView` SHALL include a "Private by Design" card (icon: `lock`) explaining that friend names are never stored on servers — they are only kept locally on the device to ensure privacy and security — and must be re-assigned when switching devices.

#### Scenario: Empty friends list shows privacy card
- **WHEN** the user has no friends and views the FriendsExplainerView
- **THEN** a card with a lock icon and title "Private by Design" SHALL be displayed
- **THEN** the card body SHALL explain that friend names are never stored on servers, only kept locally on the device, and must be re-assigned on a new device
