# Design: Fix Cold-Start Deep Link Navigation

## Context

See proposal.md for motivation. Key facts shaping the approach:

- expo-router (57.0.14) consumes the initial URL itself: `useStore` → `getInitialURL()` → `extractExpoPathFromURL` → `getStateFromPath` against a route table generated from the `app/` file structure. There is no `+native-intent.tsx` file, so the app does not customize this flow.
- `extractExpoPathFromURL` does **not** filter by URL prefixes; it strips the origin/scheme and maps what remains onto the file-based route table. So `wisaw://photos/abc123` becomes path `photos/abc123` and `https://link.wisaw.com/photos/abc123` also becomes `photos/abc123`.
- The file route table knows `/shared/:photoId`, `/confirm-friendship/:friendshipUuid`, and `/waves/join` (paramless) — none of which match the incoming URL paths, so expo-router seeds the initial state at `+not-found`, which `app/+not-found.tsx` then redirects to `/` after 50ms.
- `app/_layout.tsx` separately reads `Linking.getInitialURL()` after `rootNavigationState?.key` appears, and runs `dismissAll()` + `replace('/')` + `setTimeout(push, 100)` — racing the `+not-found` redirect. On a fresh stack `dismissAll` is a no-op and the double `replace` interleaves nondeterministically.
- Warm start already works: `Linking.addEventListener('url')` → `handleDeepLink` → same `dismissAll/replace/push` sequence, but against a fully initialized stack where it is reliable.
- expo-router's forked `useLinking` (native) also subscribes to `Linking.addEventListener('url')` internally, so warm links are already delivered to the router's state machine — a separate manual listener would double-process them.
- **Product requirement (added 2026-09-03):** on any deep link (cold or warm), the app must open on the landing screen and then navigate to the linked content, so the **back button always returns to the landing screen**. A `<Redirect>` from a deep-link URL to the target does NOT satisfy this — it *replaces* the initial screen, leaving a single-screen stack with no home beneath it.

## Goals / Non-Goals

**Goals:**
- Cold-start deep links (all 4 URL families, both custom scheme and universal links, on iOS and Android) land on the correct screen with no manual navigation race.
- After any deep link, the navigation stack is `[home, target]` — back returns to the landing screen (cold and warm alike).
- Remove the dual-consumption race at its source, rather than tuning timing.

**Non-Goals:**
- No changes to URL domains, intent filters, AASA, or the `wisaw://` scheme.
- No changes to destination screens (`PhotosDetailsShared`, confirm-friendship, wave join).
- No spec changes (existing `deep-linking` spec describes the desired behavior; the back-to-home semantics are an implementation guarantee, not a new spec-level requirement).

## Decisions

### D1: Trampoline routes (revised 2026-09-03 — supersedes the original `<Redirect>` plan)

Add route files that mirror the deep-link URL paths. Each is a **trampoline**: on mount it runs the proven warm-start sequence — `router.dismissAll()` → `router.replace('/')` → `setTimeout(() => router.push(target), 100)` — producing a `[home, target]` stack:

```
app/photos/[photoId].tsx              → dismissAll, replace('/'), push('/shared/[photoId]')
app/friends/[friendshipUuid].tsx      → dismissAll, replace('/'), push('/confirm-friendship/[friendshipUuid]')
app/wave/join/[waveUuid].tsx          → dismissAll, replace('/'), push('/waves/join', { waveUuid })
app/wave/invite/[inviteToken].tsx     → dismissAll, replace('/'), push('/waves/join', { inviteToken })
```

expo-router's internal linking drives BOTH paths through these trampolines:
- **Cold start:** the initial URL resolves to the trampoline as the initial state; the trampoline's mount effect resets to home and pushes the target.
- **Warm start:** expo-router's internal `useLinking` resolves the incoming `url` event to the trampoline; the same mount effect runs.

Because the trampoline runs the exact sequence that already worked reliably for warm starts (against a real navigation stack), the cold-start case inherits that reliability — and because `replace('/')` runs before `push`, back always returns to home.

**Why trampolines over the alternatives:**
- *`<Redirect>` (original plan):* fails the back-to-home requirement — the redirect replaces the initial screen, so the stack is just `[target]` with nothing beneath it. Rejected on user requirement.
- *Keep the manual handler and disable expo-router's initial URL consumption:* fights the framework; warm links would still be double-processed by expo-router's internal `url` subscription.
- *Tune timing of the manual handler:* previous iterations (see `docs/APP_LOADING_DEEP_LINK_COMPLETE_FIX.md`) tried polling + timeouts; timing fixes on a race between two state machines are fragile.
- *Custom linking config mapping URL shapes to routes:* expo-router 57 does not accept a user linking config that overrides its generated route table on native. Trampoline files are the supported mechanism for URL-shape mismatches.

