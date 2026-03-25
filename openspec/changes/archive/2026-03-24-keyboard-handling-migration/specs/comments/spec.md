## MODIFIED Requirements

### Requirement: Comment input keyboard avoidance library
The comment input modal SHALL use `KeyboardAwareScrollView` from `react-native-keyboard-controller` instead of `react-native-keyboard-aware-scroll-view`.

#### Scenario: Comment input remains visible when keyboard opens
- **WHEN** a user taps the comment input field
- **THEN** the modal content SHALL scroll so the input and send button remain visible above the keyboard
