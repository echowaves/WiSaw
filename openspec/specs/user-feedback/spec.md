# User Feedback Specification

## Purpose
The user feedback system provides a dedicated screen for users to submit bug reports, feature requests, and general feedback. It also includes toast notifications for non-intrusive success, error, and informational messages throughout the app.

## Requirements

### Requirement: Feedback Submission Form
The system SHALL provide a feedback screen with a free-form text input for users to submit bug reports and feature requests.

#### Scenario: User submits feedback
- **WHEN** the user navigates to the feedback screen, enters text, and submits
- **THEN** the feedback is sent to the server and the user receives confirmation

#### Scenario: User submits empty feedback
- **WHEN** the user attempts to submit feedback without entering text
- **THEN** the submission is prevented and the user is prompted to enter feedback

### Requirement: Feedback Screen Access
The system SHALL make the feedback screen accessible from the drawer navigation menu.

#### Scenario: User navigates to feedback
- **WHEN** the user opens the drawer menu and taps the feedback option
- **THEN** the feedback submission form is displayed

### Requirement: Toast Notifications
The system SHALL display non-intrusive toast notifications for success, error, and informational messages throughout the app experience.

#### Scenario: Action succeeds
- **WHEN** a user action (upload, comment, etc.) completes successfully
- **THEN** a success toast notification briefly appears

#### Scenario: Action fails
- **WHEN** a user action encounters an error
- **THEN** an error toast notification appears with relevant information

### Requirement: Feedback form keyboard avoidance library
The feedback form SHALL use `KeyboardAwareScrollView` from `react-native-keyboard-controller` instead of `react-native-keyboard-aware-scroll-view`.

#### Scenario: Feedback textarea remains visible when keyboard opens
- **WHEN** a user taps the feedback text area
- **THEN** the screen content SHALL scroll so the input remains visible above the keyboard
