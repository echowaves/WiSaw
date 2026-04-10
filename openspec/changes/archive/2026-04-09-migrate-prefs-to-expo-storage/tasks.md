## 1. Fix Platform Import

- [x] 1.1 Add `Platform` to the react-native import in `src/screens/PhotosList/index.js`

## 2. Migrate themeStorage.js

- [x] 2.1 Replace `import * as SecureStore from 'expo-secure-store'` with `import { Storage } from 'expo-storage'` in `src/utils/themeStorage.js`
- [x] 2.2 Convert `saveThemePreference` to use `Storage.setItem({ key: THEME_KEY, value })`
- [x] 2.3 Convert `loadThemePreference` to use `Storage.getItem({ key: THEME_KEY })` and remove `Promise.race` timeout wrapper
- [x] 2.4 Convert `saveFollowSystemPreference` to use `Storage.setItem({ key: FOLLOW_SYSTEM_KEY, value })`
- [x] 2.5 Convert `loadFollowSystemPreference` to use `Storage.getItem({ key: FOLLOW_SYSTEM_KEY })` and remove `Promise.race` timeout wrapper

## 3. Migrate waveStorage.js

- [x] 3.1 Replace `import * as SecureStore from 'expo-secure-store'` with `import { Storage } from 'expo-storage'` in `src/utils/waveStorage.js`
- [x] 3.2 Remove `saveActiveWave`, `loadActiveWave`, and `clearActiveWave` functions (dead code — `activeWave` atom no longer exists in state.js)
- [x] 3.3 Convert `saveWaveSortPreferences` to use `Storage.setItem({ key, value })`
- [x] 3.4 Convert `loadWaveSortPreferences` to use `Storage.getItem({ key })` and remove `Promise.race` timeout wrapper
- [x] 3.5 Convert `saveWaveFeedSortPreferences` to use `Storage.setItem({ key, value })`
- [x] 3.6 Convert `loadWaveFeedSortPreferences` to use `Storage.getItem({ key })` and remove `Promise.race` timeout wrapper
- [x] 3.7 Convert `saveFriendFeedSortPreferences` to use `Storage.setItem({ key, value })`
- [x] 3.8 Convert `loadFriendFeedSortPreferences` to use `Storage.getItem({ key })` and remove `Promise.race` timeout wrapper
- [x] 3.9 Remove `/* global console, setTimeout */` directive (setTimeout no longer used)

## 4. Migrate InteractionHintBanner.js

- [x] 4.1 Replace `import * as SecureStore from 'expo-secure-store'` with `import { Storage } from 'expo-storage'` in `src/components/ui/InteractionHintBanner.js`
- [x] 4.2 Convert `SecureStore.getItemAsync('interactionHintShown')` to `Storage.getItem({ key: 'interactionHintShown' })`
- [x] 4.3 Convert `SecureStore.setItemAsync('interactionHintShown', 'true')` to `Storage.setItem({ key: 'interactionHintShown', value: 'true' })`

## 5. Migrate Secret/index.js (explainer flag only)

- [x] 5.1 Replace `import * as SecureStore from 'expo-secure-store'` with `import { Storage } from 'expo-storage'` in `src/screens/Secret/index.js`
- [x] 5.2 Convert `SecureStore.getItemAsync('identityPrivacyExplainerSeen')` to `Storage.getItem({ key: 'identityPrivacyExplainerSeen' })`
- [x] 5.3 Convert `SecureStore.setItemAsync('identityPrivacyExplainerSeen', 'true')` to `Storage.setItem({ key: 'identityPrivacyExplainerSeen', value: 'true' })`

## 6. Migrate PhotosList/reducer.js (T&C flag only)

- [x] 6.1 Replace `import * as SecureStore from 'expo-secure-store'` with `import { Storage } from 'expo-storage'` in `src/screens/PhotosList/reducer.js`
- [x] 6.2 Convert `getTancAccepted` to use `Storage.getItem({ key: IS_TANDC_ACCEPTED_KEY })`
- [x] 6.3 Convert `acceptTandC` to use `Storage.setItem({ key: IS_TANDC_ACCEPTED_KEY, value: 'true' })`
- [x] 6.4 Remove the `// this is not a password or sensitive info` comment (no longer relevant)

## 7. Remove SecureStore timeouts from identity reads

- [x] 7.1 In `src/screens/Secret/reducer.js` `getStoredNickName()`: remove the `Promise.race` timeout wrapper, call `SecureStore.getItemAsync()` directly
- [x] 7.2 In `src/screens/Secret/reducer.js` `getUUID()`: remove the `Promise.race` timeout wrapper, call `SecureStore.getItemAsync()` directly

## 8. Delete dead ActiveWaveIndicator component

- [x] 8.1 Delete `src/components/ActiveWaveIndicator/index.js`
