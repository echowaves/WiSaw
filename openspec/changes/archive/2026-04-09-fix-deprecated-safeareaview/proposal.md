## Why

React Native has deprecated `SafeAreaView` from the core `react-native` package. Two files still import it from `react-native` instead of `react-native-safe-area-context`, producing a runtime warning on every render. Both files already depend on `react-native-safe-area-context` for other imports, so the fix is a straightforward import swap.

## What Changes

- Replace `SafeAreaView` import from `react-native` with import from `react-native-safe-area-context` in:
  - `src/screens/TandC/index.tsx`
  - `src/components/AppHeader/index.tsx`
- Verify usage sites work with the `react-native-safe-area-context` API (e.g., `edges` prop).

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

_(none — no spec-level behavior changes, only an import source change)_

## Impact

- **Code**: `src/screens/TandC/index.tsx`, `src/components/AppHeader/index.tsx`
- **Dependencies**: No new dependencies — `react-native-safe-area-context` is already installed and used elsewhere
- **Runtime**: Eliminates the deprecation warning; no functional change
