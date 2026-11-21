---
title: 'Android: mark portrait and wifi hardware features optional for Play availability'
type: 'bugfix'
ticket: ''
created: '2026-11-21'
status: 'built'
baseline_revision: 'c457c84d576915d9dcb2915318d949727eb4bef3'
route: 'oneshot'
route_source: 'pinned'
risk: 'medium'
review: 'none'
review_source: 'pinned'
lenses_ran: []
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Google Play refuses the build: "Required hardware feature declarations are restricting your app's availability" — `android.hardware.screen.portrait` and `android.hardware.wifi` are treated as required, blocking Phone, Tablet, Desktop and Android XR installs. Both are *inferred*, not declared: nothing in the repo or any dependency manifest contains a `<uses-feature>` element; portrait comes from the app's own orientation lock, wifi from NetInfo's `WifiManager` usage.

**Approach:** Declare both features explicitly optional in the prebuild-generated Android manifest via a local Expo config plugin registered in `app.config.js`. The app stays portrait-locked and keeps NetInfo; nothing is edited inside `android/`, and no dependency changes.

</frozen-after-approval>

## Implementation Notes

Why these choices, so implementation doesn't re-litigate them:

- **A local config plugin**, not a manifest edit: `android/` is git-ignored prebuild output per `AGENTS.md`, and Expo offers no `features` field in app config. New file `scripts/with-android-optional-features.js` using `withAndroidManifest` from `@expo/config-plugins` (already installed as an Expo dependency; verified resolvable at `node_modules/@expo/config-plugins/build/index.js`). Register it in the `plugins` array of [app.config.js](../app.config.js) — a relative path entry, since no path aliases exist here.
- **Keep the portrait lock.** [`orientation: 'portrait'`](../app.config.js) is what produces `android:screenOrientation="portrait"` on MainActivity; the fix is `<uses-feature android:name="android.hardware.screen.portrait" android:required="false" />`, not unlocking rotation. Do not touch `orientation`.
- **Wifi must be declared, not removed.** [NetInfo's ConnectivityReceiver](../node_modules/@react-native-community/netinfo/android/src/main/java/com/reactnativecommunity/netinfo/ConnectivityReceiver.java) calls `WifiManager` and NetInfo is live in [src/state.js](../src/state.js); the app declares no WIFI permissions, so there is nothing to drop. `required="false"` is honest — NetInfo falls back to `ConnectivityManager`.
- **Idempotent and merge-safe.** Read `modResults.manifest['uses-feature']` (xml2js default `explicitArray: true`, attributes under `$`); append a missing entry or flip an existing one's `android:required` to `'false'`, so repeated prebuilds and other plugins can't re-mark it required. No `tools:replace`: verified no dependency manifest declares either feature, so there is no merge conflict to override — adding the tools namespace for a phantom conflict would be new risk.
- **Two proofs, neither destructive.** A jest test over the pure manifest-mutating helper (real parsed-manifest shape, both features optional after one call, stable after two, existing required entry gets flipped), plus a throwaway node run that pipes the *actual* on-disk `android/app/src/main/AndroidManifest.xml` through the helper and prints the XML — this proves real output without running prebuild, since `npx expo prebuild --clean` rewrites the git-ignored `android/` tree and is the user's call, not mine.
- **Everything build-time stays in `scripts/`.** The testable helper is exported from the plugin module itself (`module.exports` plus a named export) rather than living under `src/utils/`, so nothing dead-code ships in the app bundle. Test goes in `scripts/__tests__/`, which already holds `install-sim-app.test.js`.
- Out of scope: `scripts/gradle-wrapper-properties-plugin.js` is a dead stub that returns `config` unchanged; leave it alone rather than "fixing" it under this goal.

Implementation record (plugin, its registration in `app.config.js`, one test file):

- **Namespace gotcha, caught by the real-manifest proof.** The first draft wrote the attribute as bare `name`, which the XML builder duly emitted as `<uses-feature name="...">` — meaningless to AAPT and Play. Manifest attributes keep their `android:` prefix in the parsed tree, so matching and writing now use `'android:name'`. The unit test alone did not catch this (it asserted against my own wrong key); piping the actual generated manifest through the helper did. The test now pins the namespaced key explicitly.
- **Verified without touching `android/`.** Piping the on-disk [generated manifest](../android/app/src/main/AndroidManifest.xml) through the helper emits `<uses-feature android:name="android.hardware.screen.portrait" android:required="false"/>` and `<uses-feature android:name="android.hardware.wifi" android:required="false"/>`, with `<application>` and `android:screenOrientation="portrait"` intact. `EXPO_NO_TELEMETRY=1 npx expo config --type introspect` exits 0 and lists `./scripts/with-android-optional-features` among the resolved plugins, so prebuild will load it (without telemetry it dies on a sandboxed write to `~/.expo/state.json`, unrelated to this change).
- Suite went 15 → 16 suites, 137 → 138 passing tests; the only failure remains the pre-existing `queueWriteLock.test.js`.

**Simplified on request — supersedes the plugin design above.** The human asked to drop the separate plugin file, its test and the `plugins` registration. Everything now lives in the `mods.android` block that already existed (empty) in `app.config.js`: an inline `manifest` mod, which Expo evaluates after plugins during prebuild. Same logic, same attribute keys, ~20 lines, one changed file. Deleted: `scripts/with-android-optional-features.js`, `scripts/__tests__/androidOptionalFeatures.test.js`. The namespace lesson above still holds and is why the inline version writes `'android:name'`.

## Plan Change Log

- Trigger: human instruction "revert all this complexity and simply update the app.config.js straight". Amended: implementation moved from a local config plugin + jest test to an inline `mods.android.manifest` function in `app.config.js`; plan Verification rewritten to match; review downgraded from `quick` to `none` for a single-file change unless the human asks. KEEP: `'android:name'` (namespaced) attribute keys, idempotent find-or-append, no edits inside `android/`, portrait lock and NetInfo untouched.

## Review Triage Log

## Verification

**Commands (all run, all passing):**
- Throwaway node check that loads `app.config.js`, feeds the real on-disk generated manifest through `expo.mods.android.manifest`, and prints the XML -- expected and observed: `<uses-feature android:name="android.hardware.screen.portrait" android:required="false"/>` plus the same for `android.hardware.wifi`, `android:screenOrientation="portrait"` untouched, and still exactly two `uses-feature` nodes after a second pass (idempotent).
- `EXPO_NO_TELEMETRY=1 npx expo config --type introspect` -- expected and observed: exit 0, config parses with the mod present. Without the env var it dies writing `~/.expo/state.json` under the sandbox, unrelated to this change.
- `HOME="$TMPDIR" npx ts-standard app.config.js` -- expected and observed: only the pre-existing trailing-comma finding at line 50 (inside the untouched `expo-build-properties` block); none on the added lines.

**Manual checks (user-run; builds are out of my reach by policy):**
- `npx expo prebuild --platform android` then grep `android/app/src/main/AndroidManifest.xml` for the two `uses-feature` lines.
- Next Play upload: Pre-launch report no longer lists either feature as required, and availability covers Desktop / Android XR.
