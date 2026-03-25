## ADDED Requirements

### Requirement: Global keyboard provider
The app SHALL wrap all screens in a `KeyboardProvider` from `react-native-keyboard-controller` at the root layout level.

#### Scenario: App root includes KeyboardProvider
- **WHEN** the app launches
- **THEN** the root layout SHALL include a `KeyboardProvider` wrapping the navigation stack

### Requirement: Keyboard avoidance for all text inputs
Every screen and modal containing a `TextInput` SHALL use keyboard avoidance from `react-native-keyboard-controller` to prevent the keyboard from overlapping input fields.

#### Scenario: Text input in a modal is visible when keyboard opens
- **WHEN** a user taps on a TextInput inside a modal
- **THEN** the modal content SHALL scroll or reposition so the focused input remains visible above the keyboard

#### Scenario: Text input on a screen is visible when keyboard opens
- **WHEN** a user taps on a TextInput on any screen
- **THEN** the screen content SHALL scroll or reposition so the focused input remains visible above the keyboard

### Requirement: No unmaintained keyboard libraries
The app SHALL NOT depend on `react-native-keyboard-aware-scroll-view` or `@rnhooks/keyboard`. All keyboard handling SHALL use `react-native-keyboard-controller`.

#### Scenario: Dependency check
- **WHEN** reviewing package.json
- **THEN** `react-native-keyboard-aware-scroll-view` SHALL NOT be listed as a dependency
- **THEN** `@rnhooks/keyboard` SHALL NOT be listed as a dependency
- **THEN** `react-native-keyboard-controller` SHALL be listed as a dependency
