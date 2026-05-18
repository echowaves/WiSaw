## Context

WiSaw uses an anonymous identity model: each device stores a `(uuid, nickName, secret)` triplet in `expo-secure-store`. At app startup (`app/_layout.tsx`), these values are read from SecureStore and set into Jotai atoms (`STATE.uuid`, `STATE.nickName`).

When a user establishes identity on a new device via the `SecretScreen`:
1. User enters nickname + secret → taps "Attach Identity"
2. `registerSecret()` mutation sends `(nickName, secret, uuid)` to backend
3. Backend returns `{ uuid, nickName }`
4. `registerSecret()` stores both values to SecureStore
5. `SecretScreen` calls `setNickName(nickNameText)` — updates Jotai nickName atom ✓
6. `SecretScreen` calls `emitIdentityChange()` — notifies all subscribers
7. Subscribers (`WavesHub`, `PhotosList`, `FriendsList`, `BookmarksList`) re-fetch using their **stale** `uuid` closure ✗

The `uuid` Jotai atom is NEVER updated in this flow. All subscribers re-fetch with the old (empty) uuid.

## Goals / Non-Goals

**Goals:**
- Synchronize the `uuid` Jotai atom when `registerSecret` succeeds
- Fix `UngroupedPhotosCard` to re-fetch when identity changes
- Ensure all identity-change subscribers receive the correct UUID

**Non-Goals:**
- Refactoring the identity storage mechanism (SecureStore → Jotai bridge)
- Adding identity change propagation to other event buses
- Fixing warm-start deep-link identity issues (out of scope)

## Decisions

### Decision 1: Call `setUuid()` directly in `SecretScreen.handleSubmit`
**Choice**: Update the Jotai `uuid` atom synchronously in the same handler that updates `nickName`.

**Rationale**: This is the minimal, most localized fix. The `uuid` is already available in `handleSubmit` (returned from `registerSecret`). No new hooks, events, or bridges needed.

**Alternatives considered**:
- Emit a new `identityUuidChange` event bus — overkill for a single-atom update
- Create a custom hook that syncs SecureStore → Jotai on every change — adds indirection for a one-time fix
- Use `atomFamily` or `atomWithStorage` from Jotai — unnecessary complexity

### Decision 2: Reset `fetchedRef` in `UngroupedPhotosCard` on identity change
**Choice**: Subscribe to `subscribeToIdentityChange` in `UngroupedPhotosCard` and reset `fetchedRef.current = false` before re-fetching.

**Rationale**: The card receives `uuid` as a prop, but the `fetchedRef` prevents re-fetching when the prop changes. Resetting the ref is simpler than restructuring the component to use effect dependencies.

**Alternatives considered**:
- Replace `fetchedRef` with a `useEffect` dependency on `uuid` — would require tracking fetch state differently
- Lift fetch logic to parent — adds complexity for a simple card component

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| `setUuid` called before `registerSecret` completes | Already handled — `setUuid` is called inside the `try` block after the mutation succeeds |
| `UngroupedPhotosCard` re-fetches on every identity change (including secret updates) | Acceptable — the uuid may change on first attach, but not on secret updates (only nickName changes). If it does re-fetch unnecessarily, it's a harmless no-op. |
| Other components not yet subscribed to identity changes may have the same bug | The existing `subscribeToIdentityChange` pattern is already used by 4 screens. Any new screen that reads identity data should subscribe. This fix makes the existing pattern work correctly. |
