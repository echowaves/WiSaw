## 1. Android wave deep links

- [x] 1.1 Add Android `intentFilters` for `link.wisaw.com/wave/join` and `/wave/invite` (ACTION_VIEW + BROWSABLE + DEFAULT, `autoVerify: true`) in `app.config.js`, mirroring the existing `/photos` and `/friends` entries
- [ ] 1.2 Rebuild Android dev build and verify a wave join/invite link opens the app (or app-chooser if App Links unverified) and reaches the wave join confirmation screen

## 2. Feed pagination resilience

- [x] 2.1 In `src/screens/PhotosList/reducer.js`, make `requestGeoPhotos` return `{ photos: [], noMoreData: false, error: true }` on catch instead of `noMoreData: true`
- [x] 2.2 Apply the same transient-error handling to `requestWatchedPhotos`
- [x] 2.3 Confirm the reducer merge preserves the existing list on error responses and that `stopLoading` stays false (retry on next `handleLoadMore`/pull-to-refresh)
- [ ] 2.4 Manual QA: simulate a network failure mid-scroll on the geo feed and the watched feed; verify the list is preserved and the next scroll/refresh retries; verify a genuine empty response still stops pagination

## 3. Per-instance feed batch token

- [x] 3.1 In `src/hooks/useFeedLoader.js`, replace the module-level `let currentBatch = Crypto.randomUUID()` with `const batchRef = useRef(Crypto.randomUUID())`
- [x] 3.2 Update all `currentBatch` comparisons in `load()`/`reload()`/`handleLoadMore` to use `batchRef.current`; `reload()` reassigns `batchRef.current`
- [ ] 3.3 Manual QA: open the main feed and a detail feed simultaneously; trigger a reload in one and verify the other's in-flight page loads are not discarded

## 4. watchersCount in photo details (frontend half)

- [x] 4.1 Add `watchersCount` to the `getPhotoDetails` GraphQL selection in `src/components/Photo/reducer.js`
- [x] 4.2 Verify `src/components/Photo/index.js` renders `photoDetails?.watchersCount` (line ~744) with no further change needed
- [x] 4.3 Generate a copy-paste backend prompt for the Wisaw.cdk workspace to add `watchersCount` (Int) to the `getPhotoDetails` query/resolver (do NOT edit backend files)
- [x] 4.4 Verify graceful degradation: with the backend field absent, the expanded card shows 0 without errors

## 5. Comment auto-bookmark guard

- [x] 5.1 In `src/components/Photo/reducer.js` `submitComment`, call `watchPhoto()` only when `photoDetails.isPhotoWatched` is falsy; keep the refresh-signal ordering (mutation awaited before `photoRefreshBus` emit)
- [ ] 5.2 Manual QA: comment on an already-watched photo (no second `watchPhoto` call in network log) and on an unwatched photo (mutation fires, then refresh)

## 6. Stable wave identity for share modal

- [x] 6.1 In `src/components/WaveShareModal.js`, key the open/re-create effect on `wave?.waveUuid` and remove the `wave` object from the effect dependency array
- [ ] 6.2 Manual QA: with the invite-only share modal open, force a WaveDetail re-render (e.g., toggle a UI state); verify `createWaveInvite` is NOT re-fired and the QR/link are unchanged; verify switching to a different wave still re-fires

## 7. Upload content-type

- [x] 7.1 In `src/screens/PhotosList/upload/photoUploadService.js` `uploadItem`, send `Content-Type: image/webp` for WebP-encoded bytes (derive from the actual encoder output, not hardcoded JPEG)
- [x] 7.2 Check the Wisaw.cdk upload-URL generation for extension-based keys; if the key must match the format, rename `${photoId}.upload` → `${photoId}.webp` and fold the change into the backend prompt
- [ ] 7.3 Manual QA: upload a photo and verify the stored object's content type is `image/webp` and the photo renders correctly after re-fetch

## 8. Location permission fallback

- [x] 8.1 In `src/hooks/useLocationProvider.js`, resolve `permStatus` to `'unknown'` (not `'granted'`) when both the request and the fallback `getForegroundPermissionsAsync` time out, and skip fast-seed/watcher setup in that state
- [x] 8.2 Add a re-check on `AppState` transition to `active` (or the next explicit trigger) when `permStatus === 'unknown'`
- [x] 8.3 Grep for `permStatus`/`'granted'` consumers and confirm none assume `granted` on the timeout path
- [ ] 8.4 Manual QA on Mac Catalyst (hang case) and a real device: verify no watchers start on timeout and the state resolves on the next foreground transition

## 9. Secure logging

- [x] 9.1 Find all `console.*` call sites interpolating wave invite tokens
- [x] 9.2 Redact each to `${token.slice(0, 4)}… (len ${token.length})` using parameterized format strings (literal first arg, `%s` tokens)
- [x] 9.3 Verify no `console.*` statement emits a full token, API key, or user secret

## 10. Dead code removal (behavior-neutral)

- [x] 10.1 Re-verify zero references for each target before deleting: root `index.js`, `test-import.js`, `branch.json`, `src/utils/waveStorage.js`, and `getPhotos()` in `src/screens/PhotosList/reducer.js`; stop and report if any reference is found
- [x] 10.2 Delete the verified-dead files and the `getPhotos()` function
- [x] 10.3 Run the linter/type check to confirm no dangling imports remain

## 11. Verification

- [x] 11.1 Run `openspec validate fix-audit-0905-findings` and confirm it passes
- [ ] 11.2 Full manual pass: deep links (iOS + Android), feed scroll/refresh/search, expanded-card bookmark count, share modal, upload, location, and logs
