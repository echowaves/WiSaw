## MODIFIED Requirements

### Requirement: InteractionHintBanner component provides a reusable one-time hint banner
The system SHALL provide a shared `InteractionHintBanner` React Native component at `src/components/ui/InteractionHintBanner.js` that displays a dismissible hint banner for long-press and ⋮ tap interactions. The component SHALL be fully self-contained, managing its own visibility state, SecureStore persistence, and dismiss behavior.

#### Scenario: Component renders the banner when hint has not been shown
- **WHEN** the `InteractionHintBanner` component mounts and SecureStore key `interactionHintShown` is not set
- **AND** the `hasContent` prop is `true`
- **THEN** the component SHALL display a banner with a bulb icon (Ionicons `bulb-outline`, size 16, color `#FFD700`), text "Tap and hold for options or tap ⋮", and a ✕ close button (Ionicons `close`, size 18, color `rgba(255,255,255,0.8)`)
- **THEN** the banner SHALL have a dark semi-transparent background (`rgba(0,0,0,0.6)`), horizontal padding 14, vertical padding 10, border radius 12, and horizontal margin 12

#### Scenario: Component checks a single key for hint status
- **WHEN** the component mounts and checks SecureStore for hint status
- **THEN** it SHALL check only the key `interactionHintShown`
- **THEN** if the key has a value, the banner SHALL NOT be displayed

#### Scenario: User dismisses the banner
- **WHEN** the user taps the ✕ close button on the banner
- **THEN** the banner SHALL be immediately removed from view
- **THEN** the system SHALL write SecureStore key `interactionHintShown` to `"true"`

#### Scenario: Banner hidden when no content
- **WHEN** the `hasContent` prop is `false`
- **THEN** the banner SHALL NOT be displayed regardless of SecureStore state

#### Scenario: Banner hidden after dismissal on subsequent mounts
- **WHEN** the component mounts and SecureStore key `interactionHintShown` is `"true"`
- **THEN** the banner SHALL NOT be displayed
