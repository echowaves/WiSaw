# Tasks: Upgrade to Expo SDK 57

## 1. Phase 0 — Prep and toolchain gate

- [x] 1.1 Verify local toolchain: Node ≥ 20.19.4 (`node -v`) and Xcode ≥ 26.4 (`xcodebuild -version`); note any gaps before proceeding
- [x] 1.2 Confirm `git status` is clean and tag the current state as `v7.5.7-sdk55` for rollback reference
- [x] 1.3 Add `expo: { install: { exclude: ["typescript"] } }` support to `package.json` — add the `expo.install.exclude` field with `["typescript"]` so `--fix` keeps TypeScript 5.9.2 (decision D4)

## 2. Phase 1 — Hop to SDK 56 (breaking changes)

- [x] 2.1 Run `npx expo install expo@^56.0.0 --fix` and let it align all SDK-gated packages (RN 0.85, expo-*, reanimated, worklets, gesture-handler, screens, vector-icons); verify `typescript` stayed at 5.9.x
- [x] 2.2 Run `npx expo-codemod sdk-56-expo-router-react-navigation-replace app` and `... src` to repoint `@react-navigation/*` imports to `expo-router` entry points; review the full diff
- [x] 2.3 Hand-port `app/(drawer)/_layout.tsx` drawer content: replace `DrawerContentScrollView`/`DrawerItemList` (from `@react-navigation/drawer`) with a custom themed `ScrollView` + row renderer, preserving the existing `CustomDrawerContent` body (theme switcher, version info)
- [x] 2.4 Remove `@react-navigation/drawer` and `@react-navigation/native` from `package.json` dependencies (decision D5)
- [x] 2.5 Add `await` to the 4 `File.move()` call sites in `src/screens/PhotosList/upload/photoUploadService.js` (image success path, image fallback path, video success path, video fallback path) — decision D3
- [x] 2.6 Update `app.config.js`: set `ios.deploymentTarget: '16.4'` in the `expo-build-properties` plugin config and bump Android `targetSdkVersion` from 35 to 36 (decision D6)
- [x] 2.7 Run `npm install` to regenerate `package-lock.json` with exact pins (no `^`/`~` introduced)
- [x] 2.8 Gate: `npx expo-doctor@latest` passes with no errors — 21/22 checks pass. The 1 remaining failure ("Hermes V1 regressions", expo@56.0.19/RN 0.85) is the known, documented SDK-56 regression this change exists to fix (design.md risk: "Hop 1 is dev-client only; no release/preview build is cut between hops"). Per user decision, accepted on hop 1; will be re-verified green in task 3.2 on SDK 57 (requires expo ≥ 57.0.9 / Hermes 250829098.0.16+)
- [x] 2.9 Gate: `npx ts-standard` passes with no new lint errors
- [x] 2.10 Gate: local dev-client builds succeed — **Android: PASSED** (Gradle `BUILD SUCCESSFUL in 2m 53s`, APK installed on Pixel_5_API_36 emulator, dev-client launch fired; required `JAVA_HOME=/opt/homebrew/opt/openjdk@17` since system default is Java 8). **iOS: TOOLCHAIN-BLOCKED on SDK 56** — Xcode 27.0/Swift 6.4 is newer than SDK 56's prebuilt ExpoModulesCore XCFramework (built with Swift 6.3.1) → 859 cascading module-interface errors, plus expo-modules-jsi 56.x Swift source compile error; not an app-code defect. User decision 2026-08-18: proceed to Phase 2; iOS build re-verified in task 3.2 (SDK 57 prebuilts target the modern toolchain; docs list Xcode 26.4+ minimum for both 56 and 57)
- [ ] 2.11 Gate: manual regression pass on device/simulator — drawer navigation + theming (light/dark), deep links (app links `link.wisaw.com`/`wisaw.com` + `wisaw://` scheme), photo capture + upload (verifies the awaited `move()`), video upload, OTA update install, QR/friendship flows — deferred per user decision; covered by the Phase 2/3 regression passes (3.3, 4.6)
- [ ] 2.12 Commit Phase 1 as a single revertable commit

## 3. Phase 2 — Hop to SDK 57 (the easy hop)

