## MODIFIED Requirements

### Requirement: One-time hint banner for photo actions discoverability
The system SHALL display the shared `InteractionHintBanner` component at the top of the main photo feed to teach the long-press / ⋮ tap interaction. The inline hint banner implementation (state, effect, dismiss handler, JSX, styles) SHALL be removed and replaced with a single `<InteractionHintBanner hasContent={photosList?.length > 0} />` render.

#### Scenario: First visit to main feed
- **WHEN** the user opens the main photo feed for the first time (no relevant SecureStore keys set)
- **THEN** the `InteractionHintBanner` component SHALL be rendered with `hasContent` set to whether photos exist
- **THEN** the shared banner SHALL display with unified text "Tap and hold for options or tap ⋮"

#### Scenario: User dismisses the banner
- **WHEN** the user taps the ✕ dismiss button on the hint banner
- **THEN** the banner SHALL be removed from view
- **THEN** the system SHALL set SecureStore key `interactionHintShown` to `"true"`

#### Scenario: Subsequent visits to main feed
- **WHEN** the user opens the main photo feed and any of the SecureStore keys (`interactionHintShown`, `photoActionsHintShown`, `waveContextMenuTooltipShown`) is set
- **THEN** the hint banner SHALL NOT be displayed

## REMOVED Requirements

### Requirement: Inline hint banner state and styling in PhotosList
**Reason**: Replaced by the shared `InteractionHintBanner` component. The `showPhotoHint` state, `checkHint` effect, `dismissPhotoHint` handler, inline banner JSX, and `photoHintBanner`/`photoHintContent`/`photoHintText` styles are no longer needed.
**Migration**: Replace with `<InteractionHintBanner hasContent={photosList?.length > 0} />` rendered in the same position.
