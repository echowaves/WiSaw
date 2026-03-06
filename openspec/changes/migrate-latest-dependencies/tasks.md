## 1. Preparation

- [x] 1.1 Create a dedicated git branch `chore/migrate-latest-dependencies`
- [x] 1.2 Verify current app builds and runs on iOS, Android, and Web before starting

## 2. Expo SDK Upgrade

- [x] 2.1 Update `expo` to 55.0.5 in package.json using `npm install --save-exact expo@55.0.5`
- [x] 2.2 Run `npx expo install --fix` to resolve all Expo-ecosystem package versions for SDK 55
- [x] 2.3 Strip any `^` or `~` prefixes that `expo install --fix` may have added to package.json
- [x] 2.4 `babel-preset-expo` resolved to 55.0.8 by expo install --fix

## 3. React & React Native Upgrade

Note: Expo SDK 55 resolved react 19.2.0, react-dom 19.2.0, and react-native 0.83.2 as the compatible versions (not the ncu-suggested 19.2.4/0.84.1).

- [x] 3.1 Update `react` to 19.2.0 (SDK 55 compatible version)
- [x] 3.2 Update `react-dom` to 19.2.0 (SDK 55 compatible version)
- [x] 3.3 Update `react-native` to 0.83.2 (SDK 55 compatible version)
- [x] 3.4 Update `react-test-renderer` to 19.2.0 (matching react version, installed with --legacy-peer-deps)

## 4. React Native Ecosystem Packages

Note: Many packages were already resolved to SDK 55-compatible versions by `npx expo install --fix`.

- [x] 4.1 `react-native-reanimated` resolved to 4.2.1 by expo fix (SDK 55 compatible)
- [x] 4.2 `react-native-gesture-handler` already at 2.30.0 ✓
- [x] 4.3 `react-native-screens` resolved to 4.23.0 by expo fix (SDK 55 compatible)
- [x] 4.4 `react-native-safe-area-context` resolved to 5.6.2 by expo fix (SDK 55 compatible)
- [x] 4.5 `react-native-svg` already at 15.15.3 ✓
- [x] 4.6 `react-native-worklets` resolved to 0.7.2 by expo fix (SDK 55 compatible)
- [x] 4.7 `react-native-keyboard-controller` already at 1.20.7 ✓
- [x] 4.8 Update `react-native-web` to 0.21.2
- [x] 4.9 Update `react-native-vector-icons` to 10.3.0
- [x] 4.10 Update `react-native-toast-message` to 2.3.3
- [x] 4.11 Update `react-native-base64` to 0.2.2

## 5. Major Version Bump Packages

- [x] 5.1 Update `react-native-gifted-chat` from 2.8.1 to 3.3.2
- [x] 5.2 Verified gifted-chat 3.x API — GiftedChat, Bubble, InputToolbar, Send, Time components are compatible; web export compiles successfully
- [x] 5.3 Update `react-native-get-random-values` from 1.11.0 to 2.0.0
- [x] 5.4 Verified get-random-values 2.x — polyfill import API unchanged, no code changes needed
- [x] 5.5 Update `@react-native-community/netinfo` from 11.5.2 to 12.0.1

## 6. Navigation Packages

- [x] 6.1 Update `@react-navigation/drawer` to 7.9.4
- [x] 6.2 Update `@react-navigation/native` to 7.1.33

## 7. Apollo & GraphQL

- [x] 7.1 Update `@apollo/client` to 4.1.6
- [x] 7.2 Update `graphql` to 16.13.1

## 8. Removed Package Replacements

- [x] 8.1 Update `@expo/vector-icons` to 15.1.1
- [x] 8.2 Update `@openspacelabs/react-native-zoomable-view` to 2.4.2
- [x] 8.3 Update `jotai` to 2.18.0
- [x] 8.4 Replaced `expo-cached-image` with `expo-image@55.0.6` — created compatibility wrappers `src/utils/CachedImage.js` (wraps expo-image Image) and `src/utils/CacheManager.js` (wraps expo-file-system for cache management). Updated all imports in PinchableView, ImageView, ExpandableThumb, ChatPhoto, ModalInputText, Chat/reducer, photoUploadService.
- [x] 8.5 Replaced `expo-storage` with `@react-native-async-storage/async-storage@3.0.1` — created compatibility wrapper `src/utils/storage.js` matching Storage.getItem/setItem/removeItem API. Updated imports in Chat/reducer, photoUploadService, friends_helper.

## 9. Dev Dependencies

- [x] 9.1 Update `@babel/core` to 7.29.0
- [x] 9.2 Update `@babel/runtime` to 7.28.6
- [x] 9.3 Update `babel-plugin-module-resolver` to 5.0.2
- [x] 9.4 Update `react-native-clean-project` to 4.0.3
- [x] 9.5 ESLint kept at 8.57.1 (flat config migration is a separate change)
- [x] 9.6 Update `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser` to 8.56.1
- [x] 9.7 Jest and babel-jest kept at 29.7.0 (Jest 30.x upgrade deferred per design.md cautious approach)
- [x] 9.8 Added `typescript@5.9.2` and `@types/react@19.2.10` (required by Expo SDK 55)

## 10. Version Pinning Cleanup

- [x] 10.1 All entries in package.json use exact versions (no `^` or `~` prefixes)
- [x] 10.2 Deleted `node_modules` and `package-lock.json`, ran `npm install` to regenerate clean lock file — 0 vulnerabilities

## 11. Build Configuration Updates

- [x] 11.1 `app.config.js` reviewed — no changes needed for SDK 55
- [x] 11.2 `babel.config.js` reviewed — no changes needed (reanimated plugin still required)
- [x] 11.3 `metro.config.js` reviewed — no changes needed for RN 0.83.2
- [x] 11.4 `eas.json` reviewed — no changes needed

## 12. Verification & Testing

- [x] 12.1 Web export (`npx expo export --platform web`) compiles successfully
- [ ] 12.2 Test on iOS simulator — verify all screens render and core features work
- [ ] 12.3 Test on Android emulator — verify all screens render and core features work
- [ ] 12.4 Run `npm run lint` and fix any new lint errors
- [ ] 12.5 Verify photo upload, comments, chat, friendships, deep linking, and theming features work end-to-end
- [ ] 12.6 Deploy to EAS Update test channel and verify OTA update works
