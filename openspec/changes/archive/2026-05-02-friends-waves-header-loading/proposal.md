## Why

FriendsList and WavesHub render a standalone LinearProgress bar inside their screen body, while BookmarksList, FriendDetail, and WaveDetail use `AppHeader loading={loading}` to show the progress bar integrated into the header's bottom edge. This inconsistency exists because FriendsList and WavesHub have their AppHeader rendered at the route level, which lacks access to the screen's loading state. Moving header ownership into these screens aligns them with the established pattern.

## What Changes

- Move AppHeader rendering from `app/(drawer)/friends.tsx` into `src/screens/FriendsList/index.js`, passing `loading={loading}` directly
- Move AppHeader rendering from `app/(drawer)/waves/index.tsx` into `src/screens/WavesHub/index.js`, passing `loading={loading}` directly
- Simplify both route files to just `headerShown: false` + screen component (same pattern as FriendDetail/WaveDetail routes)
- Remove standalone LinearProgress bars from FriendsList and WavesHub screen bodies
- Move sort menu items, action menu state, and header right-slot buttons from routes into their respective screens (FriendsList already has most of this state)

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `friends-loading-progress`: Loading progress bar moves from standalone body position to AppHeader `loading` prop
- `wave-hub`: Loading progress bar moves from standalone body position to AppHeader `loading` prop
- `appheader-loading`: Add FriendsList and WavesHub as screens that use AppHeader's `loading` prop

## Impact

- `app/(drawer)/friends.tsx` — simplified to ~15 lines
- `app/(drawer)/waves/index.tsx` — simplified to ~15 lines
- `src/screens/FriendsList/index.js` — absorbs AppHeader, sort menu items, add-friend button from route
- `src/screens/WavesHub/index.js` — absorbs AppHeader, sort/action menu items, badge from route
- No API, dependency, or state management changes
