## 1. Preparation

- [ ] 1.1 Create a dedicated git branch `chore/migrate-latest-dependencies`
- [ ] 1.2 Verify current app builds and runs on iOS, Android, and Web before starting

## 2. Expo SDK Upgrade

- [ ] 2.1 Update `expo` to 55.0.5 in package.json using `npm install --save-exact expo@55.0.5`
- [ ] 2.2 Run `npx expo install --fix` to resolve all Expo-ecosystem package versions for SDK 55
- [ ] 2.3 Strip any `^` or `~` prefixes that `expo install --fix` may have added to package.json
- [ ] 2.4 Update `babel-preset-expo` to the SDK 55-compatible version using `npm install --save-exact babel-preset-expo@55.0.10`

## 3. React & React Native Upgrade

- [ ] 3.1 Update `react` to 19.2.4 using `npm install --save-exact react@19.2.4`
- [ ] 3.2 Update `react-dom` to 19.2.4 using `npm install --save-exact react-dom@19.2.4`
- [ ] 3.3 Update `react-native` to 0.84.1 using `npm install --save-exact react-native@0.84.1`
- [ ] 3.4 Update `react-test-renderer` to 19.2.4 using `npm install --save-exact react-test-renderer@19.2.4`

## 4. React Native Ecosystem Packages

- [ ] 4.1 Update `react-native-reanimated` to 4.2.2 using `npm install --save-exact react-native-reanimated@4.2.2`
- [ ] 4.2 Update `react-native-gesture-handler` to 2.30.0 using `npm install --save-exact react-native-gesture-handler@2.30.0`
- [ ] 4.3 Update `react-native-screens` to 4.24.0 using `npm install --save-exact react-native-screens@4.24.0`
- [ ] 4.4 Update `react-native-safe-area-context` to 5.7.0 using `npm install --save-exact react-native-safe-area-context@5.7.0`
- [ ] 4.5 Update `react-native-svg` to 15.15.3 using `npm install --save-exact react-native-svg@15.15.3`
- [ ] 4.6 Update `react-native-worklets` to 0.7.4 using `npm install --save-exact react-native-worklets@0.7.4`
- [ ] 4.7 Update `react-native-keyboard-controller` to 1.20.7 using `npm install --save-exact react-native-keyboard-controller@1.20.7`
- [ ] 4.8 Update `react-native-web` to 0.21.2 using `npm install --save-exact react-native-web@0.21.2`
- [ ] 4.9 Update `react-native-vector-icons` to 10.3.0 using `npm install --save-exact react-native-vector-icons@10.3.0`
- [ ] 4.10 Update `react-native-toast-message` to 2.3.3 using `npm install --save-exact react-native-toast-message@2.3.3`
- [ ] 4.11 Update `react-native-base64` to 0.2.2 using `npm install --save-exact react-native-base64@0.2.2`

## 5. Major Version Bump Packages (Breaking Changes Likely)

- [ ] 5.1 Update `react-native-gifted-chat` from 2.8.1 to 3.3.2 using `npm install --save-exact react-native-gifted-chat@3.3.2`
- [ ] 5.2 Review react-native-gifted-chat 3.x changelog and fix breaking API changes in `src/screens/Chat/` components
- [ ] 5.3 Update `react-native-get-random-values` from 1.11.0 to 2.0.0 using `npm install --save-exact react-native-get-random-values@2.0.0`
- [ ] 5.4 Review react-native-get-random-values 2.x changelog and fix any breaking changes in UUID generation code
- [ ] 5.5 Update `@react-native-community/netinfo` from 11.4.1 to 12.0.1 using `npm install --save-exact @react-native-community/netinfo@12.0.1`

## 6. Navigation Packages

- [ ] 6.1 Update `@react-navigation/drawer` to 7.9.4 using `npm install --save-exact @react-navigation/drawer@7.9.4`
- [ ] 6.2 Update `@react-navigation/native` to 7.1.33 using `npm install --save-exact @react-navigation/native@7.1.33`

## 7. Apollo & GraphQL

- [ ] 7.1 Update `@apollo/client` to 4.1.6 using `npm install --save-exact @apollo/client@4.1.6`
- [ ] 7.2 Update `graphql` to 16.13.1 using `npm install --save-exact graphql@16.13.1`

## 8. Other Production Dependencies

- [ ] 8.1 Update `@expo/vector-icons` to 15.1.1 using `npm install --save-exact @expo/vector-icons@15.1.1`
- [ ] 8.2 Update `@openspacelabs/react-native-zoomable-view` to 2.4.2 using `npm install --save-exact @openspacelabs/react-native-zoomable-view@2.4.2`
- [ ] 8.3 Update `jotai` to 2.18.0 using `npm install --save-exact jotai@2.18.0`
- [ ] 8.4 Update `expo-cached-image` — verify SDK 55 compatibility; if no compatible version exists, find alternative or fork
- [ ] 8.5 Update `expo-storage` to 54.0.9 — verify SDK 55 compatibility

## 9. Dev Dependencies

- [ ] 9.1 Update `@babel/core` to 7.29.0 using `npm install --save-exact --save-dev @babel/core@7.29.0`
- [ ] 9.2 Update `@babel/runtime` to 7.28.6 using `npm install --save-exact --save-dev @babel/runtime@7.28.6`
- [ ] 9.3 Update `babel-plugin-module-resolver` to 5.0.2 using `npm install --save-exact --save-dev babel-plugin-module-resolver@5.0.2`
- [ ] 9.4 Update `react-native-clean-project` to 4.0.3 using `npm install --save-exact --save-dev react-native-clean-project@4.0.3`
- [ ] 9.5 Keep ESLint at 8.57.1 — skip ESLint 9+/10 upgrade (separate change needed for flat config migration)
- [ ] 9.6 Update `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser` to latest 8.x compatible with ESLint 8 using `npm install --save-exact --save-dev @typescript-eslint/eslint-plugin@8.56.1 @typescript-eslint/parser@8.56.1`
- [ ] 9.7 Evaluate Jest 30.x upgrade — update `jest` and `babel-jest` to 30.2.0 if compatible, otherwise stay on 29.x

## 10. Version Pinning Cleanup

- [ ] 10.1 Review all entries in package.json and remove any remaining `^` or `~` prefixes
- [ ] 10.2 Delete `node_modules` and `package-lock.json`, then run `npm install` to regenerate a clean lock file

## 11. Build Configuration Updates

- [ ] 11.1 Update `app.config.js` if needed for Expo SDK 55 changes (plugins, permissions, etc.)
- [ ] 11.2 Update `babel.config.js` if needed for new preset/plugin requirements
- [ ] 11.3 Update `metro.config.js` if needed for React Native 0.84 changes
- [ ] 11.4 Update `eas.json` if needed for new SDK build requirements

## 12. Verification & Testing

- [ ] 12.1 Run `npx expo start` and verify the app launches without errors
- [ ] 12.2 Test on iOS simulator — verify all screens render and core features work
- [ ] 12.3 Test on Android emulator — verify all screens render and core features work
- [ ] 12.4 Test on Web — verify web build compiles and basic features work
- [ ] 12.5 Run `npm run lint` and fix any new lint errors
- [ ] 12.6 Verify photo upload, comments, chat, friendships, deep linking, and theming features work end-to-end
- [ ] 12.7 Deploy to EAS Update test channel and verify OTA update works
