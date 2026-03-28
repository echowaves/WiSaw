## 1. Global Network Atom & Listener

- [x] 1.1 Add `export const netAvailable = atom(true)` to `src/state.js`
- [x] 1.2 Add a single `NetInfo.addEventListener` in `app/_layout.tsx` that updates `STATE.netAvailable` via `useSetAtom`, with cleanup on unmount

## 2. Migrate PhotosList to Atom

- [x] 2.1 Replace `useNetworkStatus()` import in `src/screens/PhotosList/index.js` with `useAtom(STATE.netAvailable)` — destructure as `[netAvailable]`
- [x] 2.2 Delete `src/screens/PhotosList/hooks/useNetworkStatus.js`
- [x] 2.3 Add `netAvailable` parameter to `getZeroMoment()` in `src/screens/PhotosList/reducer.js` — return `0` immediately when `false`; update the call site in `PhotosList/index.js` to pass `netAvailable`

## 3. Migrate WaveDetail to Atom

- [x] 3.1 Replace local `netAvailable` state and `NetInfo.addEventListener` effect in `src/screens/WaveDetail/index.js` with `useAtom(STATE.netAvailable)` — remove `NetInfo` import
- [x] 3.2 Add offline card render (using `EmptyStateCard` with `icon='wifi-off'`) when `!netAvailable` in WaveDetail

## 4. Migrate UploadContext to Atom

- [x] 4.1 Replace local `netAvailable` state and `NetInfo.addEventListener` effect in `src/contexts/UploadContext.js` with `useAtom(STATE.netAvailable)` — remove `NetInfo` import

## 5. Add Offline Cards to Remaining Screens

- [x] 5.1 Add offline guard to `src/screens/Chat/index.js` — read `STATE.netAvailable`, render `EmptyStateCard` when offline
- [x] 5.2 Add offline guard to `src/screens/WavesHub/index.js` — read `STATE.netAvailable`, render `EmptyStateCard` when offline
- [x] 5.3 Add offline guard to `src/screens/FriendsList/index.js` — read `STATE.netAvailable`, render `EmptyStateCard` when offline
- [x] 5.4 Add offline guard to `src/screens/Secret/index.js` — read `STATE.netAvailable`, render `EmptyStateCard` when offline
- [x] 5.5 Add offline guard to `src/screens/Feedback/index.js` — read `STATE.netAvailable`, render `EmptyStateCard` when offline
- [x] 5.6 Add offline guard to `src/screens/PhotosDetailsShared/index.js` — read `STATE.netAvailable`, render `EmptyStateCard` when offline
- [x] 5.7 Add offline guard to `src/screens/PhotoSelectionMode/index.js` — read `STATE.netAvailable`, render `EmptyStateCard` when offline
- [x] 5.8 Add offline guard to `app/(drawer)/(tabs)/confirm-friendship/[friendshipUuid].tsx` — read `STATE.netAvailable`, render `EmptyStateCard` when offline

## 6. Disable Drawer Items When Offline

- [x] 6.1 In `app/(drawer)/_layout.tsx`, read `STATE.netAvailable` in `DrawerLayout` and apply `opacity: 0.4` + navigation prevention via `listeners` on Identity, Friends, Waves, and Feedback drawer screens when offline
