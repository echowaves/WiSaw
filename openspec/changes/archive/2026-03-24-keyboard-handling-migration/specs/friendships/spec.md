## MODIFIED Requirements

### Requirement: NamePicker keyboard avoidance library
The NamePicker modal SHALL use `KeyboardAwareScrollView` from `react-native-keyboard-controller` instead of `react-native-keyboard-aware-scroll-view`.

#### Scenario: Name input remains visible when keyboard opens
- **WHEN** a user taps the name input field in the NamePicker modal
- **THEN** the modal content SHALL scroll so the input remains visible above the keyboard
