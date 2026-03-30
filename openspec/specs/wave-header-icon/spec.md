## MODIFIED Requirements

### Requirement: Wave Icon in Feed Header
The system SHALL display a wave icon in the upper-right corner of the main photo feed header as a simple navigation button to the Waves Hub. Navigation SHALL use `router.navigate()` (idempotent) instead of `router.push()` to prevent duplicate screen instances on rapid taps.

#### Scenario: User views photo feed
- **WHEN** the photo feed is displayed
- **THEN** a wave icon is visible in the upper-right corner of the header in the default/secondary text color

#### Scenario: User taps wave icon
- **WHEN** the user taps the wave icon
- **THEN** the Waves Hub screen SHALL be navigated to via `router.navigate('/waves')`
- **THEN** the navigation SHALL be idempotent — tapping again while already on Waves SHALL NOT push a duplicate

#### Scenario: User double-taps wave icon rapidly
- **WHEN** the user taps the wave icon twice in quick succession
- **THEN** only one Waves Hub instance SHALL exist in the navigation state
- **THEN** the back button SHALL return to the previous screen in one press

## REMOVED Requirements

### Requirement: Upload Target Badge on Wave Icon
**Reason**: The upload target concept is being removed entirely. The wave icon no longer needs to indicate upload target status.
**Migration**: No migration needed. The wave icon becomes a simple navigation button.

### Requirement: Upload Target Name on Long-Press
**Reason**: The upload target concept is being removed. There is no upload target name to display.
**Migration**: No migration needed.
