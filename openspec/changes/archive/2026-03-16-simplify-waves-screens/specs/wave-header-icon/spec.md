## MODIFIED Requirements

### Requirement: Wave Icon in Feed Header
The system SHALL display a wave icon in the upper-right corner of the main photo feed header as a simple navigation button to the Waves Hub.

#### Scenario: User views photo feed
- **WHEN** the photo feed is displayed
- **THEN** a wave icon is visible in the upper-right corner of the header in the default/secondary text color

#### Scenario: User taps wave icon
- **WHEN** the user taps the wave icon
- **THEN** the Waves Hub screen is pushed onto the navigation stack

## REMOVED Requirements

### Requirement: Upload Target Badge on Wave Icon
**Reason**: The upload target concept is being removed entirely. The wave icon no longer needs to indicate upload target status.
**Migration**: No migration needed. The wave icon becomes a simple navigation button.

### Requirement: Upload Target Name on Long-Press
**Reason**: The upload target concept is being removed. There is no upload target name to display.
**Migration**: No migration needed.
