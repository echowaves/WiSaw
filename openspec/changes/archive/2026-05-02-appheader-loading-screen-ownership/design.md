## Context

`AppHeader` is a shared header component used by ~15 screens. It accepts `title`, `onBack`, and `rightSlot` props but has no loading/progress support.

Three photo-feed screens need loading progress in the header:
- **FriendDetail** and **WaveDetail** — already show `LinearProgress` but render it in the screen body, disconnected from `AppHeader`, because `AppHeader` is instantiated in the route file (`Stack.Screen options.header`) and cannot access the screen's `loading` state.
- **BookmarksList** — renders `AppHeader` directly in its JSX but has no progress bar at all.

The route files `app/friendships/[friendUuid].tsx` and `app/(drawer)/waves/[waveUuid].tsx` contain screen-level concerns: wave data fetching, frozen/role state, custom title composition, and menu ref wiring. This violates colocation — state and the UI that depends on it should live together.

`PhotosListHeader` (the landing screen header) already implements the loading progress bar pattern: a 3px `LinearProgress` bar rendered conditionally at the bottom of the header when `loading` is true.

## Goals / Non-Goals

**Goals:**
- Add optional `loading` prop to `AppHeader` that renders a `LinearProgress` bar below the header content
- Move header ownership from route files into screen components for FriendDetail and WaveDetail
- Consistent loading feedback across all photo-feed screens that use `AppHeader`
- Thin route files that only handle `headerShown: false` and mount the screen component

**Non-Goals:**
- Changing `PhotosListHeader` — it's a separate component with its own header icons, not an `AppHeader` consumer
- Adding loading to screens that don't have photo feeds (e.g., settings, terms)
- Refactoring the `useImperativeHandle`/ref pattern used by FriendDetail and WaveDetail for menu actions — that stays internal to the screen

## Decisions

### 1. AppHeader renders LinearProgress internally (not as a wrapper/HOC)

The progress bar is part of the header chrome. Rendering it inside `AppHeader` between the bottom border and the content keeps it visually anchored to the header across all screens without each consumer needing to know the layout.

**Alternative considered**: HOC or wrapper component. Rejected — adds indirection for a single optional prop.

### 2. Screen components render their own AppHeader (not route-level header)

Route files switch to `headerShown: false` and let the screen component render `<AppHeader>` in its own JSX. This colocates state and UI:
- The screen owns `loading`, `title` construction, `rightSlot` actions, and the `onBack` handler
- No bridging (atoms, refs, callbacks) needed between route and screen layers

**Alternative considered**: Jotai atom to share `loading` state from screen to route. Rejected — adds coupling and a non-obvious data flow path for a prop that should just be passed directly.

**Alternative considered**: Extending the existing `useImperativeHandle` ref to expose `loading`. Rejected — refs don't trigger re-renders; would require `forceUpdate` or a subscription, making the code fragile.

### 3. WaveDetail absorbs route-level wave data fetch and role state

The route file `[waveUuid].tsx` currently fetches wave data with `getWave()`, manages `frozen`/`role` state, and builds a custom title with snowflake icon and role badge. All of this moves into `WaveDetail`. The route params (`waveName`, `myRole`, `isFrozen`) remain available via `useLocalSearchParams()` inside the screen, so no data is lost.

### 4. Progress bar style matches PhotosListHeader exactly

3px height, `CONST.MAIN_COLOR`, indeterminate mode, `theme.HEADER_BACKGROUND` container — identical to the existing pattern in `PhotosListHeader`, `FriendDetail`, and `WaveDetail`.

## Risks / Trade-offs

- **Route files lose header control** → Mitigated: BookmarksList already follows the screen-owns-header pattern successfully. The 15 other `AppHeader` consumers can migrate incrementally if desired, but this change only moves 2 screens.
- **WaveDetail gets slightly larger** → Acceptable: the added code is ~40 lines of header title construction that already existed in the route file. The screen is the natural owner.
- **Navigation header animations** → Low risk: Expo Router's `Stack.Screen` header transitions may differ slightly when `headerShown: false`. Both FriendDetail and WaveDetail already use custom headers (not default), so the visual change should be negligible.
