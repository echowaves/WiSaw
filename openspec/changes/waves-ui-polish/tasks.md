## 1. Background Fix

- [ ] 1.1 In `src/screens/WavesHub/index.js`, change the container style from `theme.INTERACTIVE_BACKGROUND` to `theme.BACKGROUND`

## 2. Header Nav Bar Button Count

- [ ] 2.1 Verify the auto-group button in the upper-right nav bar of `app/(drawer)/waves.tsx` shows the ungrouped photo count badge and refreshes on mount and after auto-group
- [ ] 2.2 Verify the same behavior in `app/(drawer)/waves-hub.tsx`

## 3. Auto-Group Count in Confirmation Dialog

- [ ] 3.1 Update `src/events/autoGroupBus.js` so `emitAutoGroup` accepts and forwards a count argument to listeners
- [ ] 3.2 Update `app/(drawer)/waves.tsx` to pass `ungroupedCount` when calling `emitAutoGroup`
- [ ] 3.3 Update `app/(drawer)/waves-hub.tsx` to pass `ungroupedCount` when calling `emitAutoGroup`
- [ ] 3.4 Update `handleAutoGroup` in `src/screens/WavesHub/index.js` to accept a count parameter and include it in the Alert dialog text (e.g. "You have 42 ungrouped photos…")

## 4. Drawer Badge

- [ ] 4.1 In `app/(drawer)/_layout.tsx`, import `getUngroupedPhotosCount`, `subscribeToAutoGroupDone`, Jotai state, and add ungrouped count fetch in `DrawerLayout`
- [ ] 4.2 Add a custom `drawerIcon` for the Waves drawer item with a red badge showing the ungrouped count (matching the header button badge style)

## 5. Verification

- [ ] 5.1 Verify dark mode background on WavesHub matches other screens
- [ ] 5.2 Verify header nav bar button shows ungrouped count badge
- [ ] 5.3 Verify auto-group dialog shows correct count text
- [ ] 5.4 Verify drawer badge shows and refreshes after auto-group
