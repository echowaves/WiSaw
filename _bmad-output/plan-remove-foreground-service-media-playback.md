---
title: 'Remove the unused FOREGROUND_SERVICE_MEDIA_PLAYBACK permission from Android'
type: 'chore'
ticket: ''
created: '2026-10-31'
status: 'built'
baseline_revision: 'e7611a86ecb6e25387f9d0b89e996d887e4a764c'
route: 'oneshot'
route_source: 'pinned'
risk: 'medium'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The shipped Android manifest declares `FOREGROUND_SERVICE_MEDIA_PLAYBACK` and registers `expo.modules.audio.service.AudioControlsService` (`foregroundServiceType="mediaPlayback"`), but no code in the app imports `expo-audio`. The permission and service are dead surface: they widen the Google Play foreground-service-type declaration without any feature using them, and they also push `audio` into iOS `UIBackgroundModes`.

**Approach:** Turn off expo-audio's background playback, which is the single switch that injects the permission, the media-playback service, and the iOS audio background mode. Because that same switch also stops injecting the *base* `FOREGROUND_SERVICE` permission — which `expo-location` needs — declare the base permission explicitly in `android.permissions` so location keeps working.

</frozen-after-approval>

## Implementation Notes

Why this is the right cut:

- Both permissions come from one place: `node_modules/expo-audio/plugin/build/withAudio.js`. With `enableBackgroundPlayback` left at its default `true`, the plugin adds `FOREGROUND_SERVICE` + `FOREGROUND_SERVICE_MEDIA_PLAYBACK`, registers `AudioControlsService`, and appends `audio` to `UIBackgroundModes`. Setting it `false` removes exactly that set — including the iOS mode, which turns out to matter; see Implementation Log.
- `RECORD_AUDIO` and `MODIFY_AUDIO_SETTINGS` come from the same plugin but are gated on `recordAudioAndroid` (default `true`), so this change leaves them alone. Correction found in review: they are *not* needed by the current capture path — `src/hooks/useCameraCapture.js:3` records through `expo-image-picker`, i.e. the system camera app with its own permissions, and nothing imports an audio recorder. Keeping them is status-quo preservation inside the requested scope, not a functional requirement; shrinking them is separate deferred work.
- The base `FOREGROUND_SERVICE` stays declared, but not for the reason first assumed. Review showed the shipped path does not need it: `src/hooks/useLocationProvider.js:227` uses `watchPositionAsync`, which runs in-process on Android (`LocationModule.kt:225 watchPositionImplAsync`) with no service, and `LocationTaskConsumer.kt:200-231` only starts `LocationTaskService` for a task registered with the `foregroundService` option — no code here calls `startLocationUpdatesAsync`. It survives because it was in the shipped manifest (injected by expo-audio) and because `expo-location` declares `foregroundServiceType="location"` services that would need it; un-declaring it is extra surface-shrinking this task never asked for. Related gap recorded as deferred work: if a location foreground service is ever started, Android 14+ also requires `FOREGROUND_SERVICE_LOCATION`, which nothing in this project declares (`LocationPermissions.kt` throws `NoPermissionInManifestException` without it).
- Only `expo-audio`'s own Kotlin sources reference `expo.modules.audio`; `expo-video` has no peer dependency on it, so removing the media-session service cannot strand another library.
- `android/` is git-ignored (`.gitignore:75`), and EAS/prebuild regenerate it from `app.config.js`, so the manifest itself is never edited — only the config that produces it.

Deliberate scope limits: `expo-audio` stays a dependency (dropping it would also drop `RECORD_AUDIO`/`MODIFY_AUDIO_SETTINGS` — a separate decision), and no custom config mod is added to strip permissions by name.

## Implementation Log

Files changed — all three edits are in `app.config.js`; nothing else was edited, and `android/` is generated output.

