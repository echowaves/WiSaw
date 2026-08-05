# Design: Fix Merge Modal and WebSocket Subscription

## Bug 1: MergeWaveModal setDebouncedSearch

### Root Cause

`useDebouncedSearch` returns only the debounced value (a string), not a setter:

```js
// src/hooks/useDebouncedSearch.js
export default function useDebouncedSearch(searchValue, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(searchValue.trim())
    }, delay)
    return () => clearTimeout(timer)
  }, [searchValue, delay])
  return debouncedValue  // ← string only, no setter exposed
}
```

MergeWaveModal calls `setDebouncedSearch('')` which doesn't exist:

```js
// src/components/MergeWaveModal/index.js:91
setSearchText('')         // ← this exists ✓
setDebouncedSearch('')    // ← this is undefined ✗
```

### Fix

Delete line 91. `setSearchText('')` is sufficient — the debounce hook will propagate `''` to `debouncedSearch` after 300ms, which is acceptable for modal reset.

---

## Bug 2: WebSocket Subscription .pipe() Error

### Dependency Incompatibility

```
┌─────────────────────────────┬──────────────┬────────────────────┐
│ Package                     │ Version      │ Status             │
├─────────────────────────────┼──────────────┼────────────────────┤
│ @apollo/client              │ 4.1.6        │ Current gen        │
│ subscriptions-transport-ws  │ 0.11.0       │ Dead since 2021    │
└─────────────────────────────┴──────────────┴────────────────────┘

Apollo v4 link system:
  execute() → AsyncIterable (no .pipe())
  
subscriptions-transport-ws:
  expects RxJS Observable with .pipe() → crash
```

### Current Architecture

```
OnPhotoUploadComplete subscription:

  AppSync WebSocket
       │
       ▼
  subscriptionClientWs.js (BROKEN)
  ┌─────────────────────────────┐
  │ ApolloClient v4             │
  │   └─ WebSocketLink v4       │
  │       └─ SubscriptionClient │ ← subscriptions-transport-ws 0.11.0
  │           └─ AppSync adapter│
  └─────────────────────────────┘
       │
       ▼
  WavesHub: observable.subscribe()
       │
       ▼
  handleRefresh() → reload waves list
```

### Design Decision Points

| Question | Answer |
|----------|--------|
| Should we use Apollo for subscriptions? | No. The only subscription is `OnPhotoUploadComplete`, which is a simple event notification. Apollo's query/mutation system handles those separately (via `gqlClient` in consts.js). |
| Should we use subscriptions-transport-ws directly? | No. It's dead and incompatible with modern RxJS. `directSubscriptionClient.js` was an attempt at this, but same dead dep. |
| Should we use a new package? | Not yet. Adding a dependency just for one subscription seems heavy. A raw WebSocket is cleaner. |
| Should we emit to the local event bus? | Yes. The existing pattern (identityChangeBus, uploadBus, autoGroupBus) already bridges external events to local listeners. This keeps the architecture consistent. |

### Proposed Architecture

```
Option: Raw WebSocket → Event Bus

  AppSync WebSocket (raw WebSocket)
       │
       ▼
  subscribeToPhotoUpload() [new hook/util]
  ┌─────────────────────────────┐
  │ Direct WebSocket connect    │
  │ AppSync protocol handling   │ (reuses logic from existing adapter)
  │ Parse OnPhotoUploadComplete │
  └─────────────────────────────┘
       │
       ▼
  emitUploadComplete() ← existing event bus!
       │
       ├── WavesHub: subscribeToUploadComplete → handleRefresh()
       ├── WaveDetail: subscribeToUploadComplete → refetch
       └── useFeedLoader: subscribeToUploadComplete → update

  Benefits:
  - No dead dependencies
  - No Apollo subscription client needed
  - Consistent with existing event bus pattern
  - Other screens already listen to uploadBus
```

### What Gets Removed

1. `src/subscriptionClientWs.js` — broken Apollo v4 + dead dep wrapper
2. `src/directSubscriptionClient.js` — dead dep, never used
3. `subscriptions-transport-ws` from package.json
4. `uuid` from package.json (only used by directSubscriptionClient for operation IDs)

### What Gets Added

1. `src/services/appsyncSubscription.js` — raw WebSocket client with AppSync protocol
   - Connects to `REALTIME_API_URI`
   - Handles start_ack, data, complete frames
   - Subscribes to `OnPhotoUploadComplete`
   - Emits to `uploadBus` on receipt

### Implementation Notes

- The AppSync protocol is already understood by the existing adapter in `subscriptionClientWs.js` (the `createAppSyncGraphQLOperationAdapter` middleware). We'll extract just the protocol logic (header encoding, data formatting) without the RxJS/Apollo wrapper.
- React Native has built-in WebSocket support via `global.WebSocket`.
- The subscription should be lazy (connect on mount, reconnect on disconnect) and cleaned up on unmount.
