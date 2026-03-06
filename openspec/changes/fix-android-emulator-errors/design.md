## Context

Expo Go removed `expo-notifications` native module in SDK 53. The app currently imports it at the top-level in two files. Since `import` statements execute eagerly, the entire module crashes at load time before any notification code is called. Additionally, React Native's built-in `SafeAreaView` is deprecated in favor of the community `react-native-safe-area-context` package, which is already installed.

## Goals / Non-Goals

**Goals:**
- App loads without crashing in Expo Go on SDK 53+ Android emulator
- All notification API calls gracefully degrade when the module is unavailable
- All SafeAreaView imports use the non-deprecated `react-native-safe-area-context` package

**Non-Goals:**
- Replacing Expo Go with a development build (separate effort)
- Adding full notification functionality to Expo Go
- Changing notification behavior in production builds

## Decisions

### 1. Keep static import, wrap calls in try/catch
**Decision:** Keep `import * as Notifications from 'expo-notifications'` as-is but wrap every `Notifications.*` call in a try/catch that silently catches the error.
**Rationale:** The import itself does not fail — it's the native module call that throws. Wrapping individual calls is minimal and preserves behavior in production builds where the native module exists.
**Alternative considered:** Dynamic `import()` — rejected because it requires async handling and significant refactoring of the background task definition which runs in global scope.

### 2. Use SafeAreaView from react-native-safe-area-context
**Decision:** Replace all `SafeAreaView` imports from `react-native` with `SafeAreaView` from `react-native-safe-area-context`.
**Rationale:** The package is already a dependency. The API is compatible. The custom wrapper in `src/components/SafeAreaView/index.js` should also switch its base component.

## Risks / Trade-offs

- [Risk] Notification badge count won't update in Expo Go → **Acceptable** — this is a dev-time limitation, production builds work fine.
- [Risk] Permission request silently fails in Expo Go → **Acceptable** — same reason.
