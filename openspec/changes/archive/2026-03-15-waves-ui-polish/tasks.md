## 1. Background Fix

- [x] 1.1 In `src/screens/WavesHub/index.js`, change the container style from `theme.INTERACTIVE_BACKGROUND` to `theme.BACKGROUND`

## 2. Header Nav Bar Button Count

- [x] 2.1 Verify the auto-group button in the upper-right nav bar of `app/(drawer)/waves.tsx` shows the ungrouped photo count badge and refreshes on mount and after auto-group
- [x] 2.2 Verify the same behavior in `app/(drawer)/waves-hub.tsx`

## 3. Auto-Group Count in Confirmation Dialog

- [x] 3.1 Update `src/events/autoGroupBus.js` so `emitAutoGroup` accepts and forwards a count argument to listeners
- [x] 3.2 Update `app/(drawer)/waves.tsx` to pass `ungroupedCount` when calling `emitAutoGroup`
- [x] 3.3 Update `app/(drawer)/waves-hub.tsx` to pass `ungroupedCount` when calling `emitAutoGroup`
- [x] 3.4 Update `handleAutoGroup` in `src/screens/WavesHub/index.js` to accept a count parameter and include it in the Alert dialog text (e.g. "You have 42 ungrouped photos…")

## 4. Drawer Badge

- [x] 4.1 In `app/(drawer)/_layout.tsx`, import `getUngroupedPhotosCount`, `subscribeToAutoGroupDone`, Jotai state, and add ungrouped count fetch in `DrawerLayout`
- [x] 4.2 Add a custom `drawerIcon` for the Waves drawer item with a red badge showing the ungrouped count (matching the header button badge style)

## 5. Verification

- [x] 5.1 Verify dark mode background on WavesHub matches other screens
- [x] 5.2 Verify header nav bar button shows ungrouped count badge
- [x] 5.3 Verify auto-group dialog shows correct count text
- [x] 5.4 Verify drawer badge shows and refreshes after auto-group
