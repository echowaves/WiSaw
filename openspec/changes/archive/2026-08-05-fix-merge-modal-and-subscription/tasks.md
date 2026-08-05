# Tasks: Fix Merge Modal and WebSocket Subscription

## 1. Fix MergeWaveModal setDebouncedSearch crash

- [x] 1.1 Remove `setDebouncedSearch('')` call from `src/components/MergeWaveModal/index.js` line 91
- [x] 1.2 Verify `setSearchText('')` on line 90 remains unchanged (this is the correct clear mechanism)

## 2. Create raw WebSocket AppSync subscription service

- [x] 2.1 Create `src/services/appsyncSubscription.js` with raw WebSocket connection
- [x] 2.2 Implement AppSync protocol: header encoding (`host`, `x-api-key`), connection URL with `REALTIME_API_URI`
- [x] 2.3 Implement subscription frame formatting (JSON with `id`, `type: start`, `payload` with query/variables)
- [x] 2.4 Implement response frame parsing (`start_ack` skip, `data` extract, `complete` handle, `error` log)
- [x] 2.5 On receiving `OnPhotoUploadComplete` data, call `emitUploadComplete` from `uploadBus`
- [x] 2.6 Export `subscribeToPhotoUploadComplete` and `unsubscribePhotoUploadComplete` functions

## 3. Update WavesHub to use new subscription

- [x] 3.1 Remove `import subscriptionClient from '../../subscriptionClientWs'` from `src/screens/WavesHub/index.js`
- [x] 3.2 Replace `subscriptionClient.subscribe({ query: PHOTO_UPLOAD_COMPLETE_SUBSCRIPTION })` block with new `subscribeToPhotoUploadComplete` call
- [x] 3.3 Remove `gql` template literal for `PHOTO_UPLOAD_COMPLETE_SUBSCRIPTION` (no longer needed in this file — the query string moves to the service)
- [x] 3.4 Verify `subscribeToUploadComplete` and `subscribeToAutoGroupDone` event bus listeners remain unchanged

## 4. Clean up dead files and dependencies

- [x] 4.1 Delete `src/subscriptionClientWs.js`
- [x] 4.2 Delete `src/directSubscriptionClient.js`
- [x] 4.3 Remove `subscriptions-transport-ws` from `package.json`
- [x] 4.4 Note: `uuid` package cannot be removed — still used by `photoUploadService.js` and `Secret/reducer.js`
