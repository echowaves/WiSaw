## ADDED Requirements

### Requirement: FriendsList renders AppHeader with loading
The FriendsList screen SHALL render AppHeader directly in its component tree (not via route-level `Stack.Screen` header) and SHALL pass its `loading` state to AppHeader so that loading progress appears integrated in the header.

#### Scenario: Friends loading active
- **WHEN** FriendsList is loading friends data
- **THEN** a LinearProgress bar SHALL appear in the AppHeader

#### Scenario: Friends loading complete
- **WHEN** the friends data fetch completes
- **THEN** the LinearProgress bar SHALL disappear from the AppHeader

### Requirement: WavesHub renders AppHeader with loading
The WavesHub screen SHALL render AppHeader directly in its component tree (not via route-level `Stack.Screen` header) and SHALL pass its `loading` state to AppHeader so that loading progress appears integrated in the header.

#### Scenario: Waves loading active
- **WHEN** WavesHub is loading wave data
- **THEN** a LinearProgress bar SHALL appear in the AppHeader

#### Scenario: Waves loading complete
- **WHEN** the wave data fetch completes
- **THEN** the LinearProgress bar SHALL disappear from the AppHeader
