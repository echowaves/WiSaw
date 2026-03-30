## Context

The home feed screen (`PhotosList`) has a custom header (`PhotosListHeader`) and footer (`PhotosListFooter`). The header currently holds two icons using absolute positioning: `IdentityHeaderIcon` (left) and `WaveHeaderIcon` (right). The footer has four buttons: drawer menu, video camera, photo camera, and Friends (with an unread badge). The Friends button navigates to `/friends` and displays a numeric badge for unread messages.

The unread count is currently computed in `PhotosList/index.js` via `friendsHelper.getUnreadCountsList()` and passed as a prop down to the footer. `WaveHeaderIcon`, by contrast, is self-contained—it reads from Jotai atoms and fetches its own data.

## Goals / Non-Goals

**Goals:**
- Move the Friends navigation from the footer to the header, placed side by side with the Waves icon on the right
- Create a self-contained `FriendsHeaderIcon` component following the `WaveHeaderIcon` pattern
- Introduce a global Jotai atom for friends unread count so the header icon is reactive
- Simplify the footer to 3 buttons (drawer, video, camera)

**Non-Goals:**
- Changing the Friends screen itself or its routing
- Modifying the drawer menu entry for Friends
- Adding Friends icons to other screens (BookmarksList, WaveDetail)
- Changing the unread count computation logic or backend queries

## Decisions

### 1. Self-contained component pattern (like WaveHeaderIcon)

Create `src/components/FriendsHeaderIcon/index.js` that reads a Jotai atom `friendsUnreadCount` from `state.js` and renders the friends icon with a badge dot.

**Rationale**: Follows the existing established pattern (`WaveHeaderIcon`, `IdentityHeaderIcon`). The component owns its rendering and doesn't need props, making it reusable and testable in isolation.

**Alternative considered**: Passing `unreadCount` as a prop from `PhotosListHeader` → Rejected because the header doesn't currently receive data props and this would break the self-contained icon pattern.

### 2. Jotai atom for unread count

Add `friendsUnreadCount` atom to `src/state.js`. `PhotosList/index.js` already computes this value—it will write to the atom instead of (or in addition to) passing it as a prop. `FriendsHeaderIcon` reads the atom.

**Rationale**: Consistent with how `wavesCount` feeds `WaveHeaderIcon`. Jotai atoms are lightweight and the value is already computed.

**Alternative considered**: Having `FriendsHeaderIcon` fetch its own data like `WaveHeaderIcon` does → Viable but more complex since the unread count is already fetched during feed reload. Using the atom avoids a duplicate network call.

### 3. Flex row layout for right-side header icons

Convert the right side of `PhotosListHeader` from a single absolutely-positioned 40×40 container to a `flexDirection: 'row'` View holding both `WaveHeaderIcon` and `FriendsHeaderIcon` with a small gap.

**Rationale**: Absolute positioning for two icons side by side is fragile. A flex row naturally handles spacing and alignment.

### 4. Badge style: dot (not numeric)

Use a small red dot badge on the friends icon (same style as `WaveHeaderIcon` and `IdentityHeaderIcon`) rather than the numeric badge currently used in the footer.

**Rationale**: The header icons use a consistent visual language of dot badges. A numeric badge would look cluttered at 40×40 icon size. The exact count is visible once the user navigates to the Friends screen.

## Risks / Trade-offs

- **Discoverability**: Moving Friends from the always-visible footer to the header may reduce discoverability for new users → Mitigated by keeping the Friends entry in the drawer menu as an alternative access point.
- **Footer re-centering**: Removing one button changes the visual balance of the footer from 4 to 3 buttons → The remaining buttons (drawer, video, camera) center naturally with `space-around` layout, no special handling needed.
- **Unread badge precision loss**: Switching from a numeric badge to a dot badge loses "how many" information → Acceptable trade-off for visual consistency; the count is shown on the Friends screen itself.
