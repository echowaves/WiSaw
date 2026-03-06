## Why

The Android release build fails because `@react-native-async-storage/async-storage@3.0.1` requires a Maven artifact (`org.asyncstorage.shared_storage:storage-android:1.0.0`) that is not published to any configured Maven repository. This version is ahead of what Expo 55 SDK supports. Expo 55 expects version `2.2.0`. Additionally, `@react-native-community/netinfo@12.0.1` and `react-native-get-random-values@2.0.0` are flagged as incompatible with the installed Expo version.

## What Changes

- Downgrade `@react-native-async-storage/async-storage` from `3.0.1` to `2.2.0` (Expo 55 expected version)
- Downgrade `@react-native-community/netinfo` from `12.0.1` to `11.5.2` (Expo 55 expected version)
- Downgrade `react-native-get-random-values` from `2.0.0` to `1.11.0` (Expo 55 expected version)

## Capabilities

### New Capabilities

_None — this is a build compatibility fix._

### Modified Capabilities

_None — no spec-level behavior changes._

## Impact

- **package.json**: Version downgrades for 3 packages to Expo 55-compatible versions
- **Android build**: Resolves the `storage-android:1.0.0` Maven artifact not found error
- **Files using AsyncStorage**: `@react-native-async-storage/async-storage` API is stable across 2.x and 3.x — no code changes expected
- **Files using NetInfo**: `@react-native-community/netinfo` API is stable — no code changes expected
- **Files using getRandomValues**: `react-native-get-random-values` is a polyfill — API unchanged
