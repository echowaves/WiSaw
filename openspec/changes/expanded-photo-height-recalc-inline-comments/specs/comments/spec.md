## MODIFIED Requirements

### Requirement: Comment Input Modal
The system SHALL provide an interactive comment composer as a root-level modal route (`app/modal-input.tsx`) with `presentation: 'modal'`, accessible from any navigator stack in the app. The modal SHALL display a text field and a send button in a custom `AppHeader`. After comment submission or dismissal, `router.back()` SHALL return the user to the screen they came from. When the Photo component is rendered in embedded mode (`embedded === true`), the "Add Comment" action SHALL use the inline comment input instead of navigating to the modal route.

#### Scenario: User opens comment input from PhotosList
- **WHEN** the user taps "Add Comment" on a photo expanded in PhotosList
- **THEN** the inline comment input SHALL appear within the expanded card
- **THEN** the modal route SHALL NOT be opened

#### Scenario: User opens comment input from WaveDetail
- **WHEN** the user taps "Add Comment" on a photo expanded in WaveDetail
- **THEN** the inline comment input SHALL appear within the expanded card

#### Scenario: User opens comment input from shared photo
- **WHEN** the user taps "Add Comment" on a shared photo detail screen (non-embedded)
- **THEN** the modal input interface SHALL open as a modal overlay
- **THEN** after submitting or dismissing, the user SHALL return to the shared photo screen

#### Scenario: User opens comment input from standalone photo view
- **WHEN** the user taps "Add Comment" on a Photo rendered with `embedded === false`
- **THEN** the modal input interface SHALL open as a modal overlay
