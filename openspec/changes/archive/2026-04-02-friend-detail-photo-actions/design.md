## Context

The `FriendDetail` screen renders a friend's photo feed using `PhotosListMasonry` → `ExpandableThumb`, the same component chain as the main `PhotosList`. Both the long-press gesture and the kebab menu (⋮) on thumbnails call the `onPhotoLongPress` callback. In the main feed, this callback opens a `QuickActionsModal` with a photo preview and action buttons. In `FriendDetail`, the callback only fires haptic feedback — a stub left from initial implementation.

## Goals / Non-Goals

**Goals:**
- Make photo long-press and kebab menu in the friend detail feed open the same `QuickActionsModal` as the main feed
- Remove deleted photos from the friend feed list when a photo is deleted via the modal

**Non-Goals:**
- Adding new action buttons or changing what actions are available — `usePhotoActions` already guards actions based on ownership
- Handling `onPhotoRemovedFromWave` — waves are unrelated to the friend feed context

## Decisions

**Decision: Reuse `QuickActionsModalWrapper` via ref pattern**
Follow the exact same pattern used by `PhotosList` and `WaveDetail`: add a `useRef` for `QuickActionsModalWrapper`, call `quickActionsRef.current?.open(photo)` from `handlePhotoLongPress`, and render the wrapper component at the bottom of the JSX tree. This requires no new abstractions — just wiring existing components.

*Alternative considered:* Extracting a shared hook or HOC for "screens with photo actions". Rejected — the wiring is ~5 lines of code and the screens have different enough state management that abstraction adds complexity without meaningful DRY benefit.

**Decision: Wire `onPhotoDeleted` to local state**
When a photo is deleted through the modal, remove it from the local `photos` state array using `setPhotos(prev => prev.filter(p => p.id !== photoId))`. This matches how other screens handle it and avoids a full re-fetch.

## Risks / Trade-offs

**[Risk] Action buttons may show actions the user can't perform on friend's photos** → Mitigated: `usePhotoActions` already checks photo ownership (`photo.uuid === uuid`) and conditionally renders/disables buttons. No additional gating needed.
