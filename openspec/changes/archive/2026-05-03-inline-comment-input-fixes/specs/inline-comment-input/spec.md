## MODIFIED Requirements

### Requirement: Inline comment composition in embedded mode
When the Photo component is rendered in embedded mode (`embedded === true`) within the masonry grid, the "Add Comment" action SHALL display an inline text input within the expanded card instead of navigating to the `/modal-input` route. The inline input SHALL appear in the same position as the "Add Comment" button, replacing it. The input row SHALL include a cancel button and a send button.

#### Scenario: User taps Add Comment in embedded mode
- **WHEN** the user taps "Add Comment" on an expanded photo in the masonry grid
- **THEN** the "Add Comment" button SHALL be replaced by a `TextInput` with a cancel button and a send button
- **THEN** the `TextInput` SHALL auto-focus and the keyboard SHALL open

#### Scenario: User submits inline comment via send button
- **WHEN** the user types a comment and taps the send button
- **THEN** the comment SHALL be submitted via `reducer.submitComment()`
- **THEN** an optimistic comment SHALL appear immediately in the comments list with the current user's `uuid` and current timestamp as `updatedAt`
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
- **THEN** the masonry list SHALL scroll so the input row is visible above the keyboard
