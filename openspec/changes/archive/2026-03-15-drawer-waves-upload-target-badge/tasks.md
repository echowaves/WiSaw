## 1. Remove ungrouped count logic from drawer

- [x] 1.1 Remove `getUngroupedPhotosCount` import from `_layout.tsx`
- [x] 1.2 Remove `subscribeToAutoGroupDone` import from `_layout.tsx`
- [x] 1.3 Remove the `ungroupedCount` state, `fetchUngroupedCount` callback, and the `useEffect` that fetches/subscribes in `DrawerLayout`
- [x] 1.4 Remove the `drawerBadgeStyles` StyleSheet at the bottom of `_layout.tsx`

## 2. Add upload target badge and label

- [x] 2.1 Read `uploadTargetWave` atom via `useAtom(STATE.uploadTargetWave)` in `DrawerLayout`
- [x] 2.2 Replace the Waves drawer icon badge with a small filled dot using `CONST.MAIN_COLOR` when `uploadTargetWave` is set
- [x] 2.3 Change the Waves `drawerLabel` to show `Waves — {uploadTargetWave.name}` when set, or `Waves` when null
