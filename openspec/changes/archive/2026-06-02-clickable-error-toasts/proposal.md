## Why

Error toasts are truncated to one line each (`text1` and `text2`), hiding the actual error message from users. When a GraphQL mutation fails, the toast shows "Network Issue?" or a single line of the error — the user never sees what actually went wrong. There is no way to expand, dismiss, or get more context from a toast.

## What Changes

- Error toasts become clickable: tapping opens a bottom-sheet modal with full error details
- Stack traces are collapsed by default, expandable on long-press
- Modal is dismissible by swipe-down, [Dismiss] button, or backdrop tap
- No retry button (errors without a meaningful retry action won't show one)
- Zero new dependencies — uses existing Jotai, React Native Modal, and react-native-reanimated
- A `showErrorToast()` helper replaces `Toast.show({ type: 'error' })` calls across the app

## Capabilities

### New Capabilities
- `error-toasts`: Error Toast Interaction — when an error toast is shown, the user shall be able to tap it to view the full error message in a modal; the modal shall be dismissible by swipe, button, or backdrop tap; stack traces shall be collapsed by default and expandable on long-press

## Impact

- New files:
  - `src/atoms/errorAtom.js` — Jotai atom for error context
  - `src/components/ErrorDetailModal/index.js` — bottom-sheet modal component
  - `src/utils/showErrorToast.js` — helper replacing error Toast.show calls
- Modified:
  - `app/_layout.tsx` — wire in `<ErrorDetailModal />` and `Toast.config()`
  - ~30-40 `Toast.show({ type: 'error' })` calls across `src/hooks/`, `src/components/`, `src/screens/`, `app/`
- No new dependencies
- No API or GraphQL changes
