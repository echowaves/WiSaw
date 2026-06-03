## Context

The app uses `react-native-toast-message@2.3.3` for all toast notifications. The library's built-in `BaseToast` component truncates both `text1` (title) and `text2` (message) to 1 line each with `numberOfLines={1}` and `ellipsizeMode='tail'`. The library already supports `onPress` on the toast container, but no code in the app uses it.

When errors occur (network failures, GraphQL mutations), the toast shows a truncated message like "Network Issue?" or the first 80 characters of the error. The user has no way to see the full message.

The app already uses:
- **Jotai** for state management (atoms everywhere)
- **react-native-reanimated** for animations
- **React Native Modal** for dialogs
- **expo-haptics** for haptic feedback

## Goals / Non-Goals

**Goals:**
- Error toasts are clickable and open a modal with full error details
- Modal is dismissible by swipe-down, [Dismiss] button, or backdrop tap
- Stack traces are collapsed by default, expandable on long-press
- Zero new dependencies
- `showErrorToast()` helper makes migration incremental and consistent

**Non-Goals:**
- Migrating existing `Alert.alert()` calls (future work)
- Adding retry buttons (most errors don't have meaningful retries)
- Changing success/info toasts (they're short enough)
- Analytics or error reporting integration

## Architecture

```
┌─ Toast (brief) ────────────────────────┐
│    ⚠️ Upload Failed                      │
│   Network request failed... [▶]          │
│    (8s visibility, haptic on press)       │
└─────────────────────────────────────────┘
          ↓ tap
┌─ Modal (slide up from bottom) ─────────┐
│                                    [✕]   │
│    ⚠️ Upload Failed                     │
│    ──────────────────────────────────    │
│   Network request failed.                │
│                                          │
│   Tap stack trace for details            │
│    ──────────────────────────────────    │
│                              [Dismiss]   │
└─────────────────────────────────────────┘
          ↓ long-press on "stack trace" line
┌─ Modal (expanded) ─────────────────────┐
│    ⚠️ Upload Failed                     │
│    ──────────────────────────────────    │
│   Network request failed.                │
│                                          │
│    ▼ Stack Trace (expanded)              │
│   TypeError: fetch failed...             │
│     at uploadPhoto src/...               │
│     at async ...                         │
│                                          │
│                              [Dismiss]   │
└─────────────────────────────────────────┘
```

## State Flow

```
User triggers action
       │
       ▼
  Mutation fails
       │
       ▼
  showErrorToast({ title, message, stack })
       │
       ├──▶ Toast.show({ text1, text2, onPress: openModal })
       │
       ▼
  User taps toast
       │
       ▼
  errorAtom.set({ visible: true, title, message, stack })
       │
       ▼
  ErrorDetailModal renders (animated slide-up)
       │
       ├──▶ User reads details
       │
       ├──▶ User long-presses stack trace line → expand/collapse
       │
       └──▶ User dismisses (swipe / button / backdrop)
               │
               ▼
          errorAtom.set(null)
```

## Decisions

**Decision: Jotai atom for error context**
- Rationale: App already uses Jotai everywhere. Zero new state management patterns. The atom lives in `src/atoms/errorAtom.js` and is accessible from any component.
- Alternatives considered:
   - Singleton module with setter/getter — works but doesn't trigger re-renders in components that need to know about the error state.
   - React Context — adds provider boilerplate, Jotai is already the app's pattern.

**Decision: Bottom-sheet modal (not full-screen)**
- Rationale: Error details are text-only. A bottom-sheet is less disruptive than a full-screen modal and matches the toast's "supplementary" nature. Uses `react-native-reanimated` for smooth slide-up animation.
- Alternatives considered:
   - React Native `Modal` with `presentationStyle='formSheet'` — works but less control over animation.
   - `react-native-bottom-sheet` library — adds a dependency we don't need.

**Decision: No retry button**
- Rationale: Most errors (network failures, GraphQL errors) don't have a meaningful retry. When they do, the user can just tap the action again from the UI. A retry button creates false expectations.
- Exception: If `showErrorToast()` is called with a `retry` function, the button appears. But default behavior is no retry.

**Decision: Stack trace collapsed by default, expand on long-press**
- Rationale: Stack traces are rarely useful at a glance. They're debugging artifacts. Collapsed by default keeps the modal clean. Long-press (not tap) avoids accidental expansion since the modal itself is dismissible by tap.
- Alternatives considered:
   - Always visible — clutters the modal with debugging info most users don't need.
   - Tap to expand — conflicts with modal dismissal gesture.
   - Separate "Details" button — adds a UI element. Long-press is discoverable via text hint.

**Decision: Swipe-down to dismiss**
- Rationale: Standard pattern in modern apps. Uses `react-native-gesture-handler` (already in deps) with `PanResponder` or `Reanimated` gesture handler.
- Implementation: Uses `react-native-reanimated`'s built-in gesture handlers since the app already uses it extensively.

**Decision: `Toast.config()` for custom error toast**
- Rationale: One-time setup in `_layout.tsx` makes all error toasts automatically have the "tap for details" indicator. No per-call configuration needed for basic usage.
- The custom toast adds a `[▶]` indicator and increases `visibilityTime` to 8 seconds.

## File Structure

```
src/
├── atoms/
│   └── errorAtom.js          # New: Jotai atom
├── components/
│   └── ErrorDetailModal/
│       └── index.js          # New: bottom-sheet modal
└── utils/
    └── showErrorToast.js     # New: helper function
```

## Migration Strategy

Phase 1: Create the foundation (atom, modal, helper, layout wiring) — no existing code changes. Test with a single hardcoded error toast.

Phase 2: Replace error `Toast.show()` calls in high-value files:
- `src/components/Photo/reducer.js` (core photo operations)
- `src/hooks/usePhotoActions.js` (most user-facing errors)
- `app/(drawer)/waves/join.tsx` (wave join errors)

Phase 3: Replace remaining error toasts across screens and components.

Phase 4: (Future) Migrate `Alert.alert()` calls to use the same modal.
