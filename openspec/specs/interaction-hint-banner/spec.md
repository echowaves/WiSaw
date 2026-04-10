# Interaction Hint Banner Specification

## Purpose
Shared reusable one-time hint banner component for teaching long-press and ⋮ tap interactions across all screens that support context menus.

## Requirements

### Requirement: InteractionHintBanner component provides a reusable one-time hint banner
The system SHALL provide a shared `InteractionHintBanner` React Native component at `src/components/ui/InteractionHintBanner.js` that displays a dismissible hint banner for long-press and ⋮ tap interactions. The component SHALL be fully self-contained, managing its own visibility state, storage persistence, and dismiss behavior. The component SHALL accept an optional `hintText` prop to customize the displayed text.

#### Scenario: Component renders the banner when hint has not been shown
- **WHEN** the `InteractionHintBanner` component mounts and storage key `interactionHintShown` is not set
- **AND** the `hasContent` prop is `true`
- **THEN** the component SHALL display a banner with a bulb icon (Ionicons `bulb-outline`, size 16, color `#FFD700`), the text from `hintText` prop (defaulting to "Tap and hold for options or tap ⋮" if not provided), and a ✕ close button (Ionicons `close`, size 18, color `rgba(255,255,255,0.8)`)
- **THEN** the banner SHALL have a dark semi-transparent background (`rgba(0,0,0,0.6)`), horizontal padding 14, vertical padding 10, border radius 12, and horizontal margin 12

#### Scenario: Component checks a single key for hint status
- **WHEN** the component mounts and checks storage for hint status
- **THEN** it SHALL check only the key `interactionHintShown` using `Storage.getItem()` from `expo-storage`
- **THEN** if the key has a value, the banner SHALL NOT be displayed

#### Scenario: User dismisses the banner
- **WHEN** the user taps the ✕ close button on the banner
- **THEN** the banner SHALL be immediately removed from view
- **THEN** the system SHALL write key `interactionHintShown` to `"true"` using `Storage.setItem()` from `expo-storage`

#### Scenario: Banner hidden when no content
- **WHEN** the `hasContent` prop is `false`
- **THEN** the banner SHALL NOT be displayed regardless of storage state

#### Scenario: Banner hidden after dismissal on subsequent mounts
- **WHEN** the component mounts and storage key `interactionHintShown` is `"true"`
- **THEN** the banner SHALL NOT be displayed

#### Scenario: Custom hint text provided
- **WHEN** the `InteractionHintBanner` is rendered with a `hintText` prop value
- **THEN** the banner SHALL display the provided text instead of the default
