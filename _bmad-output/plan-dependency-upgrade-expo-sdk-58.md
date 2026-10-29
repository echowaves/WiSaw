---
title: 'Upgrade dependencies to the latest compatible versions (Expo SDK 58)'
type: 'chore'
ticket: ''
created: '2026-10-28'
status: 'built'
baseline_revision: '52a9bfe016a8258818b07e97f93b23825d4fb87f'
route: 'oneshot'
route_source: 'pinned'
risk: 'high'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The app sits on Expo SDK 57 / React Native 0.86 with a large set of dependencies behind current. The user asked for the latest compatible versions of everything, with Expo itself moved to the newest release.

**Approach:** Treat the *published* `expo@58.0.21` package's own `bundledNativeModules.json` as the source of truth for every Expo-managed dependency (Expo Router, React, React Native, gesture-handler, reanimated, worklets, screens, svg, web, keyboard-controller), then take the latest non-breaking release of everything else. Fix what the majors break in app code, keep validation equal to the pre-upgrade baseline, and record every held-back major instead of silently skipping it.

**Decisions settled by the agent (autopilot):** stay on the existing major lines where a major bump is not required by the SDK (TypeScript 5 → 5.9.3, ESLint 8 because `ts-standard@12` requires it, Jotai 2, Babel 7, `@openspacelabs/react-native-zoomable-view` 2 — its 3.x line is beta-only); adopt the majors Expo explicitly asks for (gesture-handler 3, Reanimated 4.7, worklets 0.13, Jest 30); keep `version`/`buildNumber` at the values already committed (`7.6.0` / `742`) since the human bumps those per release.

## Boundaries & Constraints

**Always:** Exact dependency versions (no `^`/`~` beyond what Expo itself publishes for a package, e.g. `~58.0.21`); max cyclomatic complexity 8; behaviour preserved — an SDK bump may not change what the app does.

**Never:** No edits to `/Users/dmitry/hacks/wisaw/Wisaw.cdk` (backend). No hand-edits in the generated `ios/` / `android/` folders. `.env` stays uncommitted, no secrets in code.

## Code Map

| File | Why it changes |
|---|---|
| [package.json](../package.json) | 65 dependency bumps; `expo.install.exclude` gains `react-native` |
| [app.config.js](../app.config.js) | Android compile SDK / build tools follow RN 0.88; obsolete scene-lifecycle plugin dropped |
| [app/_layout.tsx](../app/_layout.tsx) | `expo-status-bar` replaces the RN `StatusBar`; root `Stack` needs an `id` |
| [app/(drawer)/_layout.tsx](../app/(drawer)/_layout.tsx), [app/(drawer)/(tabs)/_layout.tsx](../app/(drawer)/(tabs)/_layout.tsx), [app/(drawer)/waves/_layout.tsx](../app/(drawer)/waves/_layout.tsx), [app/friendships/_layout.tsx](../app/friendships/_layout.tsx) | Navigators need an explicit `id` in expo-router 58 |
| [scripts/fix-gradle-version.js](../scripts/fix-gradle-version.js) | Default Gradle 8.13 → 9.4.1 (RN 0.88 ships AGP 9.2.1) |
| plugins/with-ios-scene-lifecycle/ | Deleted — SDK 58's template adopts the UIKit scene lifecycle itself |

## Tasks & Acceptance

- [x] Expo moved to the newest release and every `expo-*` package aligned to it. **Done when:** `npx expo install --check` reports no mismatches other than the documented `react-native` exclusion.
- [x] Non-Expo dependencies at their latest compatible release. **Done when:** each is either at `npm view <pkg> version` or recorded below as a deliberate hold.
- [x] TypeScript errors equal to the pre-upgrade baseline. **Done when:** `npx tsc --noEmit` shows only the three errors that already existed on SDK 57.
- [x] Lint unchanged. **Done when:** per-file ts-standard counts match baseline on every touched file.
- [x] Config and bundle pipeline still work. **Done when:** `expo config --type prebuild`, `expo prebuild -p ios --no-install` and a Metro export for iOS **and** Android all succeed.

## Implementation Notes

### What shipped

