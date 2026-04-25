## Context

The app has two header implementations:
1. **PhotosListHeader** (landing page) — custom component using `SafeAreaView edges={['top']}` with a fixed 60px content height. This is the "correct" reference.
2. **AppHeader** (all other screens) — reusable component using `SafeAreaView` without edge restriction and `minHeight: 56` + `paddingVertical: 12` (effective ~80px). This creates a visible gap due to bottom safe area padding on modern iPhones.

AppHeader also has a `safeTopOnly` prop that switches to a plain `View` with manual `paddingTop: insets.top` — only used by NamePicker as a workaround.

## Goals / Non-Goals

**Goals:**
- Make AppHeader produce the same visual header height as PhotosListHeader
- Eliminate the gap between header and content on all screens
- Remove the `safeTopOnly` workaround that is no longer needed

**Non-Goals:**
- Changing PhotosListHeader itself — it's the reference implementation and already correct
- Reworking the native Stack header used by `getDefaultScreenOptions()` — only AppHeader-based screens are affected
- Modifying the `HEADER_HEIGHTS` constants in sharedStyles.js — those are used by other parts of the system (transparent overlays, route styles) and should be revisited separately if needed

## Decisions

### 1. Use `SafeAreaView edges={['top']}` instead of unrestricted SafeAreaView

**Choice:** Always render `SafeAreaView edges={['top']}` in AppHeader.

**Why:** This matches PhotosListHeader exactly. The header only needs top inset (notch/status bar). Bottom inset is for the home indicator — irrelevant to headers. The `safeTopOnly` prop was a workaround for this same problem.

**Alternatives considered:**
- Keep `safeTopOnly` and have callers opt in → spreads the fix across many files instead of one
- Use a plain `View` with manual `paddingTop: insets.top` everywhere → loses SafeAreaView's built-in handling

### 2. Fix content height to 60px to match PhotosListHeader

**Choice:** Change AppHeader's inner content container from `minHeight: 56` + `paddingVertical: 12` to `height: 60` with centered content.

**Why:** PhotosListHeader uses `height: 60` and looks correct. The current AppHeader's `minHeight: 56` + `24px` padding = ~80px effective height, which is noticeably taller.

**Alternatives considered:**
- Use `minHeight: 60` → allows unbounded growth; fixed height is more predictable
- Extract a shared constant → overkill for two components; use the same literal value

### 3. Remove `safeTopOnly` prop entirely

**Choice:** Delete the prop, the conditional `Outer` logic, and the Android status bar workaround in AppHeader.

**Why:** With `edges={['top']}` always applied, `safeTopOnly` serves no purpose. The single call site (NamePicker) can drop the prop with no behavior change.

### 4. Keep Android `paddingTop` workaround for `edges={['top']}`

**Choice:** On Android, `SafeAreaView edges={['top']}` from `react-native-safe-area-context` should handle the status bar. Remove the manual Android `paddingTop: StatusBar.currentHeight` since SafeAreaView already accounts for it.

**Why:** The manual padding was there because the old unrestricted SafeAreaView on Android didn't always work. With explicit `edges={['top']}` and the current version of `react-native-safe-area-context`, this is handled properly. Keeping both would double the padding on Android.

## Risks / Trade-offs

- **[Visual regression on Android]** → Test on Android after change since we're removing the manual StatusBar.currentHeight padding. SafeAreaView edges={['top']} should handle it, but Android safe area behavior varies by device.
- **[Screens relying on extra header height]** → Any screen that inadvertently depended on the 80px header height will see content shift up ~20px. This is the desired fix, but worth a visual check across all screens.
