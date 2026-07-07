## 1. Semver comparison utility

- [x] 1.1 Create `src/utils/semver.ts` with `compareSemver(a: string, b: string): number` function — splits on `.`, compares parts numerically, handles missing parts as 0

## 2. ForceUpdateModal component

- [x] 2.1 Create `src/components/ForceUpdateModal/index.tsx` with blocking full-screen overlay
- [x] 2.2 Modal renders: alert icon, title "Update Required", message text (from prop, falls back to defaults), and button labeled "Reload" or "Update Now" based on trigger type
- [x] 2.3 Build update triggers `Updates.reloadAsync()` to reload EAS Updates JS bundle
- [x] 2.4 Version update opens App Store (iOS) or Google Play (Android)
- [x] 2.6 Dark mode aware — uses existing theme system from `getTheme(isDark)`

## 3. Build check logic in root layout

- [x] 3.1 In `app/_layout.tsx`, import `gqlClient` from `src/consts`, `appConfig`, `compareSemver`, and `ForceUpdateModal`
- [x] 3.2 Add `useEffect` to fetch `appConfig` via `query GetAppConfig { appConfig { minAppBuild minAppVersion message } }` on startup (cold start only)
- [x] 3.3 Read device build number: `Platform.select({ ios: appConfig.expo.ios.buildNumber, android: String(appConfig.expo.android.versionCode) })`
- [x] 3.4 Read device version: `appConfig.expo.version`
- [x] 3.5 Compare device build vs `minAppBuild` (parseInt) and device version vs `minAppVersion` (compareSemver)
- [x] 3.6 Determine which threshold triggered (build only, version only, both)
- [x] 3.7 Set `showForceUpdate` state and `modalMessage` (backend message if non-empty, else fallback based on which threshold)
- [x] 3.8 Render `<ForceUpdateModal>` conditionally in the root layout return JSX

## 4. Error handling and edge cases

- [x] 4.1 Skip check if `netAvailable` atom is false (no network)
- [x] 4.2 Skip check if GraphQL query throws an error
- [x] 4.3 Skip check if `appConfig` returns null
- [x] 4.4 Handle missing `minAppBuild` or `minAppVersion` fields (treat as 0 / "0.0.0")
- [x] 4.5 Ensure modal renders above all other content (absolute positioned overlay with z-index 9999)

## 5. Testing and verification

- [x] 5.1 Verify drawer still shows correct build number (no regression in `app/(drawer)/_layout.tsx`) — no changes to drawer component
- [ ] 5.2 Test on iOS simulator: verify build number comparison works
- [ ] 5.3 Test on Android simulator: verify versionCode comparison works
- [ ] 5.4 Test blocking behavior: modal should prevent interaction with app content
- [ ] 5.5 Test Reload button: verify `Updates.reloadAsync()` reloads EAS bundle
- [ ] 5.6 Test Update Now button: verify App Store / Google Play opens
- [ ] 5.7 Verify dark mode rendering of the modal
- [ ] 5.9 Verify graceful degradation: mock backend failure and confirm app proceeds normally
