## MODIFIED Requirements

### Requirement: Secret screen keyboard avoidance library
The Secret screen form SHALL use `KeyboardAwareScrollView` from `react-native-keyboard-controller` instead of `react-native-keyboard-aware-scroll-view`.

#### Scenario: Secret input fields remain visible when keyboard opens
- **WHEN** a user taps any input field on the Secret screen
- **THEN** the screen content SHALL scroll so the focused input remains visible above the keyboard
