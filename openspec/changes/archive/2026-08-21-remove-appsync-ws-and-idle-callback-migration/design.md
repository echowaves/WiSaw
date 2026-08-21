## Context

See proposal.md for motivation. Current state relevant to the approach:

- `src/services/appsyncSubscription.js` is a self-contained module: one import site (`src/screens/WavesHub/index.js`, `subscribeToPhotoUploadComplete`), one outbound effect (`emitUploadComplete` on the local `uploadBus`), no other consumers. Its WS protocol is non-standard (no `connection_init` frame; auth passed via URL `header`/`payload` params) and its query does not match the backend `Subscription` type in `WiSaw.cdk/graphql/schema.graphql`.
- The local upload flow (`src/screens/PhotosList/upload/usePhotoUploader.js`) already calls `emitUploadComplete({ photo, waveUuid })` on success — the same bus event the WS was emitting. WavesHub's `subscribeToUploadComplete` effect (separate from the WS effect) already handles refresh.
- RN 0.86.2 ships `requestIdleCallback`/`cancelIdleCallback` (registered in `react-native/Libraries/Core/Timers/JSTimers.js`), which is the replacement RN's deprecation warning points at. Both current `InteractionManager.runAfterInteractions` call sites (`src/components/Photo/index.js`, `src/components/QuickActionsModal/index.js`) use the `task.cancel()` cleanup form.

## Goals / Non-Goals

**Goals:**
- Eliminate the infinite AppSync WS reconnect loop and its log/battery cost by deleting the broken path entirely.
- Keep upload-completion feed refresh working exactly as it does today for same-device uploads (it already flows through the local bus).
- Silence the `InteractionManager` deprecation warning by migrating to `requestIdleCallback` with equivalent cancel-on-unmount semantics.

**Non-Goals:**
- No cross-device real-time refresh replacement in this change (accepted gap; see Risks).
- No changes to the upload flow, the `uploadBus`, or the backend.
- No changes to the iOS 27 native/OS console noise (status bar deprecations, Core Animation, keyboard-controller size-class logs, PointerUI, CFNetwork) — none are addressable from JavaScript.
- No new dependencies.

## Decisions

### D1: Delete the WS path (Option A) rather than fix it (B) or re-scope per-photo (C)

Alternatives considered:
- **B — Fix the raw-WS client** (send `connection_init`, correct field `_notifyPhotoUploadComplete`, pass `photoId`, fix the `reconnectAttempts` reset in `onopen`): even done perfectly, the backend subscription is argument-scoped (`photoId: String!`), so it can only ever be opened *per known photo*, never globally. A global subscription — what `WavesHub` opens on mount — cannot exist against this schema.
- **C — Per-`photoId` subscription at upload time**: schema-compatible, but opens a socket per upload, overlaps the local bus path entirely for same-device uploads, and adds protocol complexity (init frame, per-photo auth) for no same-device benefit.
- **A — Remove it**: chosen. The only consumer is WavesHub; the local bus already emits the identical event for same-device uploads; and the feature as specified is structurally impossible against the backend. Deletion is the smallest correct surface.

### D2: Migrate to `requestIdleCallback`/`cancelIdleCallback`, not a plain `setTimeout`

- RN 0.86's deprecation message names `requestIdleCallback` explicitly, and it is a global in both the RN runtime and web — no platform shim needed.
- Mapping is mechanical: `const task = InteractionManager.runAfterInteractions(cb)` → `const handle = requestIdleCallback(cb)`; `task.cancel()` → `cancelIdleCallback(handle)`. The idle callback receives an `IdleDeadline` argument, which is ignored at both sites.
- A plain `setTimeout(0)` would also work but would lose the "run when the UI is quiet" semantics these fetches want (post-mount, post-open data loads) and would not match the deprecation guidance.

### D3: Scope of the WavesHub edit

Remove only the WS `useEffect` block (import + effect + its `uuid` guard). The adjacent `subscribeToUploadComplete` effect in the same component stays untouched — it is the surviving refresh path and is specified under the upload-orchestration capability.

## Risks / Trade-offs

- [Cross-device upload visibility gap] An upload from another device no longer refreshes this client in real time; it appears on next mount/focus refresh. → Accepted per user decision; a per-`photoId` AppSync subscription (Option C) is the documented future path if this becomes a product requirement.
- [`requestIdleCallback` timing vs `runAfterInteractions`] Idle callbacks defer until the main thread is idle; under sustained interaction the photo-details fetch could start slightly later than before. → Both call sites are secondary data loads (photo details after open/mount); a delayed start is imperceptible and strictly bounded by RN's idle scheduler. No functional dependency on the callback firing before user input.
- [Silent behavior assumption] The removal assumes no other screen or service depends on the WS emitting for cross-device cases. → Verified: `appsyncSubscription` has exactly one import site; the `uploadBus` consumer set (WavesHub, WaveDetail, useFeedLoader) is unchanged.
- [Spec drift] `wave-hub/spec.md` currently mandates the WS behavior. → This change ships a delta removing the three WS requirements and adding an explicit "no AppSync real-time connection" requirement, so the main spec stays coherent at archive time.

## Migration Plan

1. Single logical change, no data migration, no backend or API impact.
2. Rollback is a plain revert of the change; no persisted state is touched.
3. Manual validation after implementation: (a) console shows no `[AppSync WS]` lines and no `InteractionManager` deprecation warning; (b) uploading a photo on the device still refreshes the WavesHub list/ungrouped count; (c) quick-actions modal and expanded photo still load details after open.

## Open Questions

None. (The cross-device refresh gap is an accepted trade-off, recorded in Risks, not a deferrable unknown.)
