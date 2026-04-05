## Why

Friend names are stored locally using `expo-storage` (file-system based), but when users migrate to a new device or reinstall the app, these names are lost. The device identity (UUID, nickname) survives because it's stored in `expo-secure-store` (iOS Keychain / Android EncryptedSharedPreferences), which persists across app reinstalls. Moving friend names to secure store ensures they survive the same scenarios. The existing friendships spec already specifies `expo-secure-store` for local friend storage, but the implementation hasn't been updated to match.

## What Changes

- Modify `friends_helper.js` to read/write friend names using `expo-secure-store` instead of `expo-storage`
- Add a lazy migration path: check secure store first, fall back to expo-storage, migrate on read
- On write, store to secure store and clean up any expo-storage entry
- On delete, remove from both stores

## Capabilities

### New Capabilities

### Modified Capabilities
- `friendships`: Local friend name storage changes from `expo-storage` to `expo-secure-store` with lazy migration from the old storage

## Impact

- `src/screens/FriendsList/friends_helper.js` — all four storage functions: `addFriendshipLocally`, `getLocalContact`, `deleteFriendship`, `testStorage`
- No API changes, no dependency changes (`expo-secure-store` is already a dependency)
- Existing users: friend names lazily migrated on first read after update
- New device users: friend names now persist across reinstalls (iOS Keychain sync)
