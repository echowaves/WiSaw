## 1. Fix Privacy Explainer Animation

- [x] 1.1 Make SecretScreen fade animation depend on `hasSeenExplainer` — reset `fadeAnim` to 0 and re-trigger the parallel animation when the value changes

## 2. Identity Change Event Bus

- [x] 2.1 Create `src/events/identityChangeBus.js` with `subscribeToIdentityChange` and `emitIdentityChange` following the `friendAddBus.js` pattern
- [x] 2.2 Emit `emitIdentityChange()` in SecretScreen's `handleSubmit` (after `resetFields`) and `handleReset` (after successful reset)

## 3. Subscribe Screens to Identity Change

- [x] 3.1 PhotosList — subscribe to identity-change event in a `useEffect`, call `reload()` on event, unsubscribe on cleanup
- [x] 3.2 WavesHub — subscribe to identity-change event in a `useEffect`, call refresh function on event, unsubscribe on cleanup
- [x] 3.3 FriendsList — subscribe to identity-change event in a `useEffect`, call `reload()` on event, unsubscribe on cleanup