**Expo platform (from `expo@58.0.21`'s own bundled map):** `expo ~58.0.21`, `expo-router ~58.0.28`, `react-native 0.88.1`, `react`/`react-dom 19.3.0`, `@expo/metro-runtime ~58.0.15`, `babel-preset-expo ~58.0.0`, and all 26 `expo-*` modules at their SDK 58 versions. The three echowaves-maintained packages (`expo-cached-image`, `expo-storage`, `expo-masonry-layout`) got `58.0.0` releases on the morning of the upgrade, so no peer-dependency override was needed.

**Majors the SDK asks for:** `react-native-gesture-handler ~3.3.0`, `react-native-reanimated 4.7.1`, `react-native-worklets 0.13.0`, `react-native-screens ~4.30.0`, `react-native-safe-area-context ~5.10.1`, `react-native-svg 15.16.0`, `react-native-web ~0.21.4`, `react-native-keyboard-controller 1.22.7`, `react-native-get-random-values 2.1.0`, `jest`/`babel-jest 30.5.2`.

**Latest compatible app-level bumps:** `@apollo/client 4.3.5`, `@react-native-vector-icons/* 14.0.0`, `@types/react ~19.3.0`, `jotai 2.20.3`, `lodash 4.18.1`, `react-native-toast-message 2.5.2`, `typescript 5.9.3`, `uuid 14.0.3`, `@babel/runtime 7.29.10`, `@typescript-eslint/* 8.72.1`, `eslint-plugin-n 18.5.0`.

**Code fixes the upgrade forced:**
- RN 0.88 makes edge-to-edge mandatory and drops `backgroundColor` / `translucent` from `StatusBar`. The root layout now uses `<StatusBar style={…} />` from `expo-status-bar`, which is Expo's recommended API and only exposes content style.
- expo-router 58 types require an explicit `id` on every navigator: `root`, `drawer`, `tabs`, `waves`, `friendships`.

**Native config:** Android `compileSdkVersion` 36 → 37 and `buildToolsVersion` 37.0.0 (RN 0.88's version catalog); `targetSdkVersion` stays 36, RN's own target. iOS deployment target 16.4 is above RN 0.88's minimum (15.1) and matches the `expo-build-properties` default, so it stays.

**Deleted:** `plugins/with-ios-scene-lifecycle`. Its header says to remove it once Expo ships a scene-based template — SDK 58 does exactly that (the generated `AppDelegate.swift` starts React Native from `SceneDelegate`, and `Info.plist` carries `UIApplicationSceneManifest`). Left in place its strict anchors would have thrown during `expo prebuild -p ios`; verified by generating an SDK 58 project and reading the output.

### Decision log (deviations from the plan above)

- **`react-native 0.88.1` kept, and added to `expo.install.exclude`.** Expo's remote "expected versions" endpoint still says 0.88.0 (published 2026-10-27 lag), while the installed `expo@58.0.21` bundle map and the `sdk-58` branch both say 0.88.1. Excluding it mirrors the existing `typescript` exclusion and stops `npx expo install --fix` from silently downgrading the patch. **Remove this entry on the next SDK bump** so real drift is validated again.
- **Majors deliberately held:** `@babel/core 7.29.7` (Babel 8 is not yet supported by Metro/Expo), `eslint 8.57.1` (`ts-standard@12` peers on eslint ^8), `typescript 5.9.3` (SDK map suggests ~6/7, but that is a compiler major with real blast radius and the project already excludes `typescript` from Expo's validation), `jotai 2.20.3` (v3 is a major rewrite of store APIs), `@openspacelabs/react-native-zoomable-view 2.4.2` (only 3.x prereleases exist).
- **Android Gradle script kept but repointed.** `scripts/fix-gradle-version.js` pinned Gradle 8.13 "for Java 11", which would have downgraded the SDK 58 template's Gradle 9.4.1 and broken AGP 9.2.1. The default is now 9.4.1; the call site in `build-android-for-simulator` is unchanged, so it can still be dropped entirely once nobody relies on the override.

## Plan Change Log

- 2026-10-28 — Created and executed in one pass (autopilot). No plan-level scope change after implementation; the only surprises were discovered during verification and are recorded above (RN patch expectation, scene-lifecycle plugin now redundant).

## Verification Results (2026-10-28)

| Check | Command | Result |
|---|---|---|
| Types | `npx tsc --noEmit` | 3 errors, byte-identical to the SDK 57 baseline (`JSX` namespace, `appConfig` on `unknown`, `trackStyle`) — all six upgrade-induced errors fixed |
| Lint | `npx ts-standard <changed files>` | Same counts as baseline (25 in `app/_layout.tsx`, pre-existing style noise only) |
| Deps | `expo-doctor@latest` | 19/20; the one failure is CocoaPods, which only fails because the sandbox redirects `$HOME` (`pod --version` crashes on rubygems config there — 1.17.0 is installed) |
| Config | `npx expo config --type prebuild` | Evaluates; shows compileSdk 37 / buildTools 37.0.0 / deploymentTarget 16.4 |
| Native gen | `npx expo prebuild -p ios --no-install` | Succeeds; generated AppDelegate is scene-based, `UIApplicationSceneManifest` present (original `ios/` restored afterwards) |
| Bundle | `npx expo export --platform ios --dev` and `--platform android --dev` | Both bundle clean (17 MB dev bundles) |

**Still to do on a real machine (cannot run in the sandbox):** `npx pod-install` and device/simulator runs for both platforms, an EAS build to confirm the Android image carries SDK 37 / build tools 37, and a release smoke test of deep links (`wisaw://`, `applinks:`) now that Expo's own `SceneDelegate` replaces the deleted plugin.
