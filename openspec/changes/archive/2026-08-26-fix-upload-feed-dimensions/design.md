## Context

See proposal.md — Why, for the motivation and the full root-cause trace. The constraints that shape the approach:

- The upload queue is a JSON array persisted via `expo-storage` (`PENDING_UPLOADS` key); queue items are enriched in place during processing (`updateQueueItem` replaces an entry with a version carrying `localImgUrl`, `localThumbUrl`, `photo`), so identity by object equality is inherently fragile.
- `photoId` (a `uuidv4` minted at enqueue time in `queueFileForUpload`) is unique per item and stable across enrichment — it is the natural stable key.
- `processCompleteUpload` already has every enrichment it needs before emitting; the bug is purely in the *queue lifecycle* (removal + re-entrancy), not in dimension extraction.
- The masonry library (`expo-masonry-layout` 57.0.0, column mode) reads `item.width`/`item.height` for tile aspect ratio and falls back to `aspectRatioFallbacks` (default: 7 id-seeded ratios) when dimensions are missing. The app's `BOOKMARK_LAYOUT_CONFIG` already declares `aspectRatioFallbacks: [1.0]` but `PhotosListMasonry` never forwards it — only `spacing` is used.
- Backend is out of scope (separate repo, own deployment cycle). `width`/`height` are already nullable `Int` fields on the `Photo` type, so adding them to a query selection is a client-only change.

## Goals / Non-Goals

**Goals:**
- A successfully uploaded queue item is removed exactly once and emitted exactly once, with a dimensioned photo, in every pipeline outcome.
- Dimensionless feed photos (if any still slip through) degrade to the configured square fallback instead of id-seeded random ratios.
- Concurrent `processQueue` triggers cannot interleave.

**Non-Goals:**
- No backend changes (no `createPhoto` width/height parameters, no schema changes).
- No change to dimension *source* preference (`ensurePhotoDimensions` already prefers the original camera file since `2026-07-11-fix-upload-image-scaling`).
- No change to cross-device live refresh (known gap, deliberately out of scope — see `remove-appsync-ws` decision).
- No changes to `PhotoSelectionMode`'s own masonry config (it sets `aspectRatioFallbacks` explicitly already).

## Decisions

### Decision 1: Remove (and update) queue items by `photoId`, not whole-object JSON equality

`removeFromQueue` and `updateQueueItem` in `photoUploadService.js` match stored entries with `JSON.stringify(stored) === JSON.stringify(argument)`. Both call sites pass the pre-processing `currentItem` snapshot, so after `processCompleteUpload` enriches the stored entry, neither matches — removal fails (the reported bug) and a concurrent update would also silently fail.

**Choice:** both helpers extract `photoId` from the argument item and match stored entries by `photoId` equality. Call sites are unchanged (they all pass the full item object).

**Alternatives considered:**
- Pass `processedItem` from `processCompleteUpload` out for removal: leaks internal pipeline state to the hook and still leaves `updateQueueItem`'s update race unfixed; also `processCompleteUpload` returns only the photo, not the item.
- Key the queue by index: indices shift as items are removed; fragile.
- Store the queue as a `Map` keyed by photoId: changes the persisted storage shape (migration burden for in-flight queues across an app update) for no behavioral gain over filtering by key.

### Decision 2: Add `width`/`height` to the `getPhotoById` selection

The `ACTIVE` re-entry path returns the photo straight from `getPhotoById`, whose selection today omits `width`/`height`. With Decision 1 the re-pass should no longer happen, but this is cheap, makes the ACTIVE path correct by construction (defense in depth), and also fixes any future path that returns an existing photo.

**Choice:** add `width` and `height` to the `getPhotoById` query selection in `photoUploadService.js`. The `Photo` type declares both as nullable `Int`, so no schema change is needed. Downstream, `ensurePhotoDimensions` already treats null/missing dimensions as "needs local extraction", so the INACTIVE/MISSING paths keep their local fallback behavior.

**Alternatives considered:**
- Re-run `ensurePhotoDimensions` on the ACTIVE path: works, but reads local files (possibly deleted after app restart) for a photo whose authoritative dimensions are in the DB — slower and less correct.

### Decision 3: Re-entrancy guard via the existing `processingRef`

