## MODIFIED Requirements

### Requirement: InteractionHintBanner component provides a reusable one-time hint banner
The system SHALL provide a shared `InteractionHintBanner` React Native component at `src/components/ui/InteractionHintBanner.js` that displays a dismissible hint banner for long-press and ⋮ tap interactions. The component SHALL be fully self-contained, managing its own visibility state, storage persistence, and dismiss behavior. The component SHALL accept an optional `hintText` prop to customize the displayed text.

#### Scenario: Component checks a single key for hint status
- **WHEN** the component mounts and checks storage for hint status
- **THEN** it SHALL check only the key `interactionHintShown` using `Storage.getItem()` from `expo-storage`
- **THEN** if the key has a value, the banner SHALL NOT be displayed

#### Scenario: User dismisses the banner
- **WHEN** the user taps the ✕ close button on the banner
- **THEN** the banner SHALL be immediately removed from view
- **THEN** the system SHALL write key `interactionHintShown` to `"true"` using `Storage.setItem()` from `expo-storage`
