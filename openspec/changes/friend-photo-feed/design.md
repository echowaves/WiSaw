## Context

`WaveDetail` is a ~550-line screen that fetches paginated photos via `feedForWave` and renders them in `PhotosListMasonry`. It includes wave-specific features (edit wave, merge waves, camera capture, photo removal). The friend photo feed needs the same fetch+render pattern but is simpler — view-only, no camera, no wave-specific modals.

The `feedForFriend` backend query accepts `(uuid, friendUuid, pageNumber, batch, searchTerm, sortBy, sortDirection)` and returns the same `PhotoFeed` type.

## Goals / Non-Goals

**Goals:**
- Create a `FriendDetail` screen that displays a friend's photo feed using `PhotosListMasonry`
- Add `fetchFriendPhotos` reducer following the `fetchWavePhotos` pattern
- Add an Expo Router route with friend name in the header and a kebab menu for friend actions
- Reuse existing components: `PhotosListMasonry`, `usePhotoExpansion`, `AppHeader`, `ActionMenu`

**Non-Goals:**
- Camera/capture functionality on this screen
- Photo feed sorting (Phase 3)
- Changing the friends list navigation (Phase 2)
- Search within the friend feed
- Adding/removing photos from a friend feed

## Decisions

### Decision 1: Route placement under `app/friendships/`

**Choice**: Place the route at `app/friendships/[friendUuid].tsx` using a new stack layout in `app/friendships/_layout.tsx`.

**Rationale**: The `app/friendships/` group already exists (contains `name.tsx` for deep links). A stack layout here keeps friend-related routes grouped together, separate from the drawer tabs. This mirrors how `app/(drawer)/waves/` uses a stack layout for wave routes.

**Alternative considered**: Placing under `app/(drawer)/(tabs)/friend-detail/[friendUuid].tsx` — rejected because friend detail is not a tab and the existing `(tabs)` stack is for screens navigated from within the drawer tabs.

### Decision 2: Follow WaveDetail pattern, strip wave-specific features

**Choice**: Create `FriendDetail` as a new screen that follows the `WaveDetail` data-fetch + render pattern but omits: camera footer (`PhotosListFooter`), wave edit modal, wave merge modal, `QuickActionsModal` for photo removal, upload/deletion bus listeners.

**Rationale**: The core pattern (paginated fetch → `PhotosListMasonry` → expand/collapse) is proven. Stripping wave-specific features gives a clean, focused screen. Features can be added incrementally if needed.

### Decision 3: Kebab menu with friend-specific actions

**Choice**: Expose `showHeaderMenu` via `useImperativeHandle` (same pattern as `WaveDetail`). Menu items: Edit Name, Remove Friend. Actions reuse existing `friends_helper` functions.

**Rationale**: Consistent UX with the wave detail header. The ref-based pattern is already established.

## Risks / Trade-offs

- [Friend may have no photos] → Show an empty state with appropriate messaging. Reuse the empty-state pattern from `WaveDetail`.
- [Navigation back] → `router.back()` will return to wherever the user came from. Phase 2 will make that the friends list.
