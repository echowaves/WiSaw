# Fix Merge Modal Debounce Crash and WebSocket Subscription Error

## Problem

Two independent runtime crashes:

### Bug 1: MergeWaveModal `setDebouncedSearch` ReferenceError

The `MergeWaveModal` component calls `setDebouncedSearch('')` on modal open (line 91), but `useDebouncedSearch` returns only a value — no setter. This causes a `ReferenceError` whenever the merge modal opens.

```
ERROR  [ReferenceError: Property 'setDebouncedSearch' doesn't exist]
  useEffect$argument_0 (src/components/MergeWaveModal/index.js:91:7)
```

### Bug 2: WebSocket Subscription `.pipe is not a function`

The `subscriptionClientWs.js` uses the dead `subscriptions-transport-ws` package (0.11.0, abandoned 2021) wrapped inside Apollo Client v4's `WebSocketLink`. Apollo v4 removed RxJS from its link system, replacing it with async iterables. The old `SubscriptionClient` expects `.pipe()` on the observable returned by Apollo's `execute()`, which no longer exists.

```
LOG  [WAVES-HUB] Photo upload + auto-grouping complete: {
  "error": [TypeError: (0, link_1.execute)(link, operation, executeContext).pipe 
             is not a function (it is undefined)]
}
```

This breaks the `OnPhotoUploadComplete` subscription in WavesHub — the **only** cross-device sync subscription. When another device uploads a photo, this client won't receive the refresh notification.

## Solution

1. **MergeWaveModal**: Remove the dead `setDebouncedSearch('')` call. The adjacent `setSearchText('')` already clears the source value, which the debounce hook will propagate.

2. **WebSocket subscription**: Replace the Apollo-based subscription pattern with a direct WebSocket connection using the existing `directSubscriptionClient.js` pattern (already has the AppSync adapter). Wire it to emit to the local `uploadBus` event bus, eliminating the Apollo v4 link dependency entirely. Then remove both `subscriptionClientWs.js` and `directSubscriptionClient.js` in favor of a clean implementation.

## Impact

- **Bug 1**: `src/components/MergeWaveModal/index.js` (1 line removed)
- **Bug 2**: New subscription transport in `src/screens/WavesHub/index.js`, removal of `subscriptionClientWs.js`, removal of `directSubscriptionClient.js`
- **No backend changes required**
