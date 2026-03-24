## MODIFIED Requirements

### Requirement: Wave create modal keyboard avoidance
The wave create modal SHALL use `KeyboardAwareScrollView` from `react-native-keyboard-controller` so text inputs remain visible when the keyboard is open.

#### Scenario: Creating a wave with keyboard open
- **WHEN** a user taps the description field in the create wave modal
- **THEN** the modal content SHALL scroll so the description input and Save button remain visible above the keyboard

### Requirement: Wave edit modal keyboard avoidance
The wave edit modal SHALL use `KeyboardAwareScrollView` from `react-native-keyboard-controller` so text inputs remain visible when the keyboard is open.

#### Scenario: Editing a wave with keyboard open
- **WHEN** a user taps the description field in the edit wave modal
- **THEN** the modal content SHALL scroll so the description input and Save button remain visible above the keyboard
