# Tasks: Migrate @expo/vector-icons to @react-native-vector-icons scoped packages

## 1. Preconditions and baseline

- [x] 1.1 Verify `git status` is clean (the codemod hard-requires a clean tree; repo is clean as of `6f93c035` — Phase 3 of `upgrade-to-expo-sdk-57`). If dirty, stop and let the user commit first (no VCS ops by the agent).
- [x] 1.2 Capture baselines in `$TMPDIR`: `npx tsc --noEmit > "$TMPDIR/ts57-baseline.log" 2>&1` (icon-name/type baseline) and `npx ts-standard > "$TMPDIR/ts-standard-baseline.log" 2>&1` (lint baseline). Record counts for later zero-new comparison.

## 2. Run the official codemod (imports + package.json)

- [x] 2.1 Run `npx @react-native-vector-icons/codemod --dynamic` at the repo root (use the npm-cache workaround `export NPM_CONFIG_CACHE="$TMPDIR/npm-cache-wisaw"`; network allowed). Confirm it reports the Expo path, rewrites 61 files, and prints the `material-design-icons` mapping. Do NOT accept its interactive `/static` default — the `--dynamic` flag forces default imports (design D1, OTA).
- [x] 2.2 Review the full import diff across `app/`, `src/`, `src/components/`, `src/screens/`, `src/theme/screenIcons.tsx`: every `import { X } from '@expo/vector-icons'` became per-family default imports (`import Ionicons from '@react-native-vector-icons/ionicons'`, `import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons'`, etc.); local names preserved (none aliased); no `/static` suffix present; no `@expo/vector-icons` references remain in `app/`, `src/`, `components/`, `plugins/`, `scripts/`.
- [x] 2.3 Confirm the codemod's `package.json` rewrite removed `@expo/vector-icons` and added exactly the 6 scoped packages (it writes `^13.1.2` + reformats — both are corrected in task 3.2).

## 3. Manual code + package.json fixes

- [x] 3.1 Edit `app/_layout.tsx`: remove the dead font-loading block — the `useFonts({ ...FontAwesome.font, ...FontAwesome5.font, ...MaterialIcons.font, ...Ionicons.font, ...AntDesign.font })` call, the `fontsLoaded`/`fontError` bindings (verified unconsumed; root render is unconditional), and the now-unused `import { useFonts } from 'expo-font'` line. Keep the `expo-font` **package** and its `app.config.js` plugin (v13 dynamic loading requires it) (design D3).
- [x] 3.2 Normalize `package.json` (design D4): set the 6 new scoped deps to exact `13.1.2` (remove the codemod's `^`), restore the original 2-space formatting and dependency ordering, and confirm `@expo/vector-icons` is gone and no other field changed.

## 4. Install and dependency gates

- [x] 4.1 Run `npm install` to sync `package-lock.json` with the exact pins.
- [x] 4.2 Gate: `npx expo-doctor@latest` passes with no errors and `npx expo install --check` reports dependencies up to date (the 6 scoped packages are not SDK-gated; `@expo/vector-icons` removal must not leave doctor unhappy).

## 5. Lint and type gates

- [x] 5.1 Gate: `npx ts-standard` — zero new errors vs the 1.2 lint baseline (the 61 import-line rewrites + the `_layout` edit must not introduce lint deltas).
- [x] 5.2 Gate: `npx tsc --noEmit` — no new errors vs the 1.2 baseline. Any new error is an upstream icon-name rename/removal the codemod does not fix (design risk): correct the `name` prop to the valid v13 glyph by hand, re-run until clean, and note each rename. **Outcome:** no icon renames, but the gate surfaced that v13 FA5 *requires* an `iconStyle` prop (design D6): all 56 FA5 call sites (+ `screenIcons.tsx` + `EmptyStateCard`) were fixed with the behavior-preserving style resolved from the legacy multi-style set; helper added at `src/utils/fa5IconStyle.js`. tsc + ts-standard both zero-new vs baseline.

## 6. Build gates (both platforms)

- [x] 6.1 Gate: iOS dev-client build succeeds (`build-ios-for-simulator` on Xcode 27 — SDK 57 prebuilts already build here). Confirm icons render on the booted iPhone 17 Pro simulator.
  - Result (2026-08-19): `** BUILD SUCCEEDED **` (Debug-iphonesimulator, Xcode 27 / SDK 27); app installed + launched on booted iPhone 17 Pro sim (PID 54142); device log (`log show`, last 3m) shows **zero** `noSuchGlyph`/font-load warnings — no blank glyphs.
- [ ] 6.2 Gate: Android dev-client build succeeds (`BUILD SUCCESSFUL`; JDK 17 via `export JAVA_HOME="/opt/homebrew/opt/openjdk@17/..."; export JAVA_TOOL_OPTIONS="-Xmx6g -XX:MaxMetaspaceSize=2g"`), installed + launched on the emulator. Confirm icons render.

## 7. Regression and handoff

- [ ] 7.1 Manual regression pass (USER): icons across drawer, waves hub, photo detail + pinch/zoom, friends list/detail, identity/secret, empty states, and all modals; verify in light and dark mode and on cold start (dynamic font loading registers fonts on first icon render).
- [ ] 7.2 Commit (USER, per the Version Control rule in `openspec/config.yaml`): leave the final state uncommitted; suggested message `refactor: migrate @expo/vector-icons to @react-native-vector-icons scoped packages` (scope: the 61 import files, `app/_layout.tsx`, `package.json`, `package-lock.json`, and this change's `tasks.md`).
