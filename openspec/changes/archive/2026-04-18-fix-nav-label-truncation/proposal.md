## Why

Navigation labels are truncated in two places: the `IdentityHeaderIcon` popover shows "Set Up Ide..." because its `minWidth: 180` is too narrow for the icon + full text + chevron, and the drawer's `IdentityDrawerLabel` uses `numberOfLines={1}` which can truncate long nicknames on some devices. Important navigation text should never be cut off.

## What Changes

- **Widen the identity header icon popover** — increase `minWidth` from 180 to 220 so "Set Up Identity" fits without truncation, and remove `numberOfLines={1}` from the popover label to allow wrapping as a fallback
- **Allow drawer identity label to wrap** — remove `numberOfLines={1}` from `IdentityDrawerLabel` so long nicknames wrap instead of truncating

## Capabilities

### New Capabilities
_None_

### Modified Capabilities
- `identity-header-icon`: The popover label SHALL NOT truncate — it must display the full "Set Up Identity" text or full nickname without ellipsis
- `drawer-identity-badge`: The drawer identity label SHALL NOT truncate — long nicknames must wrap rather than being cut off

## Impact

- **Modified**: `src/components/IdentityHeaderIcon/index.js` — increase popover `minWidth`, remove `numberOfLines` from label
- **Modified**: `app/(drawer)/_layout.tsx` — remove `numberOfLines` from `IdentityDrawerLabel`
- **No new dependencies**
- **No backend changes**
