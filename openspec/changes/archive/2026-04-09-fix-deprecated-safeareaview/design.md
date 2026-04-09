## Context

Two files import `SafeAreaView` from the core `react-native` package, which has been deprecated in favour of `react-native-safe-area-context`. Both files already import other symbols from `react-native-safe-area-context`, so the correct library is already a dependency.

Files affected:
- `src/components/AppHeader/index.tsx` — uses `SafeAreaView` from RN core as a conditional wrapper (`Outer`), with manual Android status-bar padding.
- `src/screens/TandC/index.tsx` — straightforward `<SafeAreaView>` wrapper around the modal content.

## Goals / Non-Goals

**Goals:**
- Eliminate the runtime deprecation warning by switching to `react-native-safe-area-context`'s `SafeAreaView`.
- Maintain identical visual behaviour on iOS, Android, and Web.

**Non-Goals:**
- Refactoring `AppHeader`'s `safeTopOnly` logic or Android status-bar workaround — keep existing behaviour.
- Auditing all safe-area usage across the app — only fix the deprecated imports.

## Decisions

1. **Import swap only** — replace the `SafeAreaView` import source; do not change component structure or props. `react-native-safe-area-context`'s `SafeAreaView` is a drop-in replacement when no `edges` prop is specified (defaults to all edges), matching the core RN behaviour.

2. **Keep AppHeader's conditional Outer pattern** — `AppHeader` uses `const Outer = safeTopOnly ? View : SafeAreaView`. This pattern works identically with the `react-native-safe-area-context` version. The Android status-bar padding workaround stays untouched.

## Risks / Trade-offs

- **[Low] Subtle edge behavior difference** → The `react-native-safe-area-context` version requires a `SafeAreaProvider` ancestor. This is already provided in `app/_layout.tsx` via `<SafeAreaProvider>`, so no issue.
