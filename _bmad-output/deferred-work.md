# Deferred Work

Items noticed while working that are deliberately out of scope for the current change. Pick one up before starting a new change in the area it touches.

## `MAIN_COLOR` is orange but the brand mark is cyan

- **Raised:** 2026-10-27, during `plan-new-wisaw-logo-branding`.
- **What:** `src/consts.js:36` sets `MAIN_COLOR = '#EA5E3D'`, the app's primary interactive colour, and it is used for buttons, links and highlights throughout. The new WiSaw logo carries no orange at all — its accent is cyan `#26D1D3` on navy `#01122D`. Branding (icon, splash, adaptive icon, drawer mark, Terms hero) now reads cyan/navy while the UI chrome stays orange.
- **Why deferred:** re-tinting the app is a design decision with a theme-wide blast radius (theme tokens in `src/theme/`, contrast ratios for text and pressed states, possibly dark/light variants). The human on this change chose to keep orange and settle the palette separately.
- **Suggested first step:** get the brand palette confirmed, then change the theme token(s) rather than individual usages, and re-check contrast for `INTERACTIVE_PRIMARY` text-on-field pairs in both themes.

## Adaptive icon does not use Android's 66% safe zone

- **Raised:** 2026-10-27, during `plan-new-wisaw-logo-branding`.
- **What:** `assets/adaptive-icon.png` is the artwork full-bleed (identical to `assets/icon.png`), so the outermost bright pixel of the mark sits at r = 0.39 of the canvas — inside every standard launcher mask, but outside Google's conservative 66dp-of-108dp safe zone. Padding it instead produces a visible rounded-square seam because the artwork ships its own dark tile and corner vignette.
- **Why deferred:** the clean fix is a designer-supplied adaptive foreground (mark on a flat field with no baked-in tile). Doing it mechanically in ImageMagick looked worse than full-bleed.
- **Suggested first step:** ask for an "adaptive" export from whoever produced `wisaw_logo.png`; if one arrives, drop it in as `assets/adaptive-icon.png` and keep `BRAND_FIELD` as `backgroundColor`.

## `androidStatusBar` styling is a no-op under RN 0.88 edge-to-edge

- **Raised:** 2026-10-28, during `plan-dependency-upgrade-expo-sdk-58`.
- **What:** `app.config.js` still sets `android.androidStatusBar` to `{ barStyle: 'dark-content', backgroundColor: '#FFFFFF', translucent: false }`. React Native 0.88 makes edge-to-edge mandatory on Android, so the system no longer lets the app paint the status-bar background; only the icon style has any effect, and even that is now driven from JS (`expo-status-bar`).
- **Why deferred:** removing or reworking it changes nothing testable without a device, and the white field it used to force may still matter visually on older Android versions the build supports. Out of scope for a dependency bump, which must not change behaviour.
- **Suggested first step:** on a device running Android 15+, check the status bar over the feed and drawer; if the theme already handles insets via `react-native-safe-area-context`, delete the `androidStatusBar` block and rely on `<StatusBar style={…} />` in `app/_layout.tsx`.
## Unreviewed `package.json` version bump sat in the working tree

- **Raised:** 2026-10-31, during `plan-remove-foreground-service-media-playback`.
- **What:** `version` moved `7.6.0` → `7.6.1` while `buildNumber`/`versionCode` stayed `742`. Under `runtimeVersion: { policy: 'appVersion' }` a version bump changes the EAS Update boundary, so 7.6.1 binaries and 7.6.0 binaries would not accept each other's updates. It was not part of that change and was left uncommitted and untouched.
- **Why deferred:** nobody on the permission change authored it; committing someone else's release-prep edit inside an unrelated commit is worse than leaving it.
- **Suggested first step:** confirm the bump is intentional, then land it with its matching `buildNumber`/`versionCode` and the EAS branch/channel you intend to publish from.

## Location foreground service would need `FOREGROUND_SERVICE_LOCATION`

- **Raised:** 2026-10-31, during `plan-remove-foreground-service-media-playback`.
- **What:** `expo-location` merges two `foregroundServiceType="location"` services into the manifest, and `app.config.js` now declares the base `FOREGROUND_SERVICE`, but nothing declares `FOREGROUND_SERVICE_LOCATION`. On Android 14+ (this app targets 36) `LocationPermissions.kt` throws `NoPermissionInManifestException("FOREGROUND_SERVICE_LOCATION")` when such a service starts. Unreachable today: `src/hooks/useLocationProvider.js` uses in-process `watchPositionAsync`, and no code calls `startLocationUpdatesAsync` or the background session.
- **Why deferred:** adding it now widens the permission declaration for a feature that does not exist, which is the opposite of what this change was for.
- **Suggested first step:** when background location is actually built, configure the `expo-location` plugin props (`isAndroidBackgroundLocationEnabled` / `isAndroidForegroundServiceEnabled`) so the whole coherent set lands at once instead of hand-editing `android.permissions`.

## Microphone declaration may be as dead as the media-playback one was

- **Raised:** 2026-10-31, during `plan-remove-foreground-service-media-playback`.
- **What:** `RECORD_AUDIO` and `MODIFY_AUDIO_SETTINGS` reach the manifest via `expo-audio`'s `recordAudioAndroid` default, and `NSMicrophoneUsageDescription` via its iOS permission. No module imports `expo-audio`/`expo-av`, and capture goes through `expo-image-picker`, which records in the system camera app under that app's own permissions.
- **Why deferred:** the same "dead surface" logic that removed `FOREGROUND_SERVICE_MEDIA_PLAYBACK` would remove these too, but it also touches the Play Console permission declaration and both platforms' prompts — a decision to make on its own, not smuggled into this one.
- **Suggested first step:** confirm no in-app recording is planned (including any camera-kit migration), then drop `expo-audio` from `package.json` and the plugins array and re-run both prebuilds to see exactly which declarations disappear.

## AGENTS.md project context describes an older SDK than HEAD builds

- **Raised:** 2026-10-31, during `plan-remove-foreground-service-media-playback`.
- **What:** instruction files state React Native 0.81.5 / Expo 54.0.25, while `package.json` at `e7611a86` is React Native 0.88.1 / Expo ~58.0.21 with `targetSdkVersion: 36`. Plugin behaviour differs between those majors, so guidance read from AGENTS.md can be wrong for the tree it describes.
- **Why deferred:** editing agent instruction files is out of scope for a permission change and belongs to `bmad-project-context`.
- **Suggested first step:** run the project-context adoption pass so the pinned versions, and any version-dependent rules, match the current lockfile.
