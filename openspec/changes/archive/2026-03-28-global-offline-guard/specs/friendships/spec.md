## ADDED Requirements

### Requirement: FriendsList offline card
The FriendsList screen SHALL read `STATE.netAvailable` via `useAtom`. When `netAvailable` is `false`, it SHALL display an `EmptyStateCard` with `icon='wifi-off'` instead of attempting to load friends or fire friend-related API calls.

#### Scenario: FriendsList renders offline card
- **WHEN** `netAvailable` is `false`
- **THEN** the FriendsList screen SHALL display an offline `EmptyStateCard`
- **THEN** it SHALL NOT call `friends_helper` API functions

#### Scenario: FriendsList loads normally when online
- **WHEN** `netAvailable` is `true`
- **THEN** the FriendsList screen SHALL render its normal friends list
