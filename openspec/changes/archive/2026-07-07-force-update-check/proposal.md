## Why

WiSaw needs a way to ensure all users run at least a minimum app version/build number before connecting to the backend. When a critical fix or API change requires all clients to update, the app currently has no mechanism to enforce this — users on older builds can continue using the app and encounter errors.

## What Changes

- On app cold start, the root layout fetches `AppConfig` from the backend GraphQL API (`appConfig { minAppBuild, minAppVersion, message }`)
- Compares the device's current build number (iOS: `ios.buildNumber`, Android: `android.versionCode`) against `minAppBuild` from the backend
- Compares the device's current app version (`version` from package.json) against `minAppVersion` from the backend
- If either threshold is not met, displays a **blocking full-screen modal** that prevents app interaction
- Modal action depends on trigger type:
  - Build update: calls `Updates.reloadAsync()` to reload EAS Updates JS bundle
  - Version update: opens App Store (iOS) or Google Play (Android) for native app update
- The modal shows the backend-provided `message` (or a fallback default message)
- Button text: "Reload" for build updates, "Update Now" for version updates
- On network errors or backend failures, the check is silently skipped — no blocking

## Capabilities

### New Capabilities
- `force-update-check`: Client-side enforcement of minimum app version/build number via backend `AppConfig` API, with blocking modal and restart flow

### Modified Capabilities
<!-- None — this is a new capability -->

## Impact

- **Affected code**: `app/_layout.tsx` (root layout — add startup check and modal rendering), new `src/components/ForceUpdateModal/` component
- **Backend API**: Already implemented (`appConfig` query in `WiSaw.cdk/graphql/schema.graphql`)
- **Dependencies**: None — uses existing `gqlClient`, `Linking`, `Platform`, and `appConfig` from `app.config.js`
- **Platforms**: iOS and Android
