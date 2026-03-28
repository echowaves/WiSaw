## Context

Network connectivity is tracked independently in three places: `PhotosList` (via `useNetworkStatus` hook), `WaveDetail` (local `NetInfo.addEventListener`), and `UploadContext` (local `NetInfo.addEventListener`). Most screens have no network awareness and crash or show raw errors when offline. The app already uses Jotai atoms for global state (`uuid`, `locationAtom`, `isDarkMode`, etc.) and follows the pattern of setting atoms from the root layout (e.g., `useLocationProvider` in `_layout.tsx`).

## Goals / Non-Goals

**Goals:**
- Single source of truth for network state via a Jotai atom
- Every screen that makes network calls shows an in-place offline card when disconnected
- Drawer items are visually disabled when offline to discourage navigation
- Codify the offline-guard pattern as a spec so future screens must comply
- Guard `getZeroMoment()` to avoid console errors on cold start without network

**Non-Goals:**
- Offline data caching or offline-first architecture
- Queuing non-upload operations for replay when back online
- Changing existing upload queue behavior (already handles offline correctly)

## Decisions

**1. Jotai atom over React Context for network state**

Add `export const netAvailable = atom(true)` to `src/state.js`. A single `NetInfo.addEventListener` in `app/_layout.tsx` calls `useSetAtom(STATE.netAvailable)`. All screens read with `useAtom(STATE.netAvailable)`.

*Why atom:* Matches existing patterns (location, dark mode). No new provider needed. Any component anywhere in the tree can read it with zero prop drilling.

*Alternative considered:* Dedicated `NetworkProvider` context — rejected because it adds a provider wrapper and the app already has the Jotai atom pattern established.

**2. Default `true` for initial atom value**

`NetInfo.addEventListener` fires immediately on subscribe with current state. Defaulting to `true` avoids a flash of offline UI on startup before the first callback arrives. If the device is actually offline, the callback corrects it within milliseconds.

*Alternative considered:* Default `false` (safe-by-default) — rejected because it would show an offline flash on every app start.

**3. Reuse existing `EmptyStateCard` for offline screens**

PhotosList already uses `EmptyStateCard` with `icon='wifi-off'` for its offline state. All other screens will use the same component with screen-appropriate subtitles. This maintains visual consistency.

*Alternative considered:* Dedicated `OfflineGuard` wrapper component — rejected as over-engineering for what is a simple conditional render per screen.

**4. Disable drawer items via `drawerItemStyle` opacity + listener interception**

In `DrawerLayout`, read `STATE.netAvailable`. For non-home items, apply `opacity: 0.4` and intercept navigation with `listeners` prop returning `{ drawerItemPress: (e) => { e.preventDefault() } }` when offline.

*Alternative considered:* Hiding drawer items entirely — rejected because it's confusing UX (items appear/disappear). Greying out communicates "temporarily unavailable" clearly.

**5. Delete `useNetworkStatus.js` hook**

After migrating PhotosList to the atom, the hook file has no consumers. Delete it to avoid dead code.

**6. UploadContext reads atom, but keeps its own `netAvailable` local state fed by atom**

UploadContext currently uses `netAvailable` in `useEffect` dependencies and callbacks. It will read the atom via `useAtom` and use the value directly, replacing its local `useState` + `NetInfo.addEventListener`. The atom update flow is: root layout listener → atom → UploadContext re-render.

## Risks / Trade-offs

- [Risk: Atom update lag] The NetInfo callback fires ~0-50ms after actual connectivity change. → Acceptable; same latency as current local listeners.
- [Risk: Drawer item disabling may not block programmatic navigation] `router.push('/waves')` from code would still navigate. → Mitigated: offline cards on each destination screen catch this case.
- [Risk: Large number of screens to touch] 8+ screens need offline cards. → Each change is mechanical (read atom, wrap render in conditional). Low complexity per screen.
