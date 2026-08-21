# Design — Clickable Tag Search

## Context

The search-trigger plumbing already exists end to end for the feed: `photoSearchBus` (event emitter), `useFeedSearch` (subscribes, populates the term, expands the SearchFab, calls `onSearch`), and `PhotosList.reload(term)` (backend full-text over recognitions + comments). The `Photo` card already calls `onTriggerSearch` from all three chip kinds (AI Labels, AI Text, Moderation).

The gaps are purely in wiring and affordance:

- `PhotosListMasonry` receives `onTriggerSearch` (declared at line 26) but never forwards it to the expanded `<Photo>`, so the feed's expanded-card chips are dead taps.
- `PhotosDetailsShared` passes `onTriggerSearch={emitPhotoSearch}`, so its chips fire a bus event with no visible effect (the feed lives beneath the stack); on a cold-start deep link there is no feed listener at all.
- `WaveDetail` and `FriendDetail` pass no prop, so their chips are dead taps (their feeds have no search support — out of scope).
- `useFeedSearch`'s `onBeforeSearch` hook exists and is currently a no-op in `PhotosList`.

## Goals / Non-Goals

**Goals:**
- Make AI Label and AI Text chips tappable in the feed's expanded card, triggering an in-context feed search.
- Collapse the expanded card when a tag search fires, so the visible search bar and filtered results are the focus.
- Render all chips non-interactive (no press affordance) in non-feed contexts.
- Exclude moderation chips from tap-to-search everywhere.

**Non-Goals:**
- Search support inside wave or friend feeds (requires backend `searchTerm` on those queries — separate feature).
- Navigating from non-feed screens to the global feed with a pre-filled search (rejected alternative — see Decisions).
- Changing the backend search behavior (already full-text over recognitions/comments, which matches tag terms).
- Changing how manual (typed) search input validation works.

## Decisions

### D1: In-context feed search via the existing `photoSearchBus`
The tag tap reuses the existing bus → `useFeedSearch` → `reload(term)` path. No new mechanism, no navigation.

*Alternative rejected:* `router.push('/', { search: term })` from non-feed screens. Rejected because the user wants the search to happen "in context" — and the only contexts where a search bar exists are feed screens, where the bus already works locally.

### D2: Interactivity gated on prop presence
`Photo` renders AI Label / AI Text chips as `TouchableOpacity` only when `typeof onTriggerSearch === 'function'`; otherwise plain `View`. Moderation chips are always plain `View`.

*Why:* One rule covers all four contexts without per-screen wiring — feed screens pass the prop (interactive), shared/wave/friend screens don't (plain). It also removes the lying `activeOpacity` on chips that currently do nothing.

*Alternative rejected:* Keep `TouchableOpacity` everywhere and no-op the handler in non-feed contexts. Rejected because chips would still show press feedback while doing nothing.

### D3: Auto-collapse via `usePhotoExpansion` + the existing `onBeforeSearch` hook
Expose `collapseExpanded()` (sets `expandedPhotoId` to `null`) from `usePhotoExpansion`, and have `PhotosList` pass `onBeforeSearch: () => collapseExpanded()`. `useFeedSearch` already calls `onBeforeSearch()` inside its bus-event effect, immediately before populating the term and expanding the SearchFab — so the collapse and the search-bar visibility land in the same update cycle, satisfying "collapse as long as the search bar with the new term is visible."

*Why not a new prop on `Photo`:* The collapse is a feed-level reaction to the search event, not a property of the chip; the existing `onBeforeSearch` hook is the designated extension point for exactly this.

*Alternative rejected:* Keep the card expanded (it's a match, so it's a valid top result). Rejected per product decision; also avoids the stale-state edge where clearing the search later could resurrect the photo already expanded.

### D4: Remove the silent emit from `PhotosDetailsShared`
Drop `onTriggerSearch={emitPhotoSearch}` from the shared-photo detail screen. With D2, its chips render plain.

*Why:* The current behavior is the worst of both worlds — chips look pressable (`activeOpacity`) but the tap silently re-filters a feed the user can't see, surprising them on the next feed visit.

## Risks / Trade-offs

- [Tag terms bypass the 3-character `canSubmit` gate of the SearchFab] → Intentional: a clicked tag is an explicit user intent, so even short terms (e.g., "AI") search. The manual-typing gate is unchanged.
- [Expanded card collapses before the filtered feed loads, so the user briefly sees an empty/loading list with no expanded photo] → Acceptable; the visible search bar with the term provides the context. The photo will reappear in results as a collapsed thumb.
- [`renderMasonryItem`'s `useCallback` dependency list currently omits `onTriggerSearch`] → Adding it changes the memo signature; the expanded branch will re-create on prop identity changes. `triggerSearch` from `useFeedSearch` is itself `useCallback([])`, so the prop is stable and there is no meaningful re-render cost.
- [A tap that triggers search also fires the chip's own `activeOpacity` press animation] → No action; standard touch feedback, and it disappears in non-feed contexts with D2.

## Migration Plan

Single release, no data migration. Rollback = revert the change; no persisted state is affected. The removed `onTriggerSearch` from `PhotosDetailsShared` is a dead code path (no observable behavior to preserve).

## Open Questions

None.
