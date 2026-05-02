## MODIFIED Requirements

### Requirement: Friends list loading progress bar
The FriendsList screen SHALL display loading progress via the AppHeader `loading` prop during the initial data fetch and during pull-to-refresh operations. The FriendsList screen SHALL render AppHeader directly in its component tree (not via route-level `Stack.Screen` header).

#### Scenario: Initial friends load
- **WHEN** the FriendsList screen mounts and begins fetching friends data
- **THEN** a LinearProgress bar SHALL appear in the AppHeader via the `loading` prop
- **THEN** the progress bar SHALL disappear when loading completes

#### Scenario: Pull-to-refresh loading
- **WHEN** the user triggers a pull-to-refresh on the friends list
- **THEN** a LinearProgress bar SHALL appear in the AppHeader via the `loading` prop
- **THEN** the progress bar SHALL disappear when the refresh completes

#### Scenario: Subsequent visits
- **WHEN** the user navigates away from and back to the friends screen while friends are cached
- **THEN** the LinearProgress bar SHALL appear briefly in the AppHeader during the refresh and disappear when complete

#### Scenario: Header content preserved
- **WHEN** FriendsList renders AppHeader
- **THEN** the header SHALL display the friends screen icon title, a back button, add-friend button, and sort menu button in the right slot — identical to current behavior

#### Scenario: No standalone progress bar in body
- **WHEN** FriendsList is loading
- **THEN** the standalone LinearProgress bar previously rendered in the screen body SHALL NOT be present