1. `'expo-audio'` → `['expo-audio', { enableBackgroundPlayback: false }]`.
2. Added `'FOREGROUND_SERVICE'` to `android.permissions`.
3. **Deviation from the plan's "iOS untouched" assumption.** While verifying, `src/components/Photo/index.js:116` turned up `allowsPictureInPicture`. AVKit Picture-in-Picture requires `audio` in `UIBackgroundModes`, and that mode was arriving *incidentally* from expo-audio (`withAudio.js`: `enableBackgroundPlayback || enableBackgroundRecording` pushes `'audio'`). `expo-video`'s own plugin would add it, but only when given `supportsPictureInPicture`/`supportsBackgroundPlayback` props, which this app does not pass — so disabling background playback alone would have silently dropped iOS PiP. Fixed by declaring the mode explicitly: `UIBackgroundModes: ['processing', 'audio']`. Net iOS effect is zero; net Android effect is exactly the target permission.

Verification notes (adjustments to the commands above):

- `expo config` has no `--platform` flag; `npx expo config --type introspect --json` applies native mods without writing, but it merges onto the existing native project, so it is weak evidence for a *changed* value. The decisive check was a clean generation: `rm -rf ios && EXPO_NO_TELEMETRY=1 npx expo prebuild -p ios --no-install`, then read `ios/WiSaw/Info.plist` → `UIBackgroundModes = ['processing','audio','fetch']`, the same set as before the change. iOS is provably unchanged. `'fetch'` comes from `expo-task-manager`; `'processing'` is both declared in `app.config.js` and injected by `expo-background-task`, so it was already redundant and stays harmless.
- Correction: `ios/` is **not** tracked — `.gitignore:76` ignores `/ios/` and `git ls-files ios` returns nothing, exactly like `/android/`. So `git status --porcelain ios/` is vacuous, and any claim resting on "the committed Info.plist" is void. Both native folders are generated output; only `app.config.js` carries truth.
- In a sandboxed shell, prebuild and lint need `EXPO_NO_TELEMETRY=1` (else EPERM writing `~/.expo/state.json`) and `HOME=$TMPDIR/fakehome npx ts-standard` (else EPERM writing `~/.cache/ts-standard`).
- `ts-standard app.config.js` reports one error: `Unexpected trailing comma (comma-dangle)` at the close of the plugins array. Confirmed pre-existing — linting HEAD's copy of the file gives the identical error at its line 46. Left alone.
- Prebuild evidence after the change: `android/app/src/main/AndroidManifest.xml` declares `FOREGROUND_SERVICE` once, has zero matches for `mediaPlayback`/`AudioControlsService`, and keeps `RECORD_AUDIO` + `MODIFY_AUDIO_SETTINGS`. Baseline (`HEAD`) resolved config carried both `FOREGROUND_SERVICE` and `FOREGROUND_SERVICE_MEDIA_PLAYBACK`; the new one carries only the base permission.

## Verification

**Commands:**
- `rm -rf android && npx expo prebuild -p android --no-install` -- expected: prebuild succeeds; `android/app/src/main/AndroidManifest.xml` has no `FOREGROUND_SERVICE_MEDIA_PLAYBACK` line and no `AudioControlsService` entry.
- `grep -c "android.permission.FOREGROUND_SERVICE\"" android/app/src/main/AndroidManifest.xml` -- expected: `1`, i.e. the base permission is still declared after prebuild.
- `EXPO_NO_TELEMETRY=1 npx expo config --type introspect --json` -- expected: `android.permissions` contains `android.permission.FOREGROUND_SERVICE` and no `*_MEDIA_PLAYBACK`; `ios.infoPlist.UIBackgroundModes` still contains `audio` (PiP needs it).
- `npm run lint` -- expected: no new errors (config file is JS, touched line only).

**Manual checks:**
- Only `app.config.js` is under version control; `.gitignore` ignores both `/android/` (line 75) and `/ios/` (line 76), so native-folder checks mean nothing and `git status` on them is vacuous. Verify by regenerating instead: `rm -rf ios && EXPO_NO_TELEMETRY=1 npx expo prebuild -p ios --no-install` then read `UIBackgroundModes` from the generated `ios/WiSaw/Info.plist`.
- The working tree may carry unrelated edits (a `package.json` version bump appeared mid-run and is not part of this change). Stage only `app.config.js` when committing.
- The stale debug merged manifests under `android/app/build/intermediates/**` still list both permissions until a Gradle build regenerates them — ignore them as evidence; trust the prebuilt `android/app/src/main/AndroidManifest.xml` plus introspection, or run a release merge: `cd android && ./gradlew :app:processReleaseManifest --offline`. The release merged manifest must contain `FOREGROUND_SERVICE`, no `FOREGROUND_SERVICE_MEDIA_PLAYBACK`, and still expo-location's `foregroundServiceType="location"` services.

