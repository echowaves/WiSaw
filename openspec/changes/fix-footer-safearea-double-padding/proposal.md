## Why

The `finalize-safeareaview-migration` commit (5d6b58ac) migrated `SafeAreaView` imports from `react-native` to `react-native-safe-area-context`. However, the `react-native-safe-area-context` version applies safe area insets on **all edges** (top, bottom, left, right) by default, while the old `react-native` version only handled top insets on iOS. This causes the footer buttons (hamburger menu, video, camera) to be shifted too far down and not vertically centered within the footer bar.

The footer has a double-padding problem:
1. `SafeAreaView` applies top padding (pushing buttons down)
2. Outer View applies `paddingBottom: insets.bottom` (redundant with SafeAreaView's bottom padding)
3. Inner View applies `paddingTop: 10` (additional top offset)

Three layers of vertical padding stack on top of each other, breaking the intended centered layout.

## What Changes

- Constrain `SafeAreaView` in `PhotosListFooter` to bottom edge only using `edges={['bottom']}`
- Remove redundant `paddingBottom: insets.bottom` from the outer View in `PhotosListFooter`
- This restores the footer buttons to their intended vertically centered position

## Capabilities

### Modified Capabilities
- `photo-feed`: Footer layout requirement — camera buttons must be visually centered in the footer width with proper vertical alignment

## Impact

- `src/screens/PhotosList/components/PhotosListFooter.js` — the only file affected
- No API, dependency, or cross-screen impact
- Visual fix only; no behavioral changes
