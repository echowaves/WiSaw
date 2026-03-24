## MODIFIED Requirements

### Requirement: Feedback form keyboard avoidance library
The feedback form SHALL use `KeyboardAwareScrollView` from `react-native-keyboard-controller` instead of `react-native-keyboard-aware-scroll-view`.

#### Scenario: Feedback textarea remains visible when keyboard opens
- **WHEN** a user taps the feedback text area
- **THEN** the screen content SHALL scroll so the input remains visible above the keyboard
