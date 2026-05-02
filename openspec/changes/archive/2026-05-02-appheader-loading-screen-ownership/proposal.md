## Why

Three screens (FriendDetail, WaveDetail, BookmarksList) use `AppHeader` but handle loading progress inconsistently. FriendDetail and WaveDetail render `AppHeader` at the **route level** (`Stack.Screen options.header`) while `loading` state lives in the **screen component**, forcing them to render a standalone `LinearProgress` bar in the screen body — disconnected from the header. BookmarksList has no progress bar at all. The root cause is split ownership: the route file owns the header, but the screen owns the state the header needs. Moving header rendering into the screen component fixes the architecture and enables consistent loading feedback.

## What Changes

- **Add `loading` prop to `AppHeader`**: When `true`, renders a `LinearProgress` bar at the bottom of the header, matching the existing `PhotosListHeader` pattern.
- **Move header into FriendDetail screen**: Route file `app/friendships/[friendUuid].tsx` sets `headerShown: false`. `FriendDetail` renders `<AppHeader>` directly with `title`, `rightSlot`, `onBack`, and `loading` props. The frozen/role state, menu ref, and header title logic that currently live in the route file move into the screen.
- **Move header into WaveDetail screen**: Route file `app/(drawer)/waves/[waveUuid].tsx` sets `headerShown: false`. `WaveDetail` renders `<AppHeader>` directly with all props including `loading`. The wave data fetch, frozen/role state, role badge title, and menu button that currently live in the route file move into the screen.
- **Add loading progress to BookmarksList**: Pass `loading` prop to the `<AppHeader>` it already renders directly.
- **Remove standalone LinearProgress** from FriendDetail and WaveDetail screen bodies (replaced by `AppHeader`'s built-in progress bar).

## Capabilities

### New Capabilities
- `appheader-loading`: AppHeader component supports an optional `loading` prop that renders an indeterminate LinearProgress bar below the header content.

### Modified Capabilities
- `friends-loading-progress`: No spec-level requirement change — FriendDetail already shows loading progress. The implementation changes from standalone LinearProgress to AppHeader's built-in loading, but the user-facing behavior is identical.

## Impact

- **Components**: `src/components/AppHeader/index.tsx` — new optional `loading` prop and `LinearProgress` rendering
- **Route files**: `app/friendships/[friendUuid].tsx`, `app/(drawer)/waves/[waveUuid].tsx` — simplified to `headerShown: false` + screen component
- **Screen files**: `src/screens/FriendDetail/index.js`, `src/screens/WaveDetail/index.js` — absorb header rendering, remove standalone `LinearProgress`
- **Screen files**: `src/screens/BookmarksList/index.js` — pass `loading` prop to existing `AppHeader`
- **Dependencies**: None added. `LinearProgress` already exists in the codebase.
