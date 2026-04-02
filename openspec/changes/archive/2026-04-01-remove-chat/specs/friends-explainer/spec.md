## MODIFIED Requirements

### Requirement: FriendsExplainerView component
The system SHALL provide a `FriendsExplainerView` component at `src/components/FriendsExplainerView/index.js` that displays a rich educational view when the friends list is empty. The component SHALL follow the same visual pattern as `WavesExplainerView` — a ScrollView with icon circle, explanatory cards, and a CTA button. Explanatory text SHALL describe how to add friends and what friends enable (private photo sharing). References to chat SHALL be removed and replaced with photo sharing descriptions.

#### Scenario: No friends exist
- **WHEN** the user has no friends (pending or confirmed) and is online
- **THEN** the FriendsList SHALL display FriendsExplainerView as the ListEmptyComponent
- **THEN** FriendsExplainerView SHALL show a user-friends icon, a title "Connect with Friends", explanatory cards describing how to add friends and what friends enable (private photo sharing), and a CTA button "Add a Friend"
