## Why

After establishing identity on a new device (entering nickname + secret for the first time), the app fails to recognize the newly attached identity until the app is restarted. Wave grouping, photo feeds, friend lists, and bookmarks all re-fetch using a stale (empty) UUID from the Jotai atom, returning no data. This breaks the core "attach identity and immediately use the app" flow.

## What Changes

- **Synchronize the Jotai `uuid` atom** when `registerSecret` succeeds in `SecretScreen` — call `setUuid(newUuid)` alongside the existing `setNickName(nickNameText)`.
- **Fix `UngroupedPhotosCard`** to re-fetch ungrouped photos when identity changes (it currently has no identity-change subscription and uses a `fetchedRef` that prevents re-fetching).
- Ensure all identity-change subscribers receive the correct UUID so their data refreshes use the newly established identity.

## Capabilities

### Modified Capabilities
- `user-identity`: Identity establishment now updates both `uuid` and `nickName` Jotai atoms synchronously, ensuring all subscribers see the complete identity immediately.

## Impact

- `src/screens/Secret/index.js` — Add `setUuid` to the `useAtom` destructuring and call it after `registerSecret` succeeds.
- `src/components/UngroupedPhotosCard/index.js` — Add identity-change subscription or reset `fetchedRef` on identity change.
- No API or backend changes required. No new dependencies.
