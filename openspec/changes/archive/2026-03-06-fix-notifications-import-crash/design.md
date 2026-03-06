## Context

`expo-notifications` was removed from Expo Go starting with SDK 53. The current codebase has `import * as Notifications from 'expo-notifications'` at the top of two files. While individual API calls were previously wrapped in try/catch, the import statement itself throws before any code runs, crashing the app on Android emulator with Expo Go.

## Goals / Non-Goals

**Goals:**
- Prevent the app from crashing at import time when `expo-notifications` is unavailable
- Maintain full notification functionality in development builds and production
- Keep notification API usage unchanged in consumer files

**Non-Goals:**
- Adding alternative notification providers for Expo Go
- Changing notification behavior or logic
- Migrating away from expo-notifications

## Decisions

### Use `require()` with try/catch in a wrapper module

**Decision:** Create `src/utils/notifications.js` that wraps `require('expo-notifications')` in a try/catch block and exports the result or no-op stubs.

**Rationale:** ES `import` statements are hoisted and cannot be wrapped in try/catch. Using `require()` (CommonJS) within a try/catch at module scope allows catching the load error. The Metro bundler supports `require()` in React Native.

**Alternatives considered:**
- Dynamic `import()` — returns a Promise, which would require making all consumers async and restructuring module-level code (e.g., `TaskManager.defineTask` calls that use Notifications at the top level)
- Optional peer dependency — doesn't solve the runtime crash, just the install-time resolution
- `Platform.OS` check — the crash is not platform-specific but environment-specific (Expo Go vs dev build)

### Provide no-op stubs for used APIs only

**Decision:** Only stub `setBadgeCountAsync` and `requestPermissionsAsync` — the two functions actually used in the codebase. Return resolved promises.

**Rationale:** Minimal surface area. If other APIs are needed later, they can be added to the stubs.

### Remove redundant try/catch around individual calls

**Decision:** Remove the try/catch blocks added in the previous fix around each `Notifications.*` call, since the wrapper already handles the unavailability.

**Rationale:** The wrapper guarantees safe no-op stubs, making per-call try/catch noise.

## Risks / Trade-offs

- [Risk: Future notification API usage not stubbed] → Only two APIs are stubbed. If new Notifications APIs are used, they'll need stubs added to the wrapper. Mitigated by the existing pattern being obvious and easy to extend.
- [Risk: `require()` may behave differently in some bundler configurations] → Metro bundler fully supports `require()` in React Native; this is standard practice.
