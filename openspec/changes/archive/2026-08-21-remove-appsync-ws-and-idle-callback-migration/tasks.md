## 1. Remove the AppSync WebSocket subscription (Option A)

- [x] 1.1 Delete `src/services/appsyncSubscription.js`
- [x] 1.2 In `src/screens/WavesHub/index.js`: remove the `subscribeToPhotoUploadComplete` import and the WS wiring. Note: the WS subscription and the local `subscribeToUploadComplete` bus subscription live in the **same** `useEffect` (not separate effects) — remove the `subscribeToPhotoUploadComplete()` call and `unsubscribeWs()` cleanup from that shared effect, keeping the bus subscription and its cleanup intact.
- [x] 1.3 Verify no remaining references: `grep -rn "appsyncSubscription\|subscribeToPhotoUploadComplete" src/` returns nothing
- [x] 1.4 Confirm no now-unused dependency becomes dead code solely from this removal (`react-native-base64`, `uuid`, `expo-constants` usage elsewhere) — do NOT remove dependencies as part of this change. Verified: `uuid` used in `photoUploadService.js` + `Secret/reducer.js`; `expo-constants` used in `src/consts.js` + `PhotosList/index.js`; `react-native-base64` had no other `src/` importers but the dependency stays (out of scope per task).

## 2. Migrate InteractionManager → requestIdleCallback

- [x] 2.1 In `src/components/Photo/index.js`: replace `const task = InteractionManager.runAfterInteractions(async () => {...})` with `const handle = requestIdleCallback(async () => {...})` (ignore the `IdleDeadline` arg) and replace `task.cancel()` in the effect cleanup with `cancelIdleCallback(handle)`; remove `InteractionManager` from the `react-native` import if it becomes unused. Added `/* global requestIdleCallback:readonly, cancelIdleCallback:readonly */` header (project convention) for the no-undef rule.
- [x] 2.2 In `src/components/QuickActionsModal/index.js`: same migration (`const task = InteractionManager.runAfterInteractions(...)` → `const handle = requestIdleCallback(...)`, `task.cancel()` → `cancelIdleCallback(handle)`) and remove the unused `InteractionManager` import. Same `/* global */` header added.
- [x] 2.3 Verify no remaining usages: `grep -rn "InteractionManager\|runAfterInteractions" src/` returns nothing

## 3. Lint and verification

- [x] 3.1 Run `npm run lint` (ts-standard) and fix any new findings from the edits. Result: no new findings from these edits; the 3 edited files only report pre-existing findings (unused vars / JSX indent in untouched code).
- [x] 3.2 Manual check (dev client, iOS simulator): console no longer shows `[AppSync WS]` lines or the `InteractionManager has been deprecated` warning; remaining iOS 27 noise (status bar, Core Animation, keyboard-controller, PointerUI, CFNetwork) is expected to persist and is out of scope
- [x] 3.3 Manual check: upload a photo on-device → WavesHub waves list and ungrouped count refresh via the local bus
- [x] 3.4 Manual check: quick-actions modal (long-press) and expanded photo view still load photo details after open
