## 1. Fix SecretScreen UUID Sync

- [x] 1.1 Destructure `setUuid` from `useAtom(STATE.uuid)` in `SecretScreen` component
- [x] 1.2 Call `setUuid(result.uuid)` synchronously after `registerSecret` succeeds, before `emitIdentityChange()`
- [x] 1.3 Call `setUuid(result.uuid)` synchronously after `updateSecret` succeeds, before `emitIdentityChange()`

## 2. Fix UngroupedPhotosCard Identity Change Handling

- [x] 2.1 Import `subscribeToIdentityChange` from `../../events/identityChangeBus`
- [x] 2.2 Subscribe to identity changes and reset `fetchedRef.current = false` + re-fetch ungrouped photos when identity changes
