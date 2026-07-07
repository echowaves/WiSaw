## Context

WiSaw is a React Native app (Expo 54) with file-based routing via Expo Router 6. The app uses Apollo Client 4.0.2 for GraphQL and Jotai 2.15.0 for state management.

The backend already exposes an `AppConfig` GraphQL query (`appConfig { minAppBuild, minAppVersion, message }`) in the schema at `WiSaw.cdk/graphql/schema.graphql`. No backend changes are needed.

Currently, there is no client-side enforcement of minimum app version/build — users on outdated builds can continue using the app and may encounter errors.

Version/build numbers are centralized in `package.json` and imported via `app.config.js`. The drawer already displays these values using `appConfig.expo.ios.buildNumber` and `appConfig.expo.android.versionCode`.

## Goals / Non-Goals

**Goals:**
- Fetch `AppConfig` from backend on app startup (before screens render)
- Compare device build number against `minAppBuild` and device version against `minAppVersion`
- Display a blocking full-screen modal if either threshold is not met
- Provide a "Restart" button that deep-links to self (`wisaw://`) to relaunch the app
- Use backend-provided `message` for modal text, with fallback defaults

**Non-Goals:**
- No persistence of build number — check runs every launch
- No EAS Update JS bundle comparison — only native build version
- No app store redirect — the restart button deep-links to self; for native build changes, user must update from store manually
- No new dependencies

## Decisions

### 1. Use `appConfig.expo` (build-time constants) for device build number

The drawer displays `appConfig.expo.ios.buildNumber` (from `package.json` → `app.config.js`). The comparison must use the same source so the value the user sees is the value we compare.

```js
const deviceBuild = Platform.select({
  ios: appConfig.expo.ios.buildNumber,    // string "702"
  android: String(appConfig.expo.android.versionCode), // "702"
  default: appConfig.expo.ios.buildNumber
})
```

This is simpler than using `expo-constants` runtime values (`Constants.expoConfig.ios.buildNumber`) which may drift from the package.json source due to EAS Update manifest caching.

### 2. Inline in root layout (`app/_layout.tsx`)

The build check and modal rendering go directly in `app/_layout.tsx` rather than a separate hook or atom. This keeps the feature self-contained and ensures the modal blocks everything (root layout renders before any screens).

### 3. `Updates.reloadAsync()` for build updates, App Store for version updates

Build updates (EAS JS bundle):
- Uses `Updates.reloadAsync()` from `expo-updates` to reload the JS bundle
- Works on both iOS and Android without requiring native app update
- Button displays "Reload"

Version updates (native app):
- Opens platform-specific app store URL
- iOS: `https://apps.apple.com/app/id1482598170`
- Android: `https://play.google.com/store/apps/details?id=com.echowaves.wisaw`
- Button displays "Update Now"

### 4. Graceful degradation — silently skip on errors

If the GraphQL query fails (no network, server error, missing field), the check is silently skipped and the user proceeds normally. This avoids blocking users due to temporary backend issues.

### 5. Semver comparison without external library

A simple inline `compareSemver()` function splits on `.` and compares parts numerically. No need for the `semver` package — this is a single use case.

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Backend is down → no check → user on old build continues | Acceptable — check is best-effort; backend will eventually return valid data |
| `Linking.openURL('wisaw://')` is a no-op on iOS | Document that on iOS, restart may just bring app to foreground; for native builds, user must update from store |
| Build number mismatch after EAS Update JS push | Not a concern — both device build and backend check use native build numbers which only change on native reinstall |
| `appConfig.expo.android.versionCode` is a number vs iOS string | Normalize to string via `String()` before comparison, parse both as integers |

## Open Questions

None — all decisions made during explore.
