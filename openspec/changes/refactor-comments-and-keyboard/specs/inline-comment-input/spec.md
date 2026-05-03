## MODIFIED Requirements

### Requirement: Inline comment composition in embedded mode
When the Photo component is rendered in embedded mode (`embedded === true`) within the masonry grid, the "Add Comment" action SHALL display an inline text input within the expanded card instead of navigating to the `/modal-input` route. The inline input SHALL appear in the same position as the "Add Comment" button, replacing it. The input row SHALL include a cancel button and a send button.

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

#### Scenario: Keyboard scrolls input into view
- **WHEN** the inline input appears and the keyboard rises
- **THEN** the component SHALL register a one-shot `Keyboard.addListener('keyboardDidShow')` listener
- **THEN** inside the listener callback, the input SHALL be measured via `measureInWindow` and compared against `e.endCoordinates.screenY` (the keyboard's top edge)
- **THEN** if the input bottom exceeds the keyboard top, `onRequestEnsureVisible` SHALL be called with the `keyboardTop` value
- **THEN** the masonry list SHALL use `keyboardTop` as the viewport bottom boundary for scroll offset calculation
- **THEN** the listener SHALL be removed after firing once
