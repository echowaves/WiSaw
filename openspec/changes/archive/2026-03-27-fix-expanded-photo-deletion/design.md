## Context

The `Photo` component is rendered inline by `ExpandableThumb` when a photo is expanded in the masonry grid. It currently reads `STATE.photosList` (a global Jotai atom) and filters the deleted photo from it on delete. This works for PhotosList (which owns that atom) but not for WaveDetail (which uses local `useState`).

The previous attempt (approach C: shared `activePhotos` atom) failed because sharing one atom between screens caused stale data from the previous screen to flash before the new screen's fetch completed.

The codebase has no existing React Context usage for state injection, but the pattern fits: each screen owns its own photo list state, and `Photo` just needs a way to say "remove this photo" without knowing which state store it's in.

## Goals / Non-Goals

**Goals:**
- Decouple `Photo`'s deletion handler from `STATE.photosList`
- Expanded-photo deletion in WaveDetail removes the photo from the grid immediately
- Zero changes to intermediate components (ExpandableThumb, PhotosListMasonry)

**Non-Goals:**
- Replacing `STATE.photosList` atom (PhotosList keeps using it as before)
- Changing how collapsed-photo deletion works via QuickActionsModalWrapper (already correct)
- Generalizing the context beyond photo removal

## Decisions

### 1. Use React Context, not prop threading or event bus

**Choice**: Create a `PhotosListContext` that provides `{ removePhoto }`. Each screen wraps its content in a provider. `Photo` consumes the context.

**Alternative — Prop threading**: Thread `onDeleted` through `Photo` → `ExpandableThumb` → `PhotosListMasonry` → screen. Rejected by user as too complex — 4 components gain a new prop for one feature.

**Alternative — Event bus**: `Photo` emits a deletion event, screens subscribe. Rejected: adds indirection for a straightforward parent→child relationship, and the codebase's event buses are used for cross-screen coordination, not intra-screen state.

**Alternative — Shared atom**: Both screens write to one atom. Failed: causes stale data flash when navigating between screens.

**Rationale**: Context is the React-native solution for "provide a value without threading through intermediaries." Only `Photo` needs to consume it, and each screen provides its own implementation.

### 2. Context provides `removePhoto` only

**Choice**: The context value is `{ removePhoto: (photoId) => void }`. This single function handles both deletion and removal-from-wave.

**Rationale**: Both operations have the same UI effect: filter the photo out of the list. The API-level distinction (delete vs remove-from-wave) is handled by `usePhotoActions` before calling `onDeleted`/`onRemovedFromWave`.

### 3. Default no-op context value

**Choice**: Default context value is `{ removePhoto: () => {} }`. If `Photo` renders outside a provider (e.g., standalone photo screen), deletion still works on the server — the list just isn't updated (acceptable since there's no list to update).

## Risks / Trade-offs

- [Trade-off] New pattern in codebase (first React Context for state injection) → Acceptable: it's a standard React pattern, well-understood, and scoped to one context
- [Risk] Future screens using `Photo` forget the provider → Same as today's bug, but now explicit: if there's no provider, the no-op default keeps things safe
