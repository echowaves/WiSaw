# Inline Comment Input Specification

## Purpose
Provides inline comment composition within expanded masonry grid cards in embedded mode, replacing the modal navigation pattern for embedded photo contexts.

## Requirements

### Requirement: Inline comment composition in embedded mode
When the Photo component is rendered in embedded mode (`embedded === true`) within the masonry grid, the "Add Comment" action SHALL display an inline text input within the expanded card instead of navigating to the `/modal-input` route. The inline input SHALL appear in the same position as the "Add Comment" button, replacing it.

#### Scenario: User taps Add Comment in embedded mode
- **WHEN** the user taps "Add Comment" on an expanded photo in the masonry grid
- **THEN** the "Add Comment" button SHALL be replaced by a `TextInput` with a send button
- **THEN** the `TextInput` SHALL auto-focus and the keyboard SHALL open

#### Scenario: User submits inline comment
- **WHEN** the user types a comment and taps the send button
- **THEN** the comment SHALL be submitted via `reducer.submitComment()`
- **THEN** an optimistic comment SHALL appear immediately in the comments list
- **THEN** a `photoRefreshBus` event SHALL be emitted with the photo's ID
- **THEN** the inline input SHALL collapse back to the "Add Comment" button

#### Scenario: User submits empty inline comment
- **WHEN** the user taps the send button without entering text
- **THEN** the comment SHALL NOT be submitted
- **THEN** the inline input SHALL remain active

#### Scenario: Inline input dismissed on blur
- **WHEN** the user taps outside the inline input or the keyboard dismisses
- **THEN** the inline input SHALL collapse back to the "Add Comment" button
- **THEN** any unsent text SHALL be discarded

#### Scenario: Non-embedded mode uses modal
- **WHEN** the user taps "Add Comment" on a Photo rendered with `embedded === false`
- **THEN** the system SHALL navigate to the `/modal-input` route as before

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
