## Context

After the header simplification refactor, `PhotosList.reload()` is called by multiple triggers: `netAvailable` effect, identity-change subscription, `useFeedSearch` callbacks, and the `locationState.status` effect. Only the last one checks that location is ready. The others pass `location: null` through `getFetchParams()` → `feedReload()` → `requestGeoPhotos()`, which destructures `location.coords` and crashes.

## Goals / Non-Goals

**Goals:**
- Prevent the crash by ensuring `requestGeoPhotos` never receives `location: null`
- Fix at a single point so all current and future callers are protected

**Non-Goals:**
- Refactoring the location state flow or the `locationAtom` shape
- Adding retry/queue logic to defer reloads until location arrives
- Fixing `requestGeoPhotos` defensively (masking the problem downstream)

## Decisions

### Guard in `reload()` rather than in each caller or in `requestGeoPhotos`

**Chosen:** Add `if (!location) return` at the top of `PhotosList.reload()`.

**Alternatives considered:**
- **Guard in each effect/caller** — Brittle; every new caller must remember to check. Already missed in 3 places.
- **Guard in `requestGeoPhotos`** — Silently returns empty results, hiding the fact that location isn't ready. Callers think a reload happened when it didn't.
- **Guard in `useFeedLoader.reload`** — The hook is generic (used by StarredList too, which doesn't need location). Adding location awareness there leaks geo-feed concerns into shared code.

`reload()` is the right level: it's the PhotosList-specific wrapper that assembles geo-feed parameters. If location isn't available, a geo-feed reload is meaningless.

## Risks / Trade-offs

- **[Swallowed reload]** If `netAvailable` fires before location is ready, that reload is silently skipped. → The `locationState.status === 'ready'` effect will fire later and trigger the real first load, so no data is lost.
- **[No retry queue]** We don't queue skipped reloads. → Acceptable because the location-ready effect always runs and the identity-change / search triggers are user-initiated (location will be ready by then).
