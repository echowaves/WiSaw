# Design: Upgrade to Expo SDK 57

## Context

WiSaw is on Expo SDK 55 / RN 0.83.4 / React 19.2.0, using Expo Router 55 (file-based routing on top of `@react-navigation/*`), `react-native-reanimated` 4.x + `react-native-worklets` (worklets-based animations), EAS Build/Update with dev clients, and continuous native generation (`prebuild` — no checked-in `ios/`/`android/`). See proposal.md for motivation.

Constraints:

- Dependencies are pinned to **exact versions** (project rule); npm.
- The backend repo is out of scope — this is a client-only change.
- SDK 56 is the breaking release (router fork, RN 0.84+0.85, Hermes v1, TS 6); SDK 57 (RN 0.86) is deliberately non-breaking and **fixes the Hermes v1 memory regression** that affects reanimated/worklets apps. Landing below `expo@57.0.9` ships a known memory regression into a production app.
- `expo/fetch` becomes the global fetch in SDK 56; `File.move()`/`copy()` in the new `expo-file-system` API became async in SDK 56; iOS minimum deployment target rises to 16.4; Xcode 26.4 / Node ≥ 20.19.4 become toolchain minimums.

## Goals / Non-Goals

**Goals:**

- Land on `expo@57.0.9+` (RN 0.86.2) with zero user-visible behavior change.
- Keep each hop independently buildable and revertable (two commits/phases).
- Align the full dependency tree to latest compatible versions in exact pins.
- Leave a verified clean state: `expo-doctor` passes, lint passes, dev-client builds on both platforms, manual regression pass done.

**Non-Goals:**

- No migration of `@expo/vector-icons` → `@react-native-vector-icons/*` (deprecated but functional; 61-file mechanical diff — deferred to its own change to keep the SDK-upgrade diff reviewable).
- No migration to the new `expo-media-library` OO API (old API still supported; deferred).
- No adoption of experimental SDK 56 features (Android precompiled headers, Stack v5, Android toolbar, inline modules).
- No TypeScript 6 upgrade (see decision D4).
- No backend changes, no app-feature changes, no app version/bump strategy change (versioning happens at release time, separately).

## Decisions

### D1 — Two-hop upgrade (55 → 56 → 57), one phase per commit

Expo explicitly recommends incremental upgrades so breakages are attributable. Hop 1 absorbs every breaking change; hop 2 is `expo install --fix` only. If hop 1 regresses, revert one commit; hop 2 is trivially re-runnable.

- *Alternative considered:* direct 55 → 57. Rejected: the codemod and doctor output would mix two SDKs' worth of changes, making bisecting a regression much harder.

### D2 — Use the official codemod for the router fork, hand-port only the drawer

`npx expo-codemod sdk-56-expo-router-react-navigation-replace` run against `app/` and `src/` rewrites `@react-navigation/native` and `@react-navigation/core` imports to `expo-router/react-navigation`. The docs confirm `@react-navigation/drawer` has **no drop-in** — only `app/(drawer)/_layout.tsx` uses its components (`DrawerContentScrollView`, `DrawerItemList`); everything else in the codebase uses hooks (`useFocusEffect`, `useNavigation`, `useIsFocused`), which the codemod handles.

