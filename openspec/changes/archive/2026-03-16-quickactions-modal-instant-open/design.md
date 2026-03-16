## Context

The `QuickActionsModal` was added in the `longpress-quick-actions-modal` change. It works correctly but has a perceivable delay (~200-500ms) between long-press and modal appearance. Two factors contribute:

1. **Parent re-render cost**: `PhotosList/index.js` is an 1800-line component with 72+ hook calls. Setting `longPressPhoto` state re-renders the entire component — masonry layout, all children, all hooks — before the modal can paint.
2. **Mount-from-scratch cost**: The modal uses `if (!visible || !photo) return null`, so the entire component tree (hooks, Modal, Image, PhotoActionButtons, usePhotoActions) is mounted fresh on every open.

## Goals / Non-Goals

**Goals:**
- Eliminate perceivable delay between long-press and modal appearance
- Modal should render within a single frame of the state update
- Keep changes minimal and focused on performance, no behavior changes

**Non-Goals:**
- Refactoring PhotosList into smaller components (that's a larger effort)
- Changing the modal's visual design or functionality
- Optimizing the `getPhotoDetails` network request itself

## Decisions

### Decision 1: Keep QuickActionsModal always mounted

Remove the `if (!visible || !photo) return null` early return. Instead, always render the `<Modal>` component and control visibility via its `visible` prop. When `visible` is `false`, the Modal is hidden by React Native internally — no mount/unmount cycle.

Guard the `useEffect` fetch and internal logic on `visible && photo` as before. The hooks remain active but idle when the modal is hidden, which is negligible cost.

**Why not keep the return-null pattern?** Mounting a component with 10+ hooks, a Modal, an Image, and child components takes measurable time. The RN Modal component is designed to handle show/hide via its `visible` prop efficiently.

### Decision 2: Isolate longPressPhoto state in a wrapper component

Create a small `QuickActionsModalWrapper` component inside `PhotosList/index.js` (not a separate file — it's a simple closure). This wrapper owns the `longPressPhoto` state and renders the `QuickActionsModal`. The wrapper is wrapped in `React.memo` so it doesn't re-render when PhotosList re-renders for unrelated reasons.

Pass `setLongPressPhoto` down to `PhotosListMasonry` via a stable ref or callback. When the user long-presses, only the wrapper re-renders (to update `visible` and `photo` props), not the entire PhotosList.

**Alternative considered: Jotai atom for longPressPhoto.** This would also isolate re-renders, but adding a global atom for transient UI state (which photo is being long-pressed) feels like the wrong abstraction. A local component boundary is cleaner.

### Decision 3: Defer data fetch with InteractionManager

Wrap the `getPhotoDetails` call in `InteractionManager.runAfterInteractions()` so the modal's thumbnail and spinner render first, then the network request begins. This ensures the modal paints in the first frame.

## Risks / Trade-offs

- [Always-mounted hooks run idle] → The `usePhotoActions` hook and other hooks execute on every parent render even when the modal is hidden. The cost is negligible (a few `useCallback` evaluations with no side effects) but is a theoretical concern. Mitigated by the wrapper component isolation — the wrapper itself rarely re-renders.
- [Wrapper component adds indirection] → A small wrapper inside PhotosList adds one level of indirection. Mitigated by keeping it minimal (< 30 lines) and co-located in the same file.
- [InteractionManager timing varies] → `runAfterInteractions` timing depends on the JS thread workload. In practice, it fires within 1-2 frames which is acceptable for a data fetch that shows a spinner anyway.
