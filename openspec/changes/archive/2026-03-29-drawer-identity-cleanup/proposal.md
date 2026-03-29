## Why

The drawer now has three redundant paths to the identity screen: a custom identity badge at the top, the "Identity" menu item from `DrawerItemList`, and the new header icon popover. The top badge duplicates what the header icon already provides (status display + navigation). The "Identity" drawer item should be enhanced to show identity status (icon color, label, red dot) so the badge can be removed without losing at-a-glance identity information in the drawer.

## What Changes

- **Remove the identity badge block** from `CustomDrawerContent` in `app/(drawer)/_layout.tsx` — the entire conditional block (nickname display card / "Set up identity" touchable) above `DrawerItemList`
- **Remove identity badge styles** — `identityBadge`, `identityIconContainer`, `identityNickName`, `identityStatus`, `identitySetupText` from `createStyles`
- **Enhance the "Identity" drawer item** to mirror the header icon's visual cues:
  - Icon color: `MAIN_COLOR` when identity active, default inactive color when not
  - Label: show nickname when identity active, "Set Up Identity" when not
  - Red dot badge on the icon when no identity is set

## Capabilities

### New Capabilities
_None_

### Modified Capabilities
- `identity-header-icon`: No spec-level requirement change — the header icon is unchanged. Only the drawer's representation of identity status is affected, which is a UI layout concern in the drawer layout, not a capability-level change.

## Impact

- **Modified**: `app/(drawer)/_layout.tsx` — remove badge block, remove badge styles, update `Drawer.Screen name='identity'` options with dynamic `drawerIcon` and `drawerLabel`
- **New**: Small wrapper components for the drawer icon and label that read `nickName` atom via `useAtom`
- **No new dependencies**
- **No backend changes**
