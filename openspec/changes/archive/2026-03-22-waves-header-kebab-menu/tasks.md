## 1. Replace Header Button with Kebab Menu

- [x] 1.1 In `app/(drawer)/waves/index.tsx`, replace the auto-group `TouchableOpacity` and inline badge with a `MaterialCommunityIcons` `dots-vertical` icon button. Add a `showHeaderMenu` function that uses ActionSheetIOS (iOS) / Alert (Android) with options: Cancel, Create New Wave, Auto Group (N ungrouped). Wire "Create New Wave" to call `emitAddWave()` and "Auto Group" to call `emitAutoGroup(ungroupedCount)`. Remove the badge styles.

## 2. Wire WavesHub to AddWave Event

- [x] 2.1 In `src/screens/WavesHub/index.js`, import `subscribeToAddWave` from `src/events/waveAddBus.js`. Add a `useEffect` that subscribes to the `addWave` event and calls `setModalVisible(true)` when received. Return the unsubscribe function for cleanup.