**Why over alternatives:**
- *Alternative A — keep the manual handler and disable expo-router's initial URL consumption* (override `getInitialURL` to return `''`): fights the framework; expo-router's `useLinking` also subscribes to the `url` event, so warm links would still be double-processed, and we'd be permanently patching around a framework behavior that changes per SDK release.
- *Alternative B — tune the timing of the manual handler* (longer delays, wait for `isFullyReady`): previous iterations of this bug (see `docs/APP_LOADING_DEEP_LINK_COMPLETE_FIX.md`) already tried polling + timeouts; timing fixes on a race between two state machines are fragile.
- *Alternative C — configure custom linking config on the root layout* (pass our `linkingConfig` mapping `photos/:photoId` → `shared/[photoId]`): expo-router 57 does not accept a user linking config that overrides its generated route table on native; the generated config from `getNavigationConfig` is authoritative. Redirect files are the supported mechanism for URL-shape mismatches.

**Custom-scheme note:** `wisaw://photos/abc123` yields host `photos`, path `/abc123`; expo-router's `extractExactPathFromURL` concatenates host + pathname → `photos/abc123`, which matches `app/photos/[photoId]`. The existing intent filters (`link.wisaw.com/photos`, `wisaw.com/photos`, `friendships` paths, and bare `wisaw://` scheme) all funnel into these four route shapes. The `/friendships/*` path prefix (currently in intent filters but not parsed by `parseDeepLink`) will hit `+not-found` → home, same as today; out of scope.

### D2: Remove the manual deep-link handler entirely (revised 2026-09-03)

Delete `navigateToDeepLink`, `handleDeepLink`, and the `Linking.addEventListener('url')` effect from `app/_layout.tsx`. expo-router's forked `useLinking` (native) already subscribes to the `url` event internally and resolves warm links through the trampoline routes — a second manual listener would double-process every warm link (double reset + double push). With the trampolines, cold and warm start share one code path, and the "link always opens fresh from home" semantics live in the trampolines themselves.

**Implementation outcome (verified in code, needs device confirmation):** the manual handler is removed; `app/_layout.tsx` no longer imports `Linking`, `parseDeepLink`, `router`, `useRootNavigationState`, or `showErrorToast` for deep-link purposes.

### D3: Delete `src/utils/linkingHelper.js` entirely (revised 2026-09-03)

With the manual handler gone, `parseDeepLink` has zero callers — the entire module (plus `src/utils/__tests__/linkingHelper.test.js`) is deleted. URL parsing now happens exclusively in expo-router's route matching.

### D4: `+not-found` becomes a true catch-all

With real routes matching the deep-link URL shapes, `+not-found` only sees malformed/unmatched URLs. Its redirect-to-home behavior is kept and is now also the fallback for the trampolines' empty-param guard.

## Risks / Trade-offs

- [Trampoline files add 4 routes to the route table] → They render an empty `View` for ~100ms then navigate; no meaningful UI. Test that they don't interfere with normal in-app navigation (no accidental matches for other paths).
- [`/waves/join` receives params via query string instead of path param] → RESOLVED: `app/(drawer)/waves/join.tsx` reads `waveUuid`/`inviteToken` via `useLocalSearchParams`, which works for both query params and path params.
- [Cold-start timing: trampoline `dismissAll`/`replace` runs inside a `useEffect` after first paint] → Same 100ms-delay pattern already proven for warm starts; the trampoline's empty `View` flashes briefly at worst. If a flash is visible on device, the `withAnchor` option or a splash-screen overlap can be evaluated then (does not change the approach).
- [Warm-link double-processing] → ELIMINATED by design: the manual listener is removed (D2), so only expo-router's internal subscription handles `url` events.
- [iOS scene-lifecycle plugin (`plugins/with-ios-scene-lifecycle`) forwards cold links to `RCTLinkingManager`] → Behavior verified by the plugin's design comments, but cold-start universal links must be re-verified on a real iOS device after the change (the plugin explicitly keeps `Linking.getInitialURL` working).
- [Android App Links autoVerify] → No intent-filter changes, so no re-verification needed; but cold start via `wisaw://` custom scheme must be tested since its host becomes the first path segment.

## Open Questions

(none — both original questions resolved: wave join accepts query params; manual handler removed.)
