## Context

The drawer layout in `app/(drawer)/_layout.tsx` defines icons for each screen. Currently, `IdentityDrawerIcon` is the only drawer icon with conditional color logic (uses `MAIN_COLOR` when identity is set). The Friends and Waves drawer items use the default drawer `color` prop for their icons.

Meanwhile, the header icons (`FriendsHeaderIcon`, `WaveHeaderIcon`) use `MAIN_COLOR` when the feature has activity and `theme.TEXT_SECONDARY` when inactive. This mismatch means the drawer doesn't visually reflect the same activity state the header does.

## Goals / Non-Goals

**Goals:**
- Make `WavesDrawerIcon` use `MAIN_COLOR` when wave activity exists (matching `WaveHeaderIcon` logic).
- Create a `FriendsDrawerIcon` component with `MAIN_COLOR` when the user has friends (matching `FriendsHeaderIcon` logic).
- Keep the color override only for the unfocused/inactive state — when the drawer item is focused/active, use the drawer's active tint color (white on coral background).

**Non-Goals:**
- Changing badge behavior (already handled by prior changes).
- Adding badges to the Friends drawer icon (unread badge is header-only for now).
- Changing header icon components.
- Adding color logic to Feedback or Bookmarks drawer items (no header equivalents exist).

## Decisions

**Use the same pattern as `IdentityDrawerIcon` for conditional color**
The existing `IdentityDrawerIcon` already demonstrates the pattern: read a Jotai atom, apply `MAIN_COLOR` when a condition is true and the item is not focused, otherwise fall through to the drawer's `color` prop. This same pattern will be used for Friends and Waves.

**Alternative considered**: Using a shared higher-order component or hook. Rejected because the logic is a simple one-liner ternary per icon, and the existing pattern of inline components is already established in this file.

**Read `friendsList` atom for Friends color, `wavesCount`/`ungroupedPhotosCount` for Waves color**
- Friends: `hasFriends = friendsList && friendsList.length > 0` → mirrors `FriendsHeaderIcon`.
- Waves: `hasActivity = (wavesCount > 0) || (ungroupedPhotosCount > 0)` → mirrors `WaveHeaderIcon`. The `ungroupedPhotosCount` atom is already read by `WavesDrawerIcon`; only `wavesCount` needs to be added.

**Respect the `focused` prop to avoid color conflict with active state**
When a drawer item is active (focused), the drawer renders it with white text/icon on a coral background. The `MAIN_COLOR` override should only apply when `!focused`, exactly as `IdentityDrawerIcon` does. This requires the `focused` prop which is available from the drawer's `drawerIcon` render prop.

## Risks / Trade-offs

- [Additional atom subscriptions] → Two new atoms read in the drawer. Negligible performance impact since these atoms are already in memory and rarely change.
- [No risk of visual regression] → The active/focused state is explicitly handled to avoid MAIN_COLOR clashing with the active tint.
