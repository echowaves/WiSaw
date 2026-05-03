# Inline Comment Input Specification

## Purpose
Provides inline comment composition within expanded masonry grid cards in embedded mode, replacing the modal navigation pattern for embedded photo contexts.

## Requirements

### Requirement: Inline comment composition in embedded mode
When the Photo component is rendered in embedded mode (`embedded === true`) within the masonry grid, the "Add Comment" action SHALL display an inline text input within the expanded card instead of navigating to the `/modal-input` route. The inline input SHALL appear in the same position as the "Add Comment" button, replacing it. The input row SHALL include a cancel button and a send button.

#### Scenario: User taps Add Comment in embedded mode
- **WHEN** the user taps "Add Comment" on an expanded photo in the masonry grid
- **THEN** the "Add Comment" button SHALL be replaced by a `TextInput` with a cancel button and a send button
- **THEN** the `TextInput` SHALL auto-focus and the keyboard SHALL open

#### Scenario: User submits inline comment via send button
- **WHEN** the user types a comment and taps the send button
- **THEN** the comment SHALL be submitted via `reducer.submitComment()` which waits for the backend mutation response
- **THEN** the real backend comment object SHALL be appended to the local `photoDetails.comments` state immediately upon mutation success
- **THEN** no optimistic/fake comment object SHALL be injected into state
- **THEN** a `photoRefreshBus` event SHALL be emitted with the photo's ID
- **THEN** the inline input SHALL collapse back to the "Add Comment" button

#### Scenario: User submits inline comment via keyboard return key
- **WHEN** the user types a comment and presses the return/send key on the keyboard
- **THEN** the behavior SHALL be identical to tapping the send button

#### Scenario: User submits empty inline comment
- **WHEN** the user taps the send button without entering text
- **THEN** the comment SHALL NOT be submitted
- **THEN** the inline input SHALL remain active

#### Scenario: User cancels inline comment via cancel button
- **WHEN** the user taps the cancel button (X icon) in the input row
- **THEN** the inline input SHALL collapse back to the "Add Comment" button
- **THEN** any unsent text SHALL be discarded

#### Scenario: User taps outside the inline input
- **WHEN** the user taps outside the inline input causing the TextInput to lose focus
- **THEN** the inline input SHALL remain visible (NOT auto-dismiss)
- **THEN** the keyboard SHALL dismiss but the input text SHALL be preserved

#### Scenario: Send button tap does not race with blur
- **WHEN** the user taps the send button and the TextInput loses focus
- **THEN** the send handler SHALL complete before any dismiss logic runs
- **THEN** the comment SHALL be submitted successfully

#### Scenario: Non-embedded mode uses modal
- **WHEN** the user taps "Add Comment" on a Photo rendered with `embedded === false`
- **THEN** the system SHALL navigate to the `/modal-input` route as before

#### Scenario: Keyboard scrolls input into view
- **WHEN** the inline input appears and the keyboard rises
- **THEN** the component SHALL register a one-shot `Keyboard.addListener('keyboardDidShow')` listener
- **THEN** inside the listener callback, the input SHALL be measured via `measureInWindow` and compared against `e.endCoordinates.screenY` (the keyboard's top edge)
- **THEN** if the input bottom exceeds the keyboard top, `onRequestEnsureVisible` SHALL be called with the `keyboardTop` value
- **THEN** the masonry list SHALL use `keyboardTop` as the viewport bottom boundary for scroll offset calculation
- **THEN** the listener SHALL be removed after firing once

### Requirement: Inline input height recalculation
When the inline comment input appears or disappears, the expanded masonry cell SHALL recalculate its height to accommodate the content change.

#### Scenario: Input appears and cell grows
- **WHEN** the inline comment input is shown
- **THEN** `scheduleHeightRecalc()` SHALL fire and the masonry cell SHALL grow to fit the input

#### Scenario: Input hides and cell shrinks
- **WHEN** the inline comment input is hidden (after submit or dismiss)
- **THEN** `scheduleHeightRecalc()` SHALL fire and the masonry cell SHALL shrink to remove the input space

### Requirement: Frozen wave comment lock
The inline comment input SHALL respect wave freeze state, matching the existing modal behavior.

#### Scenario: Wave is frozen for non-owner
- **WHEN** the user taps "Add Comment" on a photo in a frozen wave and the user is not the wave owner
- **THEN** a toast SHALL display "Comments are locked for frozen waves"
- **THEN** the inline input SHALL NOT appear
