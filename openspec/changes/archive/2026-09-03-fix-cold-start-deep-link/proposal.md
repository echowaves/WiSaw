# Fix Cold-Start Deep Link Navigation

## Why

Tapping a WiSaw deep link (photo, friendship, or wave URL) when the app is **not already running** launches the app but lands on the home feed instead of the linked content. The same link works correctly when the app is already running (warm start). The existing `deep-linking` spec already mandates correct cold-start navigation, so this is a defect fix, not a behavior change.

Root cause: on cold start, two independent consumers race over the initial URL. expo-router's internal linking reads `getInitialURL()` first, tries to resolve the URL path (e.g. `photos/abc123`) against the file-based route table (which only knows `/shared/:photoId`), fails to match, and seeds the initial navigation state at `+not-found`. The app's manual handler in `app/_layout.tsx` then reads `Linking.getInitialURL()` a second time, 100ms later, and attempts `dismissAll()` + `replace('/')` + a delayed `push()` against a stack that `+not-found` is simultaneously redirecting — an unreliable sequence that loses the navigation. Warm start works because `Linking.addEventListener('url')` delivers the link independently of expo-router's initial-URL consumption, against a fully initialized stack.

**Additional requirement (clarified 2026-09-03):** on any deep link the app must open on the landing screen and then navigate to the linked content, so the **back button always returns to the landing screen**. A simple `<Redirect>` from the URL to the target does not satisfy this — it replaces the initial screen, leaving a single-screen stack with no home beneath it.

## What Changes

- Add **trampoline** route files under `app/` that match the actual deep-link URL paths (`photos/[photoId]`, `friends/[friendshipUuid]`, `wave/join/[waveUuid]`, `wave/invite/[inviteToken]`). On mount each trampoline resets the stack to home and pushes the real destination on top (`dismissAll` → `replace('/')` → delayed `push`), producing a `[home, target]` stack so back always returns home. expo-router's internal linking drives both cold and warm start through these trampolines.
- Remove the manual deep-link handler from `app/_layout.tsx` entirely (`navigateToDeepLink`, `handleDeepLink`, and the `Linking.addEventListener('url')` effect). expo-router's internal `useLinking` already subscribes to `url` events; a second manual listener would double-process warm links.
- Delete `src/utils/linkingHelper.js` and its test — with the manual handler gone, `parseDeepLink` has no callers. URL parsing is now handled exclusively by expo-router route matching.
- Update `app/+not-found.tsx` semantics: it becomes the true catch-all for malformed/unmatched URLs only.

No URL schemes, domains, intent filters, or AASA/assetlinks configuration changes. No backend changes.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

(none — the `deep-linking` spec requirements are unchanged; this change makes the implementation actually satisfy the existing "Cold Start Deep Link Handling" requirement. `skip_specs: true` is set in `.openspec.yaml`.)

## Impact

- `app/photos/[photoId].tsx`, `app/friends/[friendshipUuid].tsx`, `app/wave/join/[waveUuid].tsx`, `app/wave/invite/[inviteToken].tsx` — new trampoline route files.
- `app/_layout.tsx` — manual deep-link handler and `url` listener removed entirely.
- `app/+not-found.tsx` — comment updated; it is now a true catch-all for malformed URLs only.
- `src/utils/linkingHelper.js` + `src/utils/__tests__/linkingHelper.test.js` — deleted (no remaining callers).
- `app.config.js` intent filters — verify `wisaw://photos|friends|wave` custom-scheme paths still land on the new routes (custom-scheme host becomes the first path segment, e.g. `wisaw://photos/abc123` → path `photos/abc123` → `app/photos/[photoId]`).
- Verification required on both iOS (scene lifecycle, universal links) and Android (App Links + custom scheme), cold and warm.
