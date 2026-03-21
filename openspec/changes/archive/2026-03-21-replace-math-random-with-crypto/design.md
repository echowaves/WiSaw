## Context

The codebase uses `String(Math.random())` to generate batch IDs for pagination across several wave and photo screens. The main `PhotosList/index.js` and `Chat/useMessages.js` have already been migrated to `Crypto.randomUUID()` from `expo-crypto`. The remaining 6 files still use the old pattern.

## Goals / Non-Goals

**Goals:**
- Replace all remaining `String(Math.random())` with `Crypto.randomUUID()`
- Align all batch-ID generation with the existing `expo-crypto` pattern

**Non-Goals:**
- Changing batch ID logic or pagination behavior
- Migrating comment lines that reference `Math.random()` (these are inactive)

## Decisions

### Use `Crypto.randomUUID()` from `expo-crypto`

**Rationale:** This is already the established pattern in the codebase (`PhotosList/index.js`, `Chat/useMessages.js`). Using the same API maintains consistency. `expo-crypto` is already installed (v55.0.9) and provides a cryptographically secure UUID v4 generator that works cross-platform (iOS, Android, Web).

**Alternatives considered:**
- `uuid` package (`v4()`): Also available in the project, but `expo-crypto` is the convention for new code and avoids the `react-native-get-random-values` polyfill dependency.
- `crypto.randomBytes()`: Node.js API, not available in React Native without additional polyfills.

## Risks / Trade-offs

- **[Risk] Batch ID length changes**: `Math.random()` produces ~17 chars (e.g. `"0.123456789012345"`), UUID produces 36 chars (`"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"`). → The backend accepts batch as a string parameter with no length constraint, so this is safe.
