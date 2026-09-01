## ADDED Requirements

### Requirement: Expanded Photo Card — Wave Guard Toast
Pressing the Wave button on a photo that does not belong to the current user SHALL display an info toast "Only your own photos can be added to waves" and SHALL NOT open the wave selector or crash the app. All toast feedback in the shared photo actions hook (wave guard, frozen-wave guards, wave report success, add/remove-from-wave success) SHALL render without runtime errors.

#### Scenario: Wave pressed on non-own photo
- **WHEN** the user taps the Wave button on a photo not owned by them in the expanded photo view
- **THEN** an info toast "Only your own photos can be added to waves" is displayed
- **THEN** the wave selector does NOT open
- **THEN** the app does NOT crash

#### Scenario: Wave pressed on own photo
- **WHEN** the user taps the Wave button on their own photo in the expanded photo view
- **THEN** the wave selector opens

#### Scenario: Wave success toasts render
- **WHEN** a photo is successfully added to or removed from a wave
- **THEN** the corresponding success toast ("Added to: {wave name}" / "Removed from wave") is displayed without runtime errors
