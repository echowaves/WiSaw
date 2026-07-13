## Context

The `SafeAreaProvider` from `react-native-safe-area-context` wraps the main app tree in `_layout.tsx`. Components inside this tree get correct safe area insets via `SafeAreaView` or `useSafeAreaInsets()`.

However, React Native's `Modal` with `presentationStyle='fullScreen'` creates a separate native view hierarchy that sits **outside** the `SafeAreaProvider` context. Any `SafeAreaView` or `useSafeAreaInsets()` call inside such a modal receives zero insets (`{top: 0, right: 0, bottom: 0, left: 0}`).

The NamePicker component is the only full-screen Modal in the app that uses `AppHeader` (which internally wraps content in `SafeAreaView edges={['top']}`). This causes the header to render under the iOS status bar, making the back button unreachable.

## Goals / Non-Goals

**Goals:**
- NamePicker header renders below the iOS status bar with correct top inset
- Back button and header title are fully accessible
- `useSafeAreaInsets()` inside NamePicker returns correct values (for bottom padding on KeyboardAwareScrollView)

**Non-Goals:**
- Auditing other modals for similar issues (already confirmed none exist)
- Changing AppHeader's internal SafeAreaView implementation
- Migrating to a different safe area library

## Decisions

### Decision: Wrap Modal content in nested SafeAreaProvider

**Why:** The simplest fix that preserves the existing `AppHeader` abstraction and requires no changes to shared components.

`react-native-safe-area-context` supports nested `SafeAreaProvider` instances. Wrapping the Modal's inner `View` in its own `SafeAreaProvider` gives `SafeAreaView` and `useSafeAreaInsets()` correct context inside the modal.

**Alternatives considered:**
1. **Replace AppHeader's SafeAreaView with React Native's built-in SafeAreaView** — Would require changing AppHeader (affects all screens) and loses consistency with the `safeareaview-migration` spec.
2. **Manual paddingTop from Platform constants** — Fragile, doesn't adapt to dynamic inset changes, and doesn't fix `useSafeAreaInsets()` for bottom padding.
3. **Use Stack.Screen header instead of AppHeader in modal** — Would require refactoring NamePicker to not be a full-screen Modal, changing its presentation behavior.

## Risks / Trade-offs

- **Performance**: Adding a second `SafeAreaProvider` is negligible — it's a lightweight context provider.
- **Android**: The fix is safe on Android as well; the nested provider will resolve correct Android insets (which are smaller but still non-zero on devices with cutouts).
