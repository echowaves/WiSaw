## ADDED Requirements

### Requirement: useKeyboardTracking hook encapsulates keyboard state
The `useKeyboardTracking` hook SHALL combine the existing `useKeyboard` hook with platform-specific keyboard height listeners to expose keyboard visibility and offset.

#### Scenario: Hook returns keyboard state
- **WHEN** `useKeyboardTracking` is called with no arguments
- **THEN** it SHALL return `{ keyboardVisible, dismissKeyboard, keyboardOffset }`

### Requirement: Platform-specific keyboard events
The hook SHALL listen to `keyboardWillShow`/`keyboardWillHide` on iOS and `keyboardDidShow`/`keyboardDidHide` on Android.

#### Scenario: Keyboard shows on iOS
- **WHEN** the keyboard appears on iOS
- **THEN** `keyboardOffset` SHALL be set to the keyboard height from the `keyboardWillShow` event

#### Scenario: Keyboard hides
- **WHEN** the keyboard is dismissed
- **THEN** `keyboardOffset` SHALL be set to 0

### Requirement: Cleanup on unmount
The hook SHALL remove all keyboard event listeners when the component unmounts.

#### Scenario: Component unmounts
- **WHEN** the component using the hook unmounts
- **THEN** all keyboard listeners SHALL be removed
