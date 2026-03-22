## Context

PhotosList uses a `usePhotoExpansion` hook (`src/screens/PhotosList/hooks/usePhotoExpansion.js`) that encapsulates all photo expansion state, scroll tracking, and scroll-to-visible logic. WaveDetail reimplements ~60% of this hook manually (expandedPhotoIds, measuredHeights, handlePhotoToggle, etc.) but omits the scroll-related 40% (ensureItemVisible, handleScroll, performScroll, lastScrollY tracking).

Both screens render photos through `PhotosListMasonry` → `ExpandableThumb`. ExpandableThumb already calls `onRequestEnsureVisible` after expansion animation, but in WaveDetail this prop is `undefined`, making the call a no-op.

## Goals / Non-Goals

**Goals:**
- Make photo expansion scroll behavior in WaveDetail identical to PhotosList
- Reuse the existing `usePhotoExpansion` hook to avoid code duplication
- Remove WaveDetail's manual expansion state in favor of the hook

**Non-Goals:**
- No changes to the usePhotoExpansion hook itself
- No changes to ExpandableThumb or PhotosListMasonry
- No changes to PhotosList behavior

## Decisions

### 1. Reuse usePhotoExpansion hook (not duplicate scroll logic)

Import `usePhotoExpansion` from `../../PhotosList/hooks/usePhotoExpansion` in WaveDetail. This gives WaveDetail the same expansion state + scroll-to-visible behavior with zero duplication.

**Alternative considered**: Copy scroll logic directly into WaveDetail — rejected because the hook already exports everything needed and keeping one source of truth prevents drift.

### 2. Replace manual state, not wrap it

WaveDetail currently manages `expandedPhotoIds`, `measuredHeights`, `justCollapsedId`, `isPhotoExpanding`, `photoHeightRefs`, `lastExpandedIdRef` manually. These will all be replaced by the hook's return values. Any WaveDetail-specific state (photos, loading, wave data) stays untouched.

### 3. Pass onScroll and onRequestEnsureVisible to PhotosListMasonry

Two new props need to be wired to the existing `PhotosListMasonry` call: `onScroll={handleScroll}` for scroll position tracking, and `onRequestEnsureVisible={ensureItemVisible}` for the scroll-to-visible callback chain.

## Risks / Trade-offs

- [Cross-screen import] WaveDetail imports from PhotosList's hooks directory → Acceptable since the hook is already generic with no PhotosList-specific dependencies. If more screens need it, it could be moved to a shared location later.
- [Behavioral change] Users accustomed to no-scroll in WaveDetail may notice the new scroll → This is intentional and matches the expected UX from PhotosList.
