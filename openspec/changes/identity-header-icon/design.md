## Context

The `PhotosListHeader` component renders a custom header with three zones: an empty 40x40 `View` on the left, a segmented control in the center (Global/Starred/Search), and a `WaveHeaderIcon` on the right. The `WaveHeaderIcon` is a self-contained component that reads Jotai state, renders an icon, and navigates on tap — the identity icon will mirror this pattern.

The `nickName` atom in `src/state.js` already tracks identity state and is used by the drawer layout's identity badge. The `Badge` component from `@rneui/themed` is already used in the footer for unread friend message counts.

## Goals / Non-Goals

**Goals:**
- Provide a visible identity entry point on the home screen without requiring the drawer
- Signal identity setup status via red dot badge and icon color
- Show a small, dismissible popover menu on tap with identity state and navigation
- Follow the `WaveHeaderIcon` component pattern for consistency

**Non-Goals:**
- Identity management directly from the popover (it's just a navigation shortcut)
- Showing the icon on screens other than the photo feed
- Any backend changes or new state atoms

## Decisions

### 1. Popover via absolutely-positioned View + backdrop over Modal or tooltip library

**Decision**: Render the popover as an absolutely-positioned `View` below the icon, with a full-screen transparent `TouchableWithoutFeedback` backdrop for outside-tap dismissal.

**Why not Modal**: `Modal` creates a new React Native root view, which feels heavy for a single-row dropdown. It also complicates z-index stacking with the header's `SafeAreaView`.

**Why not a tooltip library**: Adding a dependency for a single use case. The positioned `View` approach is ~20 lines and fully controlled.

### 2. Icon color change over icon swap

**Decision**: Use the same `user-secret` icon in both states, changing only the color: `theme.TEXT_SECONDARY` when no identity, `MAIN_COLOR` (#EA5E3D) when identity is active.

**Why not switching icons**: A single icon builds recognition. Color change is subtler but sufficient alongside the red dot badge for the unset state. This matches how `WaveHeaderIcon` uses a single icon with color as the only variable.

### 3. Red dot badge (no number) over count badge

**Decision**: Use `Badge` from `@rneui/themed` rendered as a small dot (no `value` prop) in `STATUS_ERROR` color, positioned at the top-right corner of the icon container.

**Why not a count**: There's only one binary state (identity set or not), so a number is meaningless. The dot pattern matches the design language explored during the wave management feature.

### 4. Single row popover over multi-row menu

**Decision**: The popover always shows exactly one row — either "Set Up Identity" with a `user-plus` icon, or the nickname with a `user-secret` icon. Tapping it navigates to `/(drawer)/identity`.

**Why not more rows**: The identity screen itself handles all actions (create, change secret, reset). The popover is just a navigation shortcut, not a command palette.

### 5. Component owns popover state over lifting to parent

**Decision**: The `IdentityHeaderIcon` component manages its own `isOpen` state for the popover via `useState`. No state needs to flow to `PhotosListHeader`.

**Why**: The popover is entirely self-contained — open/close is local UI state. Lifting it would add props and callbacks for no benefit. Matches `WaveHeaderIcon`'s self-contained pattern.

## Risks / Trade-offs

- **[Risk] Popover z-index on Android**: Absolutely-positioned views can have z-index issues on Android with `elevation`. → **Mitigation**: The backdrop will use a high `zIndex` and `elevation` to ensure it renders above header content. The footer already uses `elevation: 14-15` successfully.

- **[Risk] Popover position across screen sizes**: The popover is anchored to the left side of the header (left: 16). On all screen sizes this is consistent since the icon position is absolute. → **Mitigation**: None needed — the position is fixed relative to the header.

- **[Trade-off] Extra tap vs direct navigation**: The popover adds one tap compared to navigating directly like `WaveHeaderIcon`. → **Acceptable**: The popover provides identity context at a glance (showing nickname or setup prompt), which is more useful than a blind navigation. Users who just want to navigate tap twice — icon then row.
