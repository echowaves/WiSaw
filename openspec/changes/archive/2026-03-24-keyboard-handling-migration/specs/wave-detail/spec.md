## MODIFIED Requirements

### Requirement: Wave edit modal keyboard avoidance
The wave edit modal in WaveDetail SHALL use `KeyboardAwareScrollView` from `react-native-keyboard-controller` so text inputs remain visible when the keyboard is open.

#### Scenario: Editing wave details with keyboard open
- **WHEN** a user taps the description field in the WaveDetail edit modal
- **THEN** the modal content SHALL scroll so the description input and Save button remain visible above the keyboard
