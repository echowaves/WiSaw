## Why

The NamePicker component (used for "Add Friend" and "Edit Friend Name") renders inside a full-screen Modal which sits outside the `SafeAreaProvider` tree. This causes `AppHeader`'s internal `SafeAreaView` to receive zero top inset, pushing the header under the iOS status bar where the back button becomes unreachable.

## What Changes

- Wrap the NamePicker Modal content in its own `SafeAreaProvider` so that `SafeAreaView` and `useSafeAreaInsets()` resolve correct insets inside the modal view hierarchy.

## Capabilities

### New Capabilities
(None — this is a bug fix to existing behavior, no new capability introduced.)

### Modified Capabilities
- `safeareaview-migration`: Add requirement that full-screen Modals using `AppHeader` must be wrapped in `SafeAreaProvider` to ensure correct inset resolution.

## Impact

- **Files affected**: `src/components/NamePicker/index.js` (primary fix), `openspec/specs/safeareaview-migration/spec.md` (delta spec).
- **No API or dependency changes**. `SafeAreaProvider` is already imported in `_layout.tsx` from `react-native-safe-area-context`.
- **Scope**: NamePicker is the only full-screen Modal that uses AppHeader, so this is the only component that needs the fix.
