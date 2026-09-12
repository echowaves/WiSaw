# Design — fix-audit-0905-findings

## Context

See proposal.md for motivation. Implementation constraints that shape this design:

- `gqlClient` is a module singleton with a no-op cache (`src/consts.js`); all feed fetching goes through `useFeedLoader` → `PhotosList/reducer.js` action creators.
- Deep-link configuration lives entirely in `app.config.js` (`android.intentFilters` + iOS `associatedDomains`); routing itself is handled by the 4 existing trampoline routes.
- `useFeedLoader` is mounted in multiple screens (PhotosList, WaveDetail, FriendDetail) — the module-level `currentBatch` token is shared across all of them today.
- Backend (Wisaw.cdk) is a separate repo we must not modify; `getPhotoDetails` does not currently return `watchersCount`.
- Cyclomatic complexity budget per function: ≤ 8.

## Goals / Non-Goals

**Goals:**
- Fix the 8 behavior defects (Android wave deep links, transient pagination errors, per-instance batch token, watchersCount display, stable share-modal identity, upload content-type, location permission fallback, token log redaction).
- Remove verified dead code without behavior change.

**Non-Goals:**
- No backend code changes (a prompt for Wisaw.cdk is generated instead).
- No restructuring of the feed reducer, the trampoline deep-link routes, or the upload queue.
- No new dependencies.

## Decisions

### D1 — Android wave deep links: intentFilters in `app.config.js`
Add two `intentFilters` (ACTION_VIEW + BROWSABLE + DEFAULT, category-based, `autoVerify: true`) with data host `link.wisaw.com` and pathPrefix `/wave/join` and `/wave/invite`, mirroring the existing `/photos` and `/friends` entries.
- **Why**: The trampoline routes (`wave/join/[waveUuid]`, `wave/invite/[inviteToken]`) already exist and work on iOS; only the OS-level link association is missing on Android.
- **Alternative considered**: A single `/wave` pathPrefix — rejected because it would also match unrelated `/wave*` paths if any are added later; per-path prefixes match the existing granularity.
- **Note**: `autoVerify` requires the `assetlinks.json` on the domain (backend/web side). If the domain hasn't been verified, Android falls back to the app-chooser, which is acceptable per spec.

