## 1. Keep QuickActionsModal Always Mounted

- [x] 1.1 Remove the `if (!visible || !photo) return null` guard from `QuickActionsModal/index.js`; always render the `<Modal>` with `visible` prop controlling show/hide
- [x] 1.2 Guard internal logic (`useEffect` fetch, styles creation) on `visible && photo` so no side effects run when hidden

## 2. Isolate Long-Press State from PhotosList Re-renders

- [x] 2.1 Create a `QuickActionsModalWrapper` component inside `PhotosList/index.js` that owns `longPressPhoto` state and renders `QuickActionsModal`; expose `setLongPressPhoto` via ref for the long-press handler
- [x] 2.2 Replace inline `longPressPhoto` state and `QuickActionsModal` rendering in both PhotosList return paths with the wrapper component
- [x] 2.3 Update `handlePhotoLongPress` to call the wrapper's setter via ref instead of local state

## 3. Defer Data Fetch

- [x] 3.1 Wrap the `getPhotoDetails` call in `InteractionManager.runAfterInteractions` so the modal thumbnail and spinner paint before the fetch begins
