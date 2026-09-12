# Fix Deep Audit 0905 Findings

## Why

A full deep code audit of the WiSaw app (2026-09-05, all 6 prior critical bugs verified fixed in `f6336a89` + `9ad27b62`) surfaced 10 new verified defects and a body of dead code/spec drift. The most user-visible are: Android deep links for `/wave` are not registered (shared wave links fall back to a browser on Android), any transient API error during geo/watched feed loading permanently stops pagination, and the expanded photo's bookmark count is always 0 because `getPhotoDetails` never returns `watchersCount`. Lower-severity items include a shared module-level batch token in `useFeedLoader`, an unstable inline `wave` object in `WaveDetail` that can re-fire the invite mutation, an incorrect `Content-Type` on uploaded images, an optimistic default in the location permission fallback, full invite tokens in log output, and several dead files/functions that no longer match the current architecture.

## What Changes

1. **Android `/wave` deep links**: add `intentFilters` entries for `link.wisaw.com/wave/join/*` and `link.wisaw.com/wave/invite/*` in `app.config.js`, matching the existing `/photos` and `/friends` pattern.
2. **Transient pagination errors**: in `src/screens/PhotosList/reducer.js`, `requestGeoPhotos` and `requestWatchedPhotos` SHALL distinguish transient API/network errors (retryable — list preserved, `noMoreData: false`) from true end-of-data (empty result — `noMoreData: true`). A failed page SHALL NOT permanently stop `handleLoadMore`.
3. **Per-instance batch token in `useFeedLoader`**: replace the module-level `let currentBatch = Crypto.randomUUID()` with a per-hook-instance ref so two simultaneous feed instances cannot abort each other's in-flight loads.
4. **`watchersCount` in photo details**: `getPhotoDetails` SHALL return `watchersCount` so the expanded photo's bookmark count (currently `photoDetails?.watchersCount || 0` → always 0) is correct. **Requires a backend change** (add `watchersCount` to the `getPhotoDetails` query/resolver in Wisaw.cdk) — a copy-paste prompt for the backend workspace will be generated; no backend files are touched here.
5. **Stable wave identity for WaveShareModal**: `WaveDetail` SHALL pass a stable wave identity (or the modal SHALL depend on `wave.waveUuid`) so a re-render with a fresh inline `wave` object cannot re-trigger `createWaveInvite`.
6. **Photo upload content-type**: `photoUploadService.js` SHALL send the correct `Content-Type` for the actual payload bytes (currently PUTs WebP bytes with `image/jpeg` under a `.upload` key).
7. **Location permission fallback semantics**: `useLocationProvider` SHALL not default `permStatus` to `'granted'` when both the request and foreground-permission calls time out — the default SHALL reflect "unknown" and re-check on the next trigger.
8. **Secure logging**: remove full invite tokens from log statements (redact to prefix + length only).
9. **Dead code removal**: delete `index.js` (imports non-existent `./App`; real entry is `expo-router/entry` via package.json), `test-import.js`, `branch.json` (Branch was removed), `src/utils/waveStorage.js` (6 sort functions, 0 references), and the dead `getPhotos()` in `PhotosList/reducer.js`.
10. **Spec drift**: `photo-upload-orchestration` SHALL document the upload content-type and artifact-cleanup behavior as implemented after the 09-02 fix.

## Capabilities

### New Capabilities

- `dead-code-hygiene`: repo SHALL contain no unreachable entry points, unreferenced utility modules, or scratch files; dead code SHALL be removed as part of related changes.

### Modified Capabilities

- `deep-linking`: Wave Deep Links requirement extended — Android `intentFilters` SHALL cover `/wave/join` and `/wave/invite` paths in addition to iOS `associatedDomains`.
- `feed-loader-hook`: pagination error handling — a transient fetch error SHALL NOT set `noMoreData`/`stopLoading`; batch tokens SHALL be per hook instance.
- `comments`: `getPhotoDetails`-backed photo details SHALL include `watchersCount` so comment/bookmark UI reflects true counts.
- `wave-sharing`: Wave share modal — invite creation SHALL be keyed on stable wave identity (`waveUuid`), not object identity of the `wave` prop.
- `photo-upload-orchestration`: uploaded image objects SHALL carry the correct content type and key for the actual payload; local artifact cleanup stays as implemented.
- `location-provider`: permission status fallback — a permission-check timeout SHALL resolve to `unknown` (re-checkable), never an optimistic `granted`.
- `secure-logging`: log output SHALL NOT contain full invite tokens or other secret material; redaction to prefix + length is required.

## Impact

- `app.config.js` — android intentFilters (finding 1)
- `src/screens/PhotosList/reducer.js` — `requestGeoPhotos`, `requestWatchedPhotos`, dead `getPhotos()` (findings 2, 9)
- `src/hooks/useFeedLoader.js` — module-level batch token (finding 3)
- `src/components/Photo/reducer.js` + `src/components/Photo/index.js` — `watchersCount` wiring (finding 4)
- `src/screens/WaveDetail/index.js` + `src/components/WaveShareModal.js` — stable wave identity (finding 5)
- `src/screens/PhotosList/upload/photoUploadService.js` — content-type/key (finding 6)
- `src/hooks/useLocationProvider.js` — permission fallback default (finding 7)
- log call sites emitting invite tokens (finding 8)
- deletions: `index.js`, `test-import.js`, `branch.json`, `src/utils/waveStorage.js` (finding 9)
- **Backend (Wisaw.cdk, separate repo — NOT modified here)**: add `watchersCount` to `getPhotoDetails`; a copy-paste prompt will be generated for the backend workspace (finding 4)
