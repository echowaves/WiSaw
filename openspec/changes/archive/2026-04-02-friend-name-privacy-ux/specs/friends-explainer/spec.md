## ADDED Requirements

### Requirement: Privacy explainer card in tutorial
The `FriendsExplainerView` SHALL include a "Private by Design" card (icon: `lock`) explaining that friend names are stored only on this device for privacy, are never sent to servers, and must be re-assigned when switching devices.

#### Scenario: Empty friends list shows privacy card
- **WHEN** the user has no friends and views the FriendsExplainerView
- **THEN** a card with a lock icon and title "Private by Design" SHALL be displayed
- **THEN** the card body SHALL state: "Friend names are stored only on this device for your privacy — they are never sent to our servers. If you switch devices, you'll need to assign the friend name to your connection on the new device, because this information is not stored on the server."