- [x] 3.1 Run `npx expo install expo@^57.0.0 --fix` and verify the resolved `expo` version is ≥ 57.0.9 (Hermes v1 memory-regression fix) and `react-native` is 0.86.2 — resolved expo 57.0.14 (≥ 57.0.9 ✓), react-native 0.86.2 ✓, react 19.2.3, expo-router ~57.0.14, reanimated 4.5.1, worklets 0.10.1, typescript stayed 5.9.2; `expo` pin normalized to `~57.0.14` per repo tilde convention; added `expo-splash-screen` + `expo-status-bar` config plugins (SDK 57 requirement, dynamic config)
- [x] 3.2 Re-run gates: `npx expo-doctor@latest` (21/21 passed, exit 0 — Hermes V1 regression cleared by expo 57.0.14), `npx ts-standard` (675 errors, identical set to hop-1 baseline — zero new; only diff is a pre-existing `app.config.js` comma-dangle shifting 37→40 due to added plugin lines), local dev-client builds: **iOS PASSED** (`build-ios-for-simulator` exit 0 on Xcode 27 — SDK 57 prebuilts build under Swift 6.4 where SDK 56's didn't) and **Android PASSED** (`BUILD SUCCESSFUL in 1m 59s`, APK installed + app running on Pixel_5_API_36; required `JAVA_TOOL_OPTIONS="-Xmx6g -XX:MaxMetaspaceSize=2g"` to clear a KSP Metaspace OOM at RN 0.86's larger dep graph, plus JDK 17)
- [ ] 3.3 Gate: regression pass — focus on memory behavior (reanimated-heavy screens: photo pinch/zoom, waves hub, masonry feed) and startup; confirm no Hermes memory growth — DEFERRED (user decision 2026-08-18): covered by the 4.6 full walk-through on the final SDK-57 + Phase-3 dependency set, avoiding a duplicate manual pass
- [ ] 3.4 Build new dev clients via EAS (`npm run build:ios-for-device`, `npm run build:android-for-device`) and smoke-test the installed dev builds — DEFERRED (user decision 2026-08-18): cut once after Phase 3 lands (Phase 3 bumps native deps, so a Hop-2-only binary would be superseded; one build pair then covers 3.4 + 4.6 smoke test). EAS auth verified working (owner on echowaves)
- [x] 3.5 Commit Phase 2 as a single revertable commit — see git log

## 4. Phase 3 — Dependency sweep and cleanup

- [ ] 4.1 Bump non-SDK-gated dependencies to latest stable with exact pins: `@apollo/client`, `jotai`, `@react-native-async-storage/async-storage`, `@react-native-community/datetimepicker`, `@react-native-community/netinfo`, `@react-native-community/slider`, `react-native-svg`, `react-native-keyboard-controller`, `react-native-safe-area-context`, `react-native-toast-message`, `react-qr-code`, `uuid`, `graphql`, `react-native-get-random-values`, `@openspacelabs/react-native-zoomable-view`
- [ ] 4.2 Remove dead dependencies (decision D5): `react-native-vector-icons` (umbrella — imported nowhere), `react-native-easy-grid`, `react-timer-mixin`; confirm via codebase search that nothing imports them
- [ ] 4.3 Update devDependencies to latest compatible where safe: `@typescript-eslint/*`, `eslint` plugins, `jest`, `babel-*` (keep `ts-standard`/`eslint` versions that still work together; if eslint 9 is required by newer `@typescript-eslint`, defer and note it)
- [ ] 4.4 Correct the stale context block in `openspec/config.yaml` (currently says Expo 54 / RN 0.81.5 / router 6.0.15) to the post-upgrade stack: Expo 57, RN 0.86, React 19.2, expo-router 57, Jotai 2.x, Apollo 4.x
- [ ] 4.5 Run `npm install` and re-run all gates: `npx expo-doctor@latest`, `npx ts-standard`, dev-client builds (iOS + Android)
- [ ] 4.6 Gate: final regression pass — full app walk-through (feed, waves, friends, identity, upload, deep links, dark mode, OTA update)
- [ ] 4.7 Commit Phase 3 as a single revertable commit

## 5. Follow-ups (out of scope)

- [ ] 5.1 **Immediate next change** (scheduled right after this one lands): `vector-icons-scoped-migration` — run `npx @react-native-vector-icons/codemod` to migrate 61 files from `@expo/vector-icons` to the `@react-native-vector-icons/*` scoped packages and remove the deprecated dep
- [ ] 5.2 Record remaining deferred candidates as new changes when picked up: `expo-media-library` new OO API migration, TypeScript 6 adoption (after lint toolchain support confirmed), experimental Android precompiled headers