`processingRef` is set true at the start of `processQueue` and reset in both `finally` blocks, but never *checked*, so `enqueueCapture`, the `netAvailable` effect, and screen reloads can start overlapping passes.

**Choice:** at the top of `processQueue`, `if (processingRef.current) return`. To close the millisecond window where an enqueue lands after the in-flight pass's final queue re-read but before the `finally` clears the flag, the guarded no-op path re-reads the queue and, if non-empty, schedules a short retry via the existing `scheduleRetry(RETRY_DELAY_MS)` before returning.

**Alternatives considered:**
- A mutex with a wait queue: overkill for a single-provider, single-queue uploader.
- Debouncing all triggers: changes timing semantics of the existing backoff/pause logic.

### Decision 4: Forward `aspectRatioFallbacks` from `segmentConfig` in `PhotosListMasonry`

`ExpoMasonryLayout` accepts `aspectRatioFallbacks`; `PhotosListMasonry` currently forwards only `spacing` from `segmentConfig`, so the library's 7-ratio id-seeded default applies to any photo missing dimensions. `BOOKMARK_LAYOUT_CONFIG.aspectRatioFallbacks` is `[1.0]` (square) — the originally intended fallback per the `photo-feed` and `constants` specs.

**Choice:** pass `aspectRatioFallbacks={segmentConfig.aspectRatioFallbacks}` on the `ExpoMasonryLayout` usage in `PhotosListMasonry`. `baseHeight` is not forwarded because column mode computes tile height from column width and aspect ratio (baseHeight is only used by row mode and the dimension-calculation helper). Screens that pass their own `segmentConfig` (e.g., `PhotoSelectionMode` already sets the prop directly and is unaffected) keep their behavior.

**Alternatives considered:**
- Fix only at the source (Decisions 1–2) and leave the fallback random: the visible glitch reappears on any future dimensionless emit; the configured fallback exists precisely for this case.
- Compute tile aspect ratio in `renderMasonryItem` and pass `preserveItemDimensions`: changes library layout semantics (tiles would use photo pixel dimensions, breaking the fixed column-width grid).

### Decision 5: Upload-completion dedup prefers the dimensioned entry

`useFeedLoader`'s upload handler prepends the incoming frozen photo and drops later duplicates with the same `id` (first occurrence wins). A dimensionless re-emit therefore evicts a good entry.

**Choice:** in the upload-completion handler, before prepending, check for an existing list entry with the same `id`; if the existing entry has valid positive `width`/`height` and the incoming photo does not, skip the incoming photo entirely. All other cases (new id, incoming has dimensions) keep current prepend-and-dedup behavior. The check reads the frozen proxy's properties (reads are allowed; only writes are guarded).

**Alternatives considered:**
- Replace the existing entry when the incoming one has dimensions: the existing entry came from a server fetch or an earlier correct emit; replacing adds churn for no benefit since both are dimensioned.
- Move dedup into `createFrozenPhoto`: couples a dimension policy to a generic immutability helper used for all photos.

## Risks / Trade-offs

- [Key-matching deletes an item the caller didn't mean to] → `photoId` is a `uuidv4` minted at enqueue; collision is negligible. All existing `removeFromQueue` call sites pass items that carry the `photoId` of the entry they intend to remove.
- [Guarded no-op drops a fresh enqueue in the sub-millisecond window after a pass's final queue read] → the guarded path re-reads the queue and schedules a retry when non-empty (Decision 3); worst case the photo uploads one `RETRY_DELAY_MS` (2 s) later, matching existing retry UX.
- [Square fallback makes a genuinely dimensionless photo look square until reload] → acceptable: square is the configured, spec'd fallback (`aspectRatioFallbacks: [1.0]` in `BOOKMARK_LAYOUT_CONFIG`), and Decisions 1–3 make dimensionless emits a non-event.
- [In-flight persisted queues from an older app version] → queue items have carried `photoId` since the UUID-based deduplication work; no queue-item migration is required.
- [Frozen-photo proxies in DEV break the dedup check] → the dedup check only *reads* `width`/`height`; the dev Proxy traps `set`/`defineProperty`/`deleteProperty`, not `get`.

## Migration Plan

Client-only, no data migration. Ships with the next dev-client build / EAS Update. Rollback is a straight revert of the change; queue storage shape is unchanged.
