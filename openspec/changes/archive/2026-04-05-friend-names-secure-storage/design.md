## Context

Friend names are stored locally as individual key-value pairs with key format `FRIENDSHIP-{uuid}`. Currently stored via `expo-storage` (files in document directory), which is wiped on app reinstall. The device identity (UUID, nickname) already uses `expo-secure-store` and survives reinstalls — confirmed by a real user report where identity persisted but friend names were lost after device migration.

Four functions in `friends_helper.js` interact with friend name storage:
- `addFriendshipLocally` — write
- `getLocalContact` — read
- `deleteFriendship` — delete
- `testStorage` — debug helper

## Goals / Non-Goals

**Goals:**
- Friend names persist across app reinstalls and device migrations (iOS Keychain sync)
- Existing users' friend names are lazily migrated from expo-storage to secure store
- No data loss during the transition period
- Consistent with how identity is already stored

**Non-Goals:**
- Bulk migration at app startup (lazy per-friend migration is simpler and sufficient)
- Removing `expo-storage` as a dependency (it's used elsewhere in the app)
- Changing the key format or friend name data model

## Decisions

### 1. Lazy migration over eager migration

**Decision**: Migrate each friend name on first read, not in a batch at startup.

**Alternatives considered**:
- **Eager migration at startup**: Enumerate all expo-storage keys, migrate matching `FRIENDSHIP-*` keys. Adds startup latency, requires listing all keys and filtering, more complex error handling for partial failures.
- **Dual-write forever**: Write to both stores indefinitely. Unnecessary complexity once migration is complete.

**Rationale**: Lazy migration is simpler — each friend name migrates the first time `getLocalContact` reads it. No startup cost, no need to enumerate keys. After one session of viewing the friends list, all names will be migrated.

### 2. Read priority: secure store first

**Decision**: `getLocalContact` checks secure store first. Only falls back to expo-storage if not found.

**Rationale**: After migration, secure store is the source of truth. Checking it first avoids unnecessary file-system reads for the common case (already migrated). The expo-storage fallback handles the transitional period.

### 3. Clean up expo-storage after migration

**Decision**: After successfully migrating a name to secure store, delete it from expo-storage.

**Rationale**: Prevents stale data and reduces storage footprint. If secure store write fails, the expo-storage entry remains as a safety net.

### 4. Write only to secure store

**Decision**: `addFriendshipLocally` writes to secure store and removes any expo-storage entry. No dual-write.

**Rationale**: New writes should go directly to the durable store. Cleaning up expo-storage on write handles edge cases where a name was previously stored there.

## Risks / Trade-offs

- **Android Keystore device-binding** → On Android, secure store encryption keys may not transfer between devices, so friend names could still be lost on Android device migration. **Mitigation**: This is the same tradeoff the app already accepts for UUID and nickname. Friend names are recoverable (user can re-label friends).
- **expo-secure-store key length limit** → Keys are limited to 2048 bytes. `FRIENDSHIP-{uuid}` is ~47 characters. **Mitigation**: Well within limits.
- **expo-secure-store value size limit** → 2048 bytes per value on iOS. Friend names are short strings. **Mitigation**: No practical risk.

## Migration Plan

1. Deploy update with lazy migration code
2. As users open their friends list, names are read → migrated to secure store → expo-storage entries cleaned up
3. After sufficient adoption time, the expo-storage fallback path becomes dead code but can remain indefinitely as a safety net with zero cost
