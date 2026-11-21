---
title: 'Refresh dependencies to latest compatible within Expo SDK 58'
type: 'chore'
ticket: ''
created: '2026-11-21'
status: 'built'
baseline_revision: '5c280cc0ad7a9942816dffd022b8d7aa0326c048'
route: 'oneshot'
route_source: 'auto'
risk: 'high'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context: ['_bmad-output/plan-dependency-upgrade-expo-sdk-58.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The app has drifted behind since the SDK 58 upgrade on 2026-10-28: all 24 Expo-managed packages sit below what `expo@58.0.26` expects, and several unmanaged deps have newer releases. The user wants everything at the newest version that is genuinely compatible — not a new SDK (58 is still current; RN `latest` is already 0.88.1).

**Approach:** Let `npx expo install --fix` set every Expo-gated package to the SDK 58 expected combo, then take latest for the handful of deps Expo does not gate, including two majors the human approved (jotai 3, async-storage 3). Migrate the one file whose AsyncStorage calls v3 renamed. Record every held-back version rather than silently skipping it.

**Decisions settled by the human:** Expo-pinned native libs stay inside Expo's map — do **not** bump gesture-handler, reanimated, worklets, svg, keyboard-controller, datetimepicker, slider, screens beyond what `--fix` sets, and do not add exclusions for them; `expo install --check` must end green. async-storage goes to 3.1.1 with an `expo.install.exclude` entry. Majors-safe means jotai 3 is in scope. Loose artifact — no initiative.

## Boundaries & Constraints

**Always:** Exact versions except where Expo itself publishes a range (`~58.x`, `~5.11.1`). Grouping settings already on device must still be readable after the async-storage major — v3's default export is a legacy-backed singleton, so no data migration should be needed; prove it rather than assume it. Behaviour preserved: a dependency refresh may not change what the app does.

**Never:** No edits to `../WiSaw.cdk`. No hand-edits in generated `ios/` / `android/`. No `eas build` / `eas update` / deploy. Do not touch vendored `src/zxcvbn.js`. Do not add jest config or `transformIgnorePatterns` as a way to work around a v3 import problem — mock the module at the test instead.

</frozen-after-approval>

## Code Map

- `package.json` — the 28 version bumps + `expo.install.exclude` gains `@react-native-async-storage/async-storage` (existing entries: `typescript`, `react-native`).
- `src/utils/groupingStorage.js` — only consumer of AsyncStorage in the repo. Line 24 `AsyncStorage.multiGet([6 keys])` → v3 `getMany(keys)`, which returns `Record<string, string|null>` instead of `[key, value][]`; the six `result.find(r => r[0] === KEY)` lookups become direct property reads. Line 102 `multiSet([[k, v], …])` → `setMany(entries)` taking a record. Lines 45/46/77/89/117 (`setItem` / `removeItem`) are unchanged in v3.
- `src/utils/__tests__/groupingStorage.test.js` — imports the module above, so it loads the real storage package. v3 ships ESM syntax in a package without `"type": "module"`, and jest's default `transformIgnorePatterns` leaves `node_modules` untransformed → add a `jest.mock('@react-native-async-storage/async-storage', …)` factory returning the methods the module touches.
- `src/state.js`, `src/atoms/errorAtom.js`, `src/utils/groupingAtom.js` — the only files defining atoms (16 total). **Do not change**: repo uses only `atom`, `useAtom`, `useAtomValue`, `useSetAtom`; none of jotai 3's removals (`atomFamily`, `loadable`, `setSelf`, `jotai/babel`, utils subpath) are used.
- `babel.config.js` — **do not change**; no jotai babel plugin is configured.

## Tasks & Acceptance

**Execution:**
- [x] `package.json` -- ran `npx expo install --fix` (with `HOME="$TMPDIR"`), then hand-edited `@apollo/client 4.3.8`, `graphql 17.1.0`, `@typescript-eslint/{eslint-plugin,parser} 8.73.0`, `jotai 3.0.2`, `@react-native-async-storage/async-storage 3.1.1`, `expo-cached-image 58.0.26`, and added the exclude entry -- keeps Expo's sanctioned combo instead of a hand-guessed one.
- [x] `src/utils/groupingStorage.js` -- migrated `multiGet`→`getMany` and `multiSet`→`setMany`, preserving the old-key migration and every returned field.
- [x] `src/utils/__tests__/groupingStorage.test.js` -- mocked the storage package (CommonJS `require` after `jest.mock`, matching `UploadContext.test.js`) and added three `loadGroupingSettings` cases for the new record shape.
- [x] `package.json` + `package-lock.json` -- raised six Expo-gated ranges that `--fix` had installed but not rewritten (see Plan Change Log); lock re-synced.

**Acceptance Criteria:**
- Given a clean checkout, when `npx expo install --check` runs, then it reports no mismatches beyond the three documented exclusions.
- Given grouping settings written by the v2 package, when `loadGroupingSettings()` runs on v3, then the same values (including the `@grouping:granularity` → `@grouping:groupingLevel` migration) come back.
- Given a saved record with a missing key, when `getMany` resolves, then absent keys fall back to defaults exactly as the old `find()` returned `undefined`.
- Given the pre-upgrade baselines, when validation runs, then tsc still shows exactly 3 errors and jest still shows 13/14 suites passing with only the known `queueWriteLock` failure.

## Implementation Notes

Held back on purpose, each needing a reason on record: `react-native-gesture-handler ~3.3.0`, `react-native-reanimated 4.7.1`, `react-native-worklets 0.13.0`, `react-native-svg 15.16.0`, `react-native-keyboard-controller 1.22.7`, `@react-native-community/{datetimepicker,slider}` and `react`/`react-dom 19.3.0` — all pinned by Expo's sdk-58 map at the current values (human decision). `eslint 8.57.1` (`ts-standard@12` peers ^8), `typescript 5.9.3`, `@babel/{core,runtime} 7.x` (Babel 8 unsupported by Metro), `@openspacelabs/react-native-zoomable-view 2.4.2` (3.x is beta-only). Unchanged because already latest: netinfo, uuid, lodash, react-qr-code, toast-message, jest/babel-jest, expo-storage, expo-masonry-layout.

Baselines measured at `5c280cc0`: tsc → 3 errors (`JSX` namespace, `appConfig` on unknown, `trackStyle`). `npx jest --watchman=false` → 13/14 suites, 114/115 tests; the one failure is pre-existing in `src/screens/PhotosList/upload/__tests__/queueWriteLock.test.js:100` and is **not** to be fixed here.

### What shipped

Expo's own `--fix` set the SDK 58 combo, then hand-bumped the unmanaged deps. v3's batch methods renamed (`multiGet`→`getMany`, `multiSet`→`setMany`) and `getMany` returns a key→value record with `null` for absent keys instead of `[key, value][]` pairs, so the six `result.find(r => r[0] === KEY)` lookups became direct property reads; `setItem`/`removeItem` are unchanged. v3's default export is `getLegacyStorage()`, whose batch calls delegate to `legacy_multiGet`/`legacy_multiSet`/`legacy_multiRemove` on both Apple and Android, which is what keeps existing device data readable — verified by reading the installed package, not assumed.

The test now mocks the storage package rather than loading it: v3 ships ESM syntax in a package without `"type": "module"`, and Jest's default `transformIgnorePatterns` leaves `node_modules` untransformed (`Must use import to load ES Module`). It follows the existing convention in `src/contexts/__tests__/UploadContext.test.js` of `jest.mock` followed by `require`, which also keeps `import/first` satisfied. Three focused cases cover the new record shape: empty store → defaults, populated store → parsed values, and the legacy `@grouping:granularity` migration.

jotai 3 needed no code change: the repo uses `atom`, `useAtom`, `useAtomValue`, `useSetAtom` and `getDefaultStore()` (`app/_layout.tsx:44`), all still exported in v3 — confirmed against `node_modules/jotai/dist/vanilla.d.ts`.

## Plan Change Log

- 2026-11-21 — Quick-lens review found six Expo-gated packages (`@expo/metro-runtime`, `expo-asset`, `expo-constants`, `expo-file-system`, `expo-font`, `react-native-screens`) still declared below the versions `expo@58.0.26` expects: `--fix` installed the right copies but did not rewrite those manifest ranges, so `--check` stayed green off `node_modules` while a lockless install could resolve to the older floors. Amended: all six declared at the expected range and the lock re-synced. This avoids a manifest that under-declares what was actually validated. KEEP: run `--fix` rather than hand-picking Expo versions, but always diff the manifest afterwards — `--fix` does not guarantee every range is rewritten.

## Review Triage Log

Quick lens (1 pass): 1 patch, 2 false, 1 low-rejected. No high/medium, nothing deferred.

- **`medium` → patched.** Six Expo-gated packages declared below the versions `expo@58.0.26` expects (`@expo/metro-runtime ~58.0.15`, `expo-asset ~58.0.19`, `expo-constants ~58.0.14`, `expo-file-system ~58.0.13`, `expo-font ~58.0.11`, `react-native-screens ~4.30.0`) while `node_modules` held 58.0.17 / 58.0.21 / 58.0.16 / 58.0.14 / 58.0.12 / 4.30.1. Verified by reading each installed `package.json` against the bundled map. Evidence: `validateDependenciesVersions.js` resolves versions from `node_modules`, so `--check` was green while the manifest under-declared. Raised all six and re-synced the lock.
- **false.** "AC2 (v2-written data readable on v3) is assumed, not proven; web path unexamined." Both paths were checked: v3's default export is `getLegacyStorage()` delegating to `legacy_multiGet`/`multiSet`/`multiRemove` in `apple/AsyncStorage.mm` and the Android module, and its web legacy impl uses raw `window.localStorage.getItem(key)` (`createAsyncStorage.js:114`) — byte-identical to v2's `lib/commonjs/AsyncStorage.js:63`, which also used raw keys with no prefix. Same key strings on both platforms.
- **false.** "No `package-lock.json` in the change set." The lock is modified and committed; it was excluded from the review diff for size (1092 lines of churn), not from the change.
- **low → rejected.** The test mock fills absent keys with `null`, matching the legacy singleton actually used, whereas `createAsyncStorage(dbName).getMany` would leave them `undefined`. The app never calls `createAsyncStorage`, and every read is truthiness or `!== 'false'`, so a case for that variant would test an unreachable configuration.
- **low → resolved during finalization.** Plan still showed `status: in-progress`, unchecked tasks and a results-less Verification section at review time. Filled in here; the plan file itself is committed alongside the change.

The lens also independently cleared the riskiest parts of the bump: no other consumer of AsyncStorage exists in the repo or in any installed dependency, and jotai 3 keeps every API used here including `getDefaultStore`.

## Verification

**Commands:**
- `HOME="$TMPDIR" EXPO_NO_TELEMETRY=1 npx expo install --check` -- expected: exit 0, no mismatches.
- `npx tsc --noEmit` -- expected: exactly the 3 baseline errors.
- `npx jest --watchman=false` -- expected: 13/14 suites, only the known queueWriteLock failure.
- `HOME="$TMPDIR" npx ts-standard src/utils/groupingStorage.js src/utils/__tests__/groupingStorage.test.js` -- expected: no new findings vs baseline on those files.
- `HOME="$TMPDIR" EXPO_NO_TELEMETRY=1 CI=1 npx expo config --type prebuild` -- expected: evaluates with the new versions.

**Manual checks:** `npx pod-install` and a simulator run are needed on a real machine (sandbox blocks `~/.expo` and CocoaPods) — async-storage 3 ships new sqlite/room native code, so pods and the Android build must be regenerated before release.

### Verification Results (2026-11-21)

| Check | Result |
|---|---|
| `npx expo install --check` | "Dependencies are up to date", exit 0; only the three documented exclusions skipped |
| `npx tsc --noEmit` | 3 errors, byte-identical to the `5c280cc0` baseline |
| `npx jest --watchman=false` | 13/14 suites, 117/118 tests — same single pre-existing `queueWriteLock` failure as baseline, plus 3 new groupingStorage cases passing |
| `npx ts-standard <changed files>` | exit 0 (the test file's `import/first` finding from mid-run was fixed by switching to the repo's `jest.mock` + `require` convention) |
| `expo export --platform ios --dev` / `--platform android --dev` | Both bundle clean (17 MB dev bundle) — proves Metro resolves the ESM-only jotai 3 and async-storage v3 in the real module graph |
| `npx expo-doctor@latest` | 19/20; the only failure is the CocoaPods version probe, which cannot run under the sandbox's redirected `$HOME` (same as the Oct 28 run) |
