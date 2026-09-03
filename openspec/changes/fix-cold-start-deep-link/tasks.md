# Tasks: Fix Cold-Start Deep Link Navigation

## 1. Pre-implementation checks

- [x] 1.1 Read `app/(drawer)/waves/join.tsx` to confirm how it reads `waveUuid`/`inviteToken` (query string vs path params); note whether the redirect targets in design.md D1 will work as-is (resolves design Open Question 1)
- [x] 1.2 Confirm `app/+not-found.tsx` current behavior and that no other code depends on it being hit for valid deep-link URLs

## 2. Trampoline route files (revised 2026-09-03: trampolines, not `<Redirect>` — back must return to home)

- [x] 2.1 Create `app/photos/[photoId].tsx` — trampoline: on mount `dismissAll` → `replace('/')` → `push('/shared/[photoId]')`, yielding stack [home, photo]
- [x] 2.2 Create `app/friends/[friendshipUuid].tsx` — trampoline: on mount `dismissAll` → `replace('/')` → `push('/confirm-friendship/[friendshipUuid]')`
- [x] 2.3 Create `app/wave/join/[waveUuid].tsx` — trampoline: on mount `dismissAll` → `replace('/')` → `push({ pathname: '/waves/join', params: { waveUuid } })`
- [x] 2.4 Create `app/wave/invite/[inviteToken].tsx` — trampoline: on mount `dismissAll` → `replace('/')` → `push({ pathname: '/waves/join', params: { inviteToken } })`
- [x] 2.5 Verify no route-name collisions: `app/photos/`, `app/friends/`, `app/wave/` are new top-level groups distinct from existing `(drawer)/(tabs)/shared`, `(drawer)/friends`, `(drawer)/waves`

## 3. Manual deep-link handler in `app/_layout.tsx` (revised 2026-09-03: removed entirely, not simplified)

- [x] 3.1 Remove `navigateToDeepLink`, `handleDeepLink`, and the deep-link `useEffect` (`getInitialURL` branch AND warm `Linking.addEventListener('url')` subscription) from `app/_layout.tsx`; expo-router's internal `useLinking` drives both cold and warm start through the trampolines
- [x] 3.2 Remove now-unused imports from `app/_layout.tsx`: `Linking`, `router`, `useRootNavigationState`, `useCallback`, `parseDeepLink`, `showErrorToast` default export; drop `hasProcessedInitialUrlRef`/`useRef` if unused
- [ ] 3.3 On a device, verify cold AND warm start both land via the trampolines with no double-navigation (the manual listener is gone, so only expo-router's internal subscription handles `url` events); record the outcome in design.md if anything differs

## 4. Cleanup

- [x] 4.1 Delete `src/utils/linkingHelper.js` entirely (design.md D3) — with the manual handler gone, `parseDeepLink` has no callers; confirm no imports reference it
- [x] 4.2 Delete `src/utils/__tests__/linkingHelper.test.js` (its only import target is the deleted module)
- [x] 4.3 Update `app/+not-found.tsx` comment (and any misleading log text) to reflect that it is now a true catch-all for malformed URLs only

## 5. Verification (iOS + Android, cold + warm)

- [ ] 5.1 iOS cold start: kill app, tap `wisaw.com/photos/<id>` universal link → lands on shared photo detail
- [ ] 5.2 iOS cold start: kill app, tap `wisaw://photos/<id>` custom-scheme link → lands on shared photo detail
- [ ] 5.3 iOS cold start: friendship (`/friends/<uuid>`) and wave (`/wave/join/<uuid>`, `/wave/invite/<token>`) links land on correct screens
- [ ] 5.4 Android cold start: repeat 5.1–5.3 (App Links via https + `wisaw://` custom scheme)
- [ ] 5.5 Warm start (app running, both platforms): all four link types still navigate correctly; verify no double-navigation or duplicate stack entries
- [ ] 5.6 Malformed / unknown deep-link URL still lands on home via `+not-found` (no crash, no blank screen)
- [ ] 5.7 Normal app launch (no deep link) unchanged: opens on home feed
- [ ] 5.9 Back button from any deep-linked screen returns to the landing screen (cold and warm; all four link types)
- [x] 5.8 Run the test suite and the project typecheck; confirm no new errors (note: `linkingHelper.test.js` was deleted in 4.2, so the suite shrank from 46 to 39 tests)