## Plan Change Log

- **Trigger:** self-found during implementation verification, no reviewer input. The plan assumed disabling `enableBackgroundPlayback` left iOS alone apart from losing an unused background mode. `src/components/Photo/index.js:116` passes `allowsPictureInPicture`, and AVKit Picture-in-Picture needs `audio` in `UIBackgroundModes` — a mode this app received only as a side effect of expo-audio's default.
- **Amended:** added a third edit declaring `UIBackgroundModes: ['processing', 'audio']` explicitly, so the iOS mode set is unchanged (`['processing','audio','fetch']` under introspection). Verification rewritten to the commands that actually work (`expo config --type introspect`; `expo config` has no `--platform`), plus a warning that `android/app/build/intermediates/**` debug merged manifests are stale evidence.
- **Avoids:** shipping an Android-scoped permission cleanup that silently breaks iOS Picture-in-Picture on the next build.
- **KEEP:** the explicit `FOREGROUND_SERVICE` entry in `android.permissions`, and verifying by regenerating native projects rather than reading them as if they were source.

## Review Triage Log

One `quick` lens pass (`lenses_ran: [quick]`; `thorough` skipped for a config-only change). The lens confirmed the core mechanism: correct prop name, permission and service gone, `RECORD_AUDIO`/`MODIFY_AUDIO_SETTINGS` retained, no importer of `expo-audio`, no `expo-video` peer dependency. Seven findings, all checked against source:

| Verdict | Finding | Evidence / action |
|---|---|---|
| medium — patch | Comment claimed `expo-location` needs `FOREGROUND_SERVICE` for live location. | Checked: `LocationModule.kt:225 watchPositionImplAsync` runs in-process; `LocationTaskConsumer.kt:200-231` starts the service only for a task with the `foregroundService` option, and no code calls `startLocationUpdatesAsync`. Comment rewritten to "kept from the previous manifest", plan bullet corrected. |
| medium — patch | Plan called `ios/WiSaw/Info.plist` tracked; `.gitignore:76` ignores `/ios/`, `git ls-files ios` is empty, so the `git status --porcelain ios/` check was vacuous. | Confirmed. Replaced with clean-prebuild evidence and an explicit note that both native folders are generated output. |
| medium — defer | Unrelated `package.json` bump (`7.6.0` → `7.6.1`) sat in the working tree mid-run, invisible to the diff snapshot; it moves `runtimeVersion` under `policy: 'appVersion'` while `buildNumber`/`versionCode` stay `742`. | Not caused by this change — prebuild reported "Updating package.json \| no changes", and the bump appeared after the baseline snapshot. Excluded from the commit; logged as deferred work to confirm it is intentional before building. |
| low — patch | Rationale for keeping `RECORD_AUDIO` claimed microphone capture was in-app. | Checked: `src/hooks/useCameraCapture.js:3` records through `expo-image-picker` (system camera, its own permissions); no audio-recorder API is used anywhere. Decision unchanged (out of scope), reasoning corrected, cleanup deferred. |
| low — patch | PiP comment read as platform-agnostic; Android PiP needs an activity attribute this app never requested. | Confirmed `withExpoVideo.js` only acts when given props, and the manifest has no `supportsPictureInPicture`. Comment now says iOS explicitly; nothing about Android PiP changed here. |
| low — reject (folded) | `'processing'` is redundant because `expo-background-task` injects it too. | True (`withBackgroundTask.js:25`) but harmless and pre-existing; recorded in the Implementation Log rather than churned. |
| defer | AGENTS.md still describes Expo 54 / RN 0.81.5 while HEAD is SDK 58 / RN 0.88. | Real staleness, out of this plan's scope and an instruction file — logged as deferred work. |
| maybe-false → defer | `FOREGROUND_SERVICE_LOCATION` is missing for the location-typed services. | Unreachable today: no task-based or background-session location call exists. What would settle it: register a location task with the `foregroundService` option on Android 14+ and observe `LocationPermissions.kt`'s `NoPermissionInManifestException`. Recorded in the Implementation Log and deferred work. |
