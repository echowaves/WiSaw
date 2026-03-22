## Context

The QuickActionsModal supports 5 photo actions (Report, Delete, Star, Wave, Share). The Delete action already follows a clean callback pattern: on success, it calls `onDeleted(photoId)` which propagates through `QuickActionsModal.onPhotoDeleted` → parent wrapper filters the photo from its list and closes the modal.

Wave actions (remove from wave, move to another wave) update only `photoDetails` local state inside `usePhotoActions` but have no callback to notify the parent. The WaveSelectorModal closes, but the QuickActionsModal stays open and the photo remains in the parent's list.

## Goals / Non-Goals

**Goals:**
- Wave remove and wave move actions close QuickActionsModal immediately (optimistic)
- WaveDetail filters the photo from its list when removed/moved
- Follow the existing `onDeleted` callback pattern for consistency

**Non-Goals:**
- Changing PhotosList behavior (removing from a wave doesn't remove from the main feed)
- Modifying backend mutations (addPhotoToWave auto-removal will be a separate backend fix)
- Adding new event bus patterns (callback prop drilling is the established pattern here)

## Decisions

### 1. New `onRemovedFromWave` callback in `usePhotoActions`

Add an `onRemovedFromWave` parameter alongside existing `onDeleted`. Called optimistically in both `handleWaveRemove` and `handleWaveSelect` before the mutation fires.

**Why optimistic**: Matches `handleDelete` behavior — the modal closes immediately. If the mutation fails, the toast shows an error but the photo is already gone from the list. On next focus, `useFocusEffect` (from `wave-detail-state-refresh`) reloads from API anyway.

**Why not reuse `onDeleted`**: Semantically different — the photo isn't deleted, just removed from this wave. Keeping them separate lets parents handle each case differently if needed.

### 2. Wire through QuickActionsModal as `onPhotoRemovedFromWave` prop

Mirror the existing `onPhotoDeleted` prop pattern. Inside QuickActionsModal, create a `handleRemovedFromWave` callback that calls `onClose()` + `onPhotoRemovedFromWave(photoId)`, then pass it to `usePhotoActions` as `onRemovedFromWave`.

### 3. WaveDetail wires the callback; PhotosList does not

In WaveDetail's `QuickActionsModalWrapper`, pass `onPhotoRemovedFromWave` that filters the photo from `photos` state — identical to `onPhotoDeleted`. PhotosList doesn't pass this prop, so the callback is undefined and no-op.

## Risks / Trade-offs

- [Optimistic removal + mutation failure] → Photo disappears from list but mutation fails. Mitigated by `useFocusEffect` reload on next focus and error toast informing the user.
- [No explicit removePhotoFromWave before addPhotoToWave] → Relies on backend handling the move atomically. Noted as a separate backend fix. If backend doesn't auto-remove, the photo would show in both waves until next focus refresh.
