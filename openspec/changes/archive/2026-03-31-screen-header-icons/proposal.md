## Why

The four primary drawer screens (Identity, Friends, Waves, Feedback) display plain text titles in their headers, while the drawer itself shows icons alongside each label. Adding the matching icon to each screen's header title reinforces the visual connection between drawer navigation and the active screen, improving wayfinding and consistency.

## What Changes

- Create a `SCREEN_HEADER_ICONS` constant map as a single source of truth for the icon library, icon name, and display title of each primary drawer screen (Identity, Friends, Waves, Feedback).
- Create a `ScreenIconTitle` component that renders the icon + title inline, consuming the constant map.
- Identity screen header icon matches the drawer's special behavior: green (`MAIN_COLOR`) when identity is set, default color with red badge dot when not set.
- Replace plain string `title` props with `<ScreenIconTitle>` in the four screen headers.
- Refactor the drawer layout to reference `SCREEN_HEADER_ICONS` instead of inline icon definitions, ensuring a single source of truth.

## Capabilities

### New Capabilities
- `screen-header-icons`: Shared icon map and reusable `ScreenIconTitle` component for rendering icons in screen headers, with Identity-aware styling logic.

### Modified Capabilities

## Impact

- `src/theme/screenIcons.ts` — new file for `SCREEN_HEADER_ICONS` map and `ScreenIconTitle` component
- `app/(drawer)/_layout.tsx` — drawer icon definitions refactored to use shared map
- `app/(drawer)/identity.tsx` — header title switched to `ScreenIconTitle`
- `app/(drawer)/friends.tsx` — header title switched to `ScreenIconTitle`
- `app/(drawer)/waves/index.tsx` — header title switched to `ScreenIconTitle`
- `src/screens/Feedback/index.js` — header title switched to `ScreenIconTitle` (two instances)
- No new dependencies. Uses existing `@expo/vector-icons`, Jotai, and theme utilities.
