# Friends Explainer Specification

## Purpose
Displays an educational explainer view when the friends list is empty, guiding users to add their first friend.

## Requirements

### Requirement: FriendsExplainerView component
The system SHALL provide a `FriendsExplainerView` component at `src/components/FriendsExplainerView/index.js` that displays a rich educational view when the friends list is empty. The component SHALL follow the same visual pattern as `WavesExplainerView` — a ScrollView with icon circle, explanatory cards, and a CTA button.

#### Scenario: No friends exist
- **WHEN** the user has no friends (pending or confirmed) and is online
- **THEN** the FriendsList SHALL display FriendsExplainerView as the ListEmptyComponent
- **THEN** FriendsExplainerView SHALL show a user-friends icon, a title "Connect with Friends", explanatory cards describing how to add friends and what friends enable (private photo sharing, chat), and a CTA button "Add a Friend"

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
