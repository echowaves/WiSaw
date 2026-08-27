# Design — fix-save-to-library

## Context

`expo-media-library` ~57.0.4 removed the legacy function-based save API from the main entry point. The main entry (`expo-media-library`) now exposes the **new class-based API**: `Asset`, `Album`, `Query`, `requestPermissionsAsync`/`getPermissionsAsync`, `presentPermissionsPicker`, `addListener`. The old functions (`saveToLibraryAsync`, `createAssetAsync`, …) survive only under `expo-media-library/legacy`, and in 57.x the legacy `saveToLibraryAsync` throws a deprecation error rather than working — which is exactly what the device logs show.

Current call site (`src/hooks/useCameraCapture.js`, `takePhoto`):

```js
await MediaLibrary.saveToLibraryAsync(cameraReturn.assets[0].uri)
```

wrapped in a `try/catch` that logs and continues. The permission flow already requests media-library **write-only** permission via `ImagePicker.requestMediaLibraryPermissionsAsync(true)` before `takePhoto` runs, so no permission changes are needed.

Two identical copies of the hook exist:
- `src/hooks/useCameraCapture.js` — **live**, imported by `PhotosList` and `WaveDetail`
- `src/screens/PhotosList/hooks/useCameraCapture.js` — **orphaned** (no importers; only differs in relative import paths)

## Goals / Non-Goals

**Goals:**
- Captured photos and videos actually land in the device photo library again.
- Save stays best-effort and non-blocking for the upload pipeline (unchanged contract).
- Eliminate the orphaned duplicate hook so the fix cannot silently regress.

**Non-Goals:**
- No changes to permission UX, camera capture options, or upload pipeline.
- No migration to granular permissions (`requestPermissionsAsync(writeOnly)` directly) — out of scope; `ImagePicker.requestMediaLibraryPermissionsAsync` already covers it and keeps the diff minimal.
- No iOS/Android platform-specific save behavior beyond what the unified API provides.

## Decisions

### Decision 1: Use the new class-based API `Asset.create(filePath)`

The new API's way to persist a local file into the media library is `Asset.create(filePath: string, album?: Album): Promise<Asset>` (static, exported from `expo-media-library`). It is the direct successor of `saveToLibraryAsync`/`createAssetAsync` and works for both image and video URIs (the camera hook handles both — `cameraReturn.assets[0]` is used for photos and 5-second videos).

```js
import { Asset } from 'expo-media-library'
// ...
await Asset.create(cameraReturn.assets[0].uri)
```

**Alternatives considered:**
- `expo-media-library/legacy` (`saveToLibraryAsync`): the deprecation error comes from the *main* entry; the `/legacy` subpath still exists in 57.x but is explicitly marked legacy and may be removed in the next SDK — migrating onto it just postpones the same breakage.
- `createAssetAsync` from legacy: same issue, plus it returns an `Asset` we don't use.
- Keep the throw + catch: the save is currently a guaranteed no-op; not a fix.

### Decision 2: Keep the save best-effort, identical error contract

The `try/catch` around the save is preserved: log on failure, continue to `enqueueCapture`. Rationale: the upload pipeline depends on the temp URI, which is independent of the library save; a storage-full or permission-revocation edge case must not turn a successful capture into a lost photo. The success log line is kept so device logs still show save outcomes.

### Decision 3: Delete the orphaned `src/screens/PhotosList/hooks/useCameraCapture.js`

Verified: no file imports the PhotosList-local copy (both consumers import `../../hooks/useCameraCapture` → `src/hooks/useCameraCapture.js`; the local copy differs only in import depth). It carries the same broken call. Deleting it removes a future regression vector and a confusing near-duplicate. No import-path changes are needed in consumers.

## Risks / Trade-offs

- [`Asset.create` may reject for video URIs on some Android versions] → the existing best-effort catch means worst case is the pre-change behavior for videos (no library copy, upload still works); images are the primary path and are the reported regression.
- [Save happens before enqueue; a slow save delays the first upload step by the save duration] → unchanged from pre-regression behavior (the original code also awaited the save before enqueuing); acceptable.
- [Deleting the orphaned hook surprises a future reader] → it is unreachable code; the live hook's JSDoc/log prefixes make the canonical location obvious.

## Migration Plan

Client-only, no data or dependency changes. Ships with the next dev-client build / EAS Update. Rollback is a straight revert; the library-save gap returns (same as today) but the upload pipeline is unaffected either way.