The drawer content is re-implemented as a plain RN component: a themed `ScrollView` + `KeyboardAvoidingView` wrapping the existing `CustomDrawerContent` body, with `DrawerItemList` replaced by a small custom row renderer (the drawer items come from the router's screen list; the existing custom content already renders most of its own rows for theme switching and version info). This is the only non-mechanical code change in the entire upgrade and gets its own review focus.

- *Alternative considered:* keep `@react-navigation/drawer` alongside. Rejected: SDK 56's expo-router no longer depends on react-navigation, so a standalone drawer package would run a second navigation core — unsupported and exactly the pairing `expo-doctor` flags as an error.

### D3 — Await the async `File.move()` calls

`src/screens/PhotosList/upload/photoUploadService.js` calls `src.move(dest)` / `fallbackSrc.move(fallbackDest)` in 4 places without `await`. Under SDK 55's bundled `expo-file-system` this worked (synchronous semantics); under SDK 56+ the new API returns a Promise, so the upload could start before the file is in place. Fix: `await` all 4 call sites (all are already inside `async` functions). This is a correctness fix, not a behavior change — it restores the intended sequence.

### D4 — Pin TypeScript at 5.9.x via `expo.install.exclude`

SDK 56's `expo install --fix` pulls TypeScript 6.0.3. The project's lint toolchain (`ts-standard` 12.0.2, `@typescript-eslint` 8.56, eslint 8.57) is not verified against TS 6, and a broken lint gate would block every subsequent PR. Add `typescript` to the `expo.install.exclude` field in `package.json` and keep 5.9.2. Expo CLI 56/57 fully supports TS 5.x.

- *Alternative considered:* adopt TS 6 now. Rejected: bundling a toolchain migration into an SDK upgrade multiplies risk for zero app benefit; TS 6 becomes its own small change once `ts-standard`/`@typescript-eslint` support is confirmed.

### D5 — Dependency removals (approved via proposal)

- `@react-navigation/drawer`, `@react-navigation/native` — become dead + actively harmful after D2 (bundler error if app code still imports them; doctor error if installed alongside expo-router).
- `react-native-vector-icons` (umbrella, 10.3.0) — imported nowhere; only `@expo/vector-icons` is used (explicitly kept, still published, and required to stay as an explicit dep since SDK 56's `expo` package no longer depends on it).
- `react-native-easy-grid`, `react-timer-mixin` — imported nowhere (verified by codebase search).

### D6 — Native config bumps

- `app.config.js`: `ios.deploymentTarget: '16.4'` (SDK 56 floor; currently commented out) and Android `targetSdkVersion` 35 → 36 (Google Play requires 36 for new updates/submissions as of Aug 2026).
- EAS: profiles without an explicit `image` default to the new Xcode baseline automatically; no `eas.json` change required.
- Native dirs are generated (`prebuild`), so no manual podspec/Gradle surgery; SDK 57's `prebuild` clean-and-regenerate default matches the existing `rm -rf ios/android` build scripts.

### D7 — Exact pins, `expo install --fix` as the version authority

At each hop: `npx expo install expo@<target> --fix` resolves the SDK-gated matrix (all `expo-*`, RN, reanimated, worklets, gesture-handler, screens, vector-icons). Then non-SDK-gated deps are bumped individually to their latest stable, re-pinned exact. `expo-doctor` runs after each hop to catch mismatches.

- *Alternative considered:* `npm update` across the board. Rejected — it does not know the SDK compatibility matrix and will pick incompatible versions for native modules.

### D8 — Verification gates per hop

Gate order: `npm install` → `npx expo-doctor@latest` (clean) → `npx ts-standard` (clean) → `npx expo prebuild` + local dev-client build (iOS simulator + Android) → manual regression pass (drawer nav, deep links incl. app links + `wisaw://`, photo/video capture + upload, OTA update flow, dark mode, QR/friendship flows) → new dev-client build via EAS. A hop is not "done" until all gates pass; each gate is a task in tasks.md.

## Risks / Trade-offs

- [Drawer hand-port breaks drawer UX (theming/spacing regressions)] → The existing `CustomDrawerContent` body is preserved verbatim; only the scroll/list scaffolding is replaced. Regression pass explicitly covers drawer appearance in light/dark.
- [`File.move()` await changes upload timing; a slow move could surface latency users never saw] → The move is of a locally compressed file to the same folder (near-instant); the upload `fetch` already runs after it. Verify with a real device upload test.
- [`expo/fetch` as global fetch changes behavior for the one raw `fetch()` (presigned upload) or Apollo's transport] → Watch the upload flow in the regression pass; documented opt-out `EXPO_PUBLIC_USE_RN_FETCH=1` exists as a one-line escape hatch.
- [Hermes v1 memory regression if someone ships from hop 1] → Hop 1 is dev-client only; no release/preview build is cut between hops. Hop 2 verifies resolved `expo` version ≥ 57.0.9 before any distribution build.
- [TS 5.9 exclusion drifts from what Expo templates ship] → Recorded as a deliberate deviation with an exit condition (lint toolchain supports TS 6); easy to remove later.
- [Transitive native-module incompatibilities (e.g., keyboard-controller, slider, netinfo) on RN 0.85/0.86] → `expo-doctor` + native build at each hop; these packages are actively maintained for current RN.
- [iOS 16.4 floor drops iPhone SE 1st gen / 6s / 7 devices] → Accepted per SDK 56's own floor; no config can keep those devices on SDK 56+.

## Migration Plan

1. **Phase 0 (prep):** verify Node ≥ 20.19.4 and Xcode ≥ 26.4 locally; `git status` clean; tag current state (`v7.5.7-sdk55`).
2. **Phase 1 (hop to SDK 56):** dependency bump + codemod + drawer port + `move()` awaits + config bumps (D2–D6). Run D8 gates. Commit. Dev-client only.
3. **Phase 2 (hop to SDK 57):** `npx expo install expo@^57.0.0 --fix`, verify ≥ 57.0.9, re-run D8 gates, cut new dev-client builds. Commit.
4. **Phase 3 (dependency sweep):** non-SDK-gated bumps in one commit (D7), plus dead-dep removals, plus `openspec/config.yaml` context correction. Re-run doctor + lint + build.
5. **Rollback:** each phase is a single commit — `git revert` returns to the previous phase. OTA (EAS Update) is unaffected mid-flight because `runtimeVersion` policy is `appVersion` and existing clients keep their native SDK until the next native release. No data migrations; nothing persisted changes format.

## Resolved Questions

- **Vector-icons migration**: decided **immediate follow-up** — captured as its own change `vector-icons-scoped-migration`, scheduled to run right after this change lands (keeps the SDK-upgrade diff reviewable while not deferring the deprecated-package cleanup).
- **iOS 16.4 floor (drops iPhone SE 1st gen / 6s / 7)**: user does not care about this installed base — D6 accepted as-is, no further action.