### D2 — Transient pagination errors: catch in reducer, distinguish error vs. empty
In `requestGeoPhotos` / `requestWatchedPhotos` (`src/screens/PhotosList/reducer.js`), replace the catch-all `return { photos: [], noMoreData: true }` with:
- `catch (err)` → return `{ photos: [], noMoreData: false, error: true }` (list preserved by the reducer's merge, retryable).
- Success with zero photos and no `nextPage` → `{ photos: [], noMoreData: true }` (true end-of-data, unchanged).
- Keep the existing empty-search auto-paging heuristic for the success path untouched.
- **Why**: The reducer's merge already appends `photos`, so an error response with `noMoreData: false` naturally preserves the list and leaves `stopLoading` false → next `handleLoadMore` retries.
- **Alternative considered**: Retry-with-backoff inside the hook — rejected as out of scope; user-driven retry via pull-to-refresh / scroll is sufficient and simpler.
- **Complexity**: Each action creator stays under the complexity-8 budget via early returns.

### D3 — Per-instance batch token in `useFeedLoader`
Replace `let currentBatch = Crypto.randomUUID()` (module scope) with `const batchRef = useRef(Crypto.randomUUID())`. All `currentBatch` comparisons inside `load()`/`reload()`/`handleLoadMore` use `batchRef.current`; `reload()` reassigns `batchRef.current`.
- **Why**: Two mounted feed instances (main feed + detail) currently share one token; a reload in one invalidates the other's in-flight responses.
- **Alternative considered**: `useRef` initialized lazily per call — a plain `useRef(Crypto.randomUUID())` runs `randomUUID` on every render (cheap, but allocates); acceptable, and simpler than a lazy-init guard.

### D4 — `watchersCount` display (frontend half)
- `src/components/Photo/reducer.js` `getPhotoDetails`: add `watchersCount` to the GraphQL query selection.
- `src/components/Photo/index.js` line ~744 already reads `photoDetails?.watchersCount || 0` — no change needed there; it becomes correct once the field is returned.
- **Backend dependency**: `getPhotoDetails` in Wisaw.cdk must add `watchersCount` (Int) to its query/resolver. Until the backend ships, the field is absent → the UI keeps showing 0 (graceful degradation, no crash). A copy-paste backend prompt will be generated; the frontend change is safe to land independently because Apollo simply returns `undefined` for the missing field.
- **Alternative considered**: Derive the count from the `comments` list — rejected, watchers ≠ commenters.

### D5 — Stable wave identity for `WaveShareModal`
In `src/components/WaveShareModal.js`, key the open/re-create effect on `wave?.waveUuid` (a string) instead of the `wave` object, and drop `wave` from the effect dependency array in favor of `waveUuid`. The `wave` prop continues to be read for `name`/`isOpen` but those reads happen at render, not in the effect gate.
- **Why**: `WaveDetail` constructs `{{ waveUuid, name: waveName }}` inline; any WaveDetail re-render creates a new object identity and re-fires the open effect → extra `createWaveInvite` calls. Keying on `waveUuid` makes the effect immune to prop identity churn while still re-firing when the user actually switches waves.
- **Alternative considered**: Memoize the object in `WaveDetail` (`useMemo`) — also works, but fixes only one call site; keying the modal on its stable identity is a stronger invariant that protects future callers.

### D6 — Upload content-type
In `photoUploadService.js` `uploadItem`, derive content type and key suffix from the actual encoded bytes: the encoder produces WebP, so send `Content-Type: image/webp`. Keep the key scheme (`${photoId}.upload`) unless the backend keys on extension — verify against the Wisaw.cdk upload URL generation before changing the key; if the key extension matters, change it to `${photoId}.webp` in the same change (flagged as a backend prompt if so).
- **Why**: Current code PUTs WebP bytes as `image/jpeg`, so any server or CDN that sniffs/validates content type mislabels the object.
- **Alternative considered**: Always encode JPEG instead — rejected; WebP is the chosen format for size.

### D7 — Location permission timeout → `unknown`
In `useLocationProvider.js`, when both `requestForegroundPermissionsAsync` and the `getForegroundPermissionsAsync` fallback time out, set `permStatus` to `'unknown'` instead of `'granted'` and do NOT start fast-seed/watchers. Re-run the permission check on the next foreground transition (`AppState` change to `active`) or the next explicit trigger.
- **Why**: An optimistic `granted` starts watchers that will fail or return stale data, and masks the Mac Catalyst hang case the timeout was added for.
- **Alternative considered**: Treat timeout as denied — rejected; the hang is a platform quirk, not a user decision, and denial UI (alert + open settings) would be wrong.
- **Spec impact**: This intentionally changes the existing spec line "if the fallback also times out, it SHALL assume `'granted'`" — the delta spec rewrites that requirement.

### D8 — Redact invite tokens in logs
Find all `console.*` call sites that interpolate an invite token and replace the token with `${token.slice(0, 4)}… (len ${token.length})`. Use parameterized format strings per the existing secure-logging requirement.
- **Why**: Tokens grant access to private waves; logs are not a secure channel.

### D9 — Dead code removal (behavior-neutral)
Delete: `index.js` (root; imports non-existent `./App`; real entry is `expo-router/entry` via `package.json` `main`), `test-import.js`, `branch.json`, `src/utils/waveStorage.js`, and `getPhotos()` in `PhotosList/reducer.js`.
- **Guard**: each deletion is preceded by a repo-wide grep for references (verified 0 at audit time); if any reference is found during apply, stop and report instead of deleting.

## Risks / Trade-offs

- [Android `autoVerify` not satisfied if `assetlinks.json` is missing] → falls back to app-chooser; no regression vs. today (browser). Web/backend team confirms assetlinks during rollout.
- [Backend `watchersCount` lands after frontend] → UI shows 0 until then (today's behavior); no error, no crash. Frontend change is independently shippable.
- [`unknown` permission state is new] → any code branching on `permStatus` must tolerate `'unknown'`; audit of `permStatus` consumers shows only the provider's own fast-seed gate, which now waits. Mitigation: grep for `permStatus`/`granted` consumers during apply.
- [Error retry could loop on persistent failures] → the existing consecutive-empty heuristic and `stopLoading` still apply to *successful* empties; failed pages simply don't advance `pageNumber`, so repeated user pulls retry the same page (bounded by user action, not automatic).
- [Batch token refactor touches the hot feed path] → covered by manual QA of infinite scroll + pull-to-refresh + search auto-paging on both feeds.

## Migration Plan

1. Land D1 (config-only) — rebuild Android dev build, verify app-chooser/app-open for wave links.
2. Land D2–D3, D5–D9 in one frontend change; D4 frontend half lands with them.
3. Generate and send the backend prompt (D4 `watchersCount` in `getPhotoDetails`, plus D6 key check) to the Wisaw.cdk workspace.
4. After backend ships, verify expanded-card bookmark count reflects real watchers.
- **Rollback**: each finding is independently revertable; the only cross-cutting coupling is D4 (frontend expects a field that is optional until backend ships).

## Open Questions

- Does the Wisaw.cdk upload URL generation key objects on file extension? If yes, D6 also renames `${photoId}.upload` → `${photoId}.webp` (answer comes with the backend prompt).
- Should the `'unknown'` location state surface a subtle UI hint (e.g., location banner) or stay silent until the next re-check? Current design: silent; the existing `location-drift-banner` capability can be extended later if product wants a visible state.
