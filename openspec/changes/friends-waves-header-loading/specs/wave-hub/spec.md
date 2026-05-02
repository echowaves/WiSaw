## ADDED Requirements

### Requirement: WavesHub renders AppHeader with loading
The WavesHub screen SHALL render AppHeader directly in its component tree (not via route-level `Stack.Screen` header) and SHALL pass its `loading` state to AppHeader.

#### Scenario: Wave list loading
- **WHEN** WavesHub is loading wave data
- **THEN** a LinearProgress bar SHALL appear in the AppHeader via the `loading` prop
- **THEN** the standalone LinearProgress bar previously rendered in the screen body SHALL NOT be present

#### Scenario: Header content preserved
- **WHEN** WavesHub renders AppHeader
- **THEN** the header SHALL display the waves screen icon title, a back button, and the dots-vertical menu button with ungrouped badge in the right slot — identical to current behavior
