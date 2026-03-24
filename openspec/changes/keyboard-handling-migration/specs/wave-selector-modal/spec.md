## MODIFIED Requirements

### Requirement: Wave selector modal keyboard avoidance
The WaveSelectorModal SHALL use keyboard avoidance from `react-native-keyboard-controller` so search and create inputs remain visible when the keyboard is open.

#### Scenario: Searching waves with keyboard open
- **WHEN** a user taps the search input in the wave selector modal
- **THEN** the modal content SHALL reposition so the search input and wave list remain usable above the keyboard

#### Scenario: Creating a wave inline with keyboard open
- **WHEN** a user taps the create wave input in the wave selector modal
- **THEN** the modal content SHALL reposition so the create input and confirm button remain visible above the keyboard
