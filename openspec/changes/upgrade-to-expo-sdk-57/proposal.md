# Upgrade to Expo SDK 57

## Why

The app is on Expo SDK 55 (RN 0.83). SDK 56 is the significant breaking release (expo-router forks from `@react-navigation/*`, RN 0.85/Hermes v1, TS 6) and SDK 57 (RN 0.86) is required to fix the Hermes v1 memory regression that specifically affects apps importing `react-native-reanimated`/`react-native-worklets` — which this app does. Upgrading now keeps the app inside the supported SDK maintenance window and lands on a fixed release (`expo@57.0.9+`).

## What Changes

- **Incremental SDK upgrade in two hops**: 55 → 56 (breaking changes absorbed here), then 56 → 57 (designed to be non-breaking). Each hop is an independently revertable commit.
- **Hop 1 (SDK 56) code migration**:
  - Run the official codemod to repoint `@react-navigation/*` imports to `expo-router` entry points (`npx expo-codemod sdk-56-expo-router-react-navigation-replace` against `app/` and `src/`).
  - **BREAKING (internal)**: hand-port the drawer content in `app/(drawer)/_layout.tsx` — `DrawerContentScrollView`/`DrawerItemList` from `@react-navigation/drawer` have no drop-in; replace with a custom content component.
  - **BREAKING (internal)**: `File.move()` in the new `expo-file-system` API is now async — add missing `await`s in `src/screens/PhotosList/upload/photoUploadService.js` (4 call sites) so uploads don't race the file move.
- **Hop 2 (SDK 57)**: dependency alignment only; verify `expo@>=57.0.9` / RN `0.86.2` (Hermes memory-regression fix) is the resolved version.
- **Dependency sweep**: run `npx expo install --fix` at each hop to align all SDK-gated packages (expo-*, reanimated 4.5, worklets 0.10, gesture-handler 2.32, screens, typescript) to latest SDK-compatible versions; then bump non-SDK-gated deps (`@apollo/client`, `jotai`, `@react-native-community/*`, `react-native-svg`, `react-native-keyboard-controller`, `react-native-toast-message`, `react-qr-code`, `uuid`, `graphql`, etc.) to their latest versions. All pins stay exact (no `^`/`~`), per project rule.
- **Remove dependencies** (requires approval per project rules):
  - `@react-navigation/drawer`, `@react-navigation/native` — replaced by the codemod (SDK 56 forbids app-code imports of `@react-navigation/*`).
  - `react-native-easy-grid`, `react-timer-mixin` — imported nowhere (dead deps).
  - `react-native-vector-icons` (umbrella) — imported nowhere; only `@expo/vector-icons` is used.
- **Config updates**: `app.config.js` — set `ios.deploymentTarget: '16.4'` (SDK 56 minimum), bump Android `targetSdkVersion` 35 → 36 (Play Store requirement). `openspec/config.yaml` context block is stale (says Expo 54 / RN 0.81.5 / router 6.0.15) — correct it to the post-upgrade stack.
- **Toolchain requirements**: Node ≥ 20.19.4, Xcode ≥ 26.4 for local iOS builds; EAS profiles without an explicit `image` default to Xcode 26.4. New dev-client builds required after each hop.
- **TypeScript**: keep `typescript` at 5.9.x by adding it to `expo.install.exclude` — the `ts-standard`/`@typescript-eslint` 8.x lint toolchain is not verified against TS 6; TS 6 adoption becomes a separate, deliberate change. (Open decision — see design.md.)

## Capabilities

### New Capabilities

(none — no new user-facing features introduced)

### Modified Capabilities

(none — user-facing behavior is unchanged: navigation, deep links, drawer, and photo upload keep the same observable behavior; the `move()` await fixes restore the originally intended upload behavior. This is a tooling/dependency change, so `skip_specs: true` is set in `.openspec.yaml`.)

## Impact

- `package.json` / `package-lock.json` — SDK, RN, and dependency version updates; 5 dependency removals
- `app/(drawer)/_layout.tsx` — drawer content hand-port (only non-mechanical code change)
- `app/tandc-modal.tsx`, `src/screens/Feedback/index.js`, `src/screens/FriendsList/ConfirmFriendship.js`, `src/screens/ModalInputText/index.js`, `src/screens/PhotosList/index.js` — import repoints via codemod
- `src/screens/PhotosList/upload/photoUploadService.js` — 4× `await` on `File.move()`
- `app.config.js` — iOS deployment target, Android targetSdkVersion
- `openspec/config.yaml` — stale context block corrected
- Native projects — `ios/` and `android/` are continuously generated (prebuild); regenerated on next build
- EAS — new development builds per hop; OTA updates unaffected (runtimeVersion policy `appVersion` means a native build ships with the new SDK)
- Out of scope (deferred, candidates for follow-up changes): `@expo/vector-icons` → `@react-native-vector-icons/*` migration (61 files, deprecated-but-functional), `expo-media-library` new OO API migration, experimental Android precompiled headers
