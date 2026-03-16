## Why

The QuickActionsModal has a significant delay between the user's long-press and the modal appearing on screen. The root cause is twofold: (1) setting `longPressPhoto` state triggers a full re-render of the 1800-line PhotosList component with 72+ hook evaluations and masonry layout reconciliation, and (2) the modal component is fully unmounted when hidden (`return null`), requiring React to mount the entire component tree from scratch on each open. The modal should appear instantly with a thumbnail preview and loading spinner.

## What Changes

- Keep `QuickActionsModal` always mounted (remove `return null` guard), relying on RN `Modal`'s `visible` prop for show/hide
- Move `longPressPhoto` state into a lightweight wrapper component so setting it doesn't re-render the entire PhotosList
- Use `InteractionManager.runAfterInteractions` to defer the `getPhotoDetails` fetch so the modal renders first

## Capabilities

### New Capabilities

### Modified Capabilities
- `quick-actions-modal`: Modal now stays mounted when hidden and opens instantly without triggering a parent re-render

## Impact

- `src/components/QuickActionsModal/index.js`: Remove early `return null` guard; always render `Modal` with `visible` prop controlling visibility
- `src/screens/PhotosList/index.js`: Extract `longPressPhoto` state and `QuickActionsModal` rendering into a small wrapper component to isolate re-renders from the main list
