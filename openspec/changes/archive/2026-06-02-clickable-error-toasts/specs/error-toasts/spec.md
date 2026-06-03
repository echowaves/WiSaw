# Error Toasts Specification

## Purpose
The error toast system provides users with full visibility into error details that would otherwise be truncated by the toast library's default one-line display. When errors occur (network failures, GraphQL mutations, etc.), users can tap the toast to see complete error information in a bottom-sheet modal.

## Requirements

### Requirement: Error Toast Display
When an error occurs, a toast SHALL be displayed with the error title and a truncated message (80 characters), visible for 8 seconds.

#### Scenario: Error toast shows truncated message
- **WHEN** an error occurs during a user action
- **THEN** a toast is displayed showing the error title and the first 80 characters of the message with an ellipsis

#### Scenario: Error toast shows full message when short
- **WHEN** an error message is 80 characters or fewer
- **THEN** the full message is displayed in the toast without truncation

#### Scenario: Error toast persists for 8 seconds
- **WHEN** an error toast is displayed
- **THEN** it remains visible for 8000 milliseconds before auto-dismissing

### Requirement: Toast Tap Opens Detail Modal
When a user taps an error toast, a bottom-sheet modal SHALL slide up from the bottom of the screen showing the complete error details.

#### Scenario: User taps error toast
- **WHEN** the user taps an error toast
- **THEN** a modal slides up from the bottom showing the full error title, full message, and a dismiss button

#### Scenario: Modal uses spring animation
- **WHEN** the modal appears or disappears
- **THEN** it uses a spring animation (damping: 15, stiffness: 130) for smooth transition

#### Scenario: Modal is dismissible by swipe-down
- **WHEN** the user swipes the modal downward more than 80 pixels
- **THEN** the modal dismisses with a spring animation

#### Scenario: Modal is dismissible by [Dismiss] button
- **WHEN** the user taps the [Dismiss] button at the bottom of the modal
- **THEN** the modal dismisses with a spring animation

#### Scenario: Modal is dismissible by [✕] header button
- **WHEN** the user taps the close button in the modal header
- **THEN** the modal dismisses with a spring animation

#### Scenario: Modal is dismissible by backdrop tap
- **WHEN** the user taps the dark overlay behind the modal (not the modal content)
- **THEN** the modal dismisses with a spring animation

### Requirement: Stack Trace Display
When an error includes a stack trace, it SHALL be shown in the modal collapsed by default, expandable on long-press.

#### Scenario: Stack trace is collapsed by default
- **WHEN** an error with a stack trace is displayed in the modal
- **THEN** the stack trace section shows a hint text ("▶ Tap stack trace for details") without expanding the trace

#### Scenario: User long-presses stack trace hint
- **WHEN** the user long-presses the stack trace hint line
- **THEN** the stack trace expands to show the full trace in a scrollable view

#### Scenario: User collapses expanded stack trace
- **WHEN** the stack trace is expanded and the user long-presses it again
- **THEN** the stack trace collapses back to the hint text

#### Scenario: Error without stack trace
- **WHEN** an error without a stack trace is displayed
- **THEN** the stack trace section is not shown in the modal

### Requirement: Error Object Handling
The `showErrorToast()` helper SHALL accept both Error objects and strings as the message parameter.

#### Scenario: Error object is passed
- **WHEN** `showErrorToast({ title, message: new Error('fail'), stack })` is called
- **THEN** the helper extracts `error.message` for the toast and modal, and `error.stack` for the modal

#### Scenario: String message is passed
- **WHEN** `showErrorToast({ title, message: 'something failed' })` is called
- **THEN** the string is used directly as the message in both toast and modal

#### Scenario: Stack trace is undefined
- **WHEN** `showErrorToast({ title, message, stack: undefined })` is called
- **THEN** no stack trace section appears in the modal

### Requirement: Haptic Feedback
Haptic feedback SHALL be provided on modal open and stack trace toggle.

#### Scenario: Haptic on modal open
- **WHEN** the error detail modal first appears
- **THEN** a medium haptic impact is triggered

#### Scenario: Haptic on stack trace toggle
- **WHEN** the user expands or collapses the stack trace
- **THEN** a light haptic impact is triggered

### Requirement: Dark Mode Support
The error detail modal SHALL adapt to the app's current theme (light/dark mode).

#### Scenario: Modal uses app theme colors
- **WHEN** the error detail modal is displayed
- **THEN** it uses the app's theme colors for text, backgrounds, and accents

### Requirement: Zero New Dependencies
The error toast system SHALL use only existing project dependencies.

#### Scenario: No new npm packages required
- **WHEN** the error toast system is implemented
- **THEN** it uses only existing packages: Jotai, react-native-reanimated, react-native-gesture-handler, expo-haptics, react-native-toast-message
