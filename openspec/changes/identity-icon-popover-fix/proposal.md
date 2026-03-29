## Why

The `IdentityHeaderIcon` popover menu renders inside the header's view hierarchy, which causes it to slide behind the masonry photo grid below. React Native's default `overflow: 'hidden'` on Android clips the popover to the header bounds, and on both platforms the masonry content (a sibling rendered after the header) paints over the absolutely-positioned popover. Additionally, the backdrop uses `position: 'fixed'`, which is not supported in React Native.

## What Changes

- **Replace absolute-positioned popover with `Modal`**: Use React Native's `Modal` component with `transparent: true` to render the popover in its own native layer, guaranteed to render above all other content regardless of view hierarchy
- **Fix backdrop to use `Modal`'s full-screen transparent view**: Replace the invalid `position: 'fixed'` backdrop with a proper full-screen `TouchableWithoutFeedback` inside the `Modal`
- **Position popover using SafeArea insets**: Use `useSafeAreaInsets()` to calculate the correct top offset for the popover inside the Modal, accounting for status bar + header height

## Capabilities

### New Capabilities
_None_

### Modified Capabilities
- `identity-header-icon`: Popover rendering mechanism changes from absolutely-positioned View to Modal-based overlay, fixing the z-index stacking issue

## Impact

- **Modified**: `src/components/IdentityHeaderIcon/index.js` — replace popover implementation with `Modal`-based approach
- **No new dependencies**: `Modal` is built into React Native, `useSafeAreaInsets` is already available via `react-native-safe-area-context`
- **No API or state changes**: Same Jotai atoms, same navigation, same user-facing behavior
