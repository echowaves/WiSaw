## Context

FriendsList and WavesHub currently render a standalone LinearProgress bar in their screen body because their AppHeader is rendered at the route level (`friends.tsx`, `waves/index.tsx`), which doesn't have access to the screen's `loading` state. Four other screens (BookmarksList, FriendDetail, WaveDetail, PhotosList) already use the pattern where the screen owns its header and passes loading state directly.

## Goals / Non-Goals

**Goals:**
- FriendsList and WavesHub render their own AppHeader with `loading` prop, matching BookmarksList/FriendDetail/WaveDetail
- Route files simplified to `headerShown: false` + screen component
- Remove standalone LinearProgress from both screen bodies

**Non-Goals:**
- Changing PhotosListHeader (it's a custom header with different layout, not AppHeader-based)
- Modifying AppHeader component itself (already has `loading` prop)
- Changing sort/menu functionality — only moving where code lives

## Decisions

### D1: Screen owns header (same as FriendDetail/WaveDetail)

Move AppHeader rendering from route files into FriendsList and WavesHub components. This is the same pattern applied to FriendDetail and WaveDetail in the `appheader-loading-screen-ownership` change.

**Rationale**: Consistent architecture. The screen has the loading state; the screen renders the header. No state bridging needed.

**Alternatives considered**:
- Jotai atom bridge (screen sets atom, route reads it) — introduces a new pattern unique to these screens, adds complexity
- Absolute-positioned progress bar in screen body — visual hack, fragile

### D2: Absorb route-level UI into screens

FriendsList already has `menuVisible`, `menuFriend`, `ActionMenu`, sort atoms. The route duplicates some of this. WavesHub similarly has `loading`, search, sort state. Move the remaining route-level concerns (header right-slot buttons, sort menu items array, ActionMenu for sort) into the screens.

**Rationale**: FriendsList needs the add-friend button and sort menu from the route. WavesHub needs the dots-vertical button with badge and sort/action menu from the route. Both screens already manage most of the state these UI elements depend on.

### D3: Route files become minimal

Both route files reduce to the pattern:
```tsx
<Stack.Screen options={{ headerShown: false }} />
<ScreenComponent />
```

Same as `friendships/[friendUuid].tsx` and `waves/[waveUuid].tsx` after their refactoring.

## Risks / Trade-offs

- [Minimal risk] FriendsList and WavesHub components grow slightly larger — mitigated by the fact that they already contain most of the state these UI elements depend on, and it removes the split-brain between route and screen.
- [Minimal risk] Event bus imports (`emitAddFriend`, `emitAddWave`) move from route to screen — straightforward, no behavioral change.
