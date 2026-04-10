## Context

The app stores ~12 key-value pairs using `expo-secure-store` (iOS Keychain / Android Keystore). On first launch after a fresh install, the iOS Keychain cold-starts slowly, causing all concurrent `getItemAsync()` calls to hang past their 3-second timeouts. This floods the screen with error toasts and loses all stored preferences.

Only 2 of these values are actually sensitive (UUID and NickName — device identity). The rest are UI preferences (theme, sort order, flags) that were put in SecureStore "for simplicity" per code comments.

The app already has `expo-storage` as a dependency, which uses filesystem I/O (`expo-file-system` `File` API) with no Keychain involvement. It's already used in `friends_helper.js` and `photoUploadService.js`.

## Goals / Non-Goals

**Goals:**
- Eliminate all SecureStore timeout errors on first launch
- Move non-sensitive preferences to filesystem-based storage (`expo-storage`)
- Remove dead `activeWave` storage code and deprecated `ActiveWaveIndicator` component
- Fix the missing `Platform` import that prevents background task registration

**Non-Goals:**
- Migrating existing user data from SecureStore to expo-storage (clean break accepted)
- Changing the UUID or NickName storage (stays in SecureStore)
- Refactoring the storage layer into an abstraction or adding a new storage helper module
- Modifying `friends_helper.js` (already has its own migration plan per existing TODO)

## Decisions

### 1. expo-storage over AsyncStorage or custom wrapper

**Decision**: Use `expo-storage` (already a dependency) which wraps `expo-file-system`'s `File` API.

**Why over AsyncStorage**: AsyncStorage uses SQLite on iOS which can also have first-launch delays. expo-storage uses direct file I/O — one file per key in the documents directory. It's already proven in the codebase.

**Why no abstraction layer**: This is a straightforward 1:1 API swap. The call sites are few and isolated per file. Adding an abstraction would be over-engineering.

**API mapping**:
| SecureStore | expo-storage |
|---|---|
| `setItemAsync(key, val)` | `Storage.setItem({ key, value: val })` |
| `getItemAsync(key)` | `Storage.getItem({ key })` |
| `deleteItemAsync(key)` | `Storage.removeItem({ key })` |

### 2. Clean break — no data migration

**Decision**: Accept that existing users' non-sensitive preferences will reset to defaults on first launch after update.

**Why**: All affected values are lightweight UI preferences (theme=light, sort=default, hints=show again). The cost of implementing a migration path (try expo-storage → fallback to SecureStore → write back) outweighs the minor UX disruption of preferences resetting once.

### 3. Remove timeouts from migrated code, remove timeout from NickName read

**Decision**: Remove all `Promise.race` timeout wrappers from storage reads that move to expo-storage. Also remove the timeout from `getStoredNickName()` which stays in SecureStore.

**Why for expo-storage**: Filesystem reads don't have cold-start issues. The timeouts were a workaround for Keychain behavior and are unnecessary with file I/O.

**Why for NickName**: The `_layout.tsx` startup uses `Promise.allSettled`, so a slow NickName read won't block anything — it just delays setting the nickname in state. Removing the timeout lets it complete naturally on cold start rather than erroring out. The UUID read timeout (5s) is also removed for consistency.

### 4. Delete dead activeWave code

**Decision**: Remove `saveActiveWave`, `loadActiveWave`, `clearActiveWave` from `waveStorage.js` and delete `src/components/ActiveWaveIndicator/index.js`.

**Why**: The `activeWave` atom was already removed from `state.js` in a prior refactor. The `ActiveWaveIndicator` component references `STATE.activeWave` which is `undefined`. No code calls `loadActiveWave` or `clearActiveWave`. This is confirmed dead code.

## Risks / Trade-offs

- **[Preference reset]** → Existing users see default theme/sort/hints on first launch after update. Mitigation: these are all quick to re-set. T&C acceptance will re-prompt once — low impact since user already accepted.
- **[expo-storage key collision]** → expo-storage stores files in `Paths.document` directory. Keys like `USER_THEME_PREFERENCE` become filenames. Mitigation: keys use only alphanumeric/underscore characters which pass expo-storage's `isValidKey` regex validation.
- **[Missing Platform import]** → Separate bug fix bundled with this change for convenience. Low risk, isolated to adding one import.
