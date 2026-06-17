## Context

The WiSaw codebase has grown to contain significant duplication across screens. The most impactful patterns are:

1. **Pagination**: PhotosList and BookmarksList use `useFeedLoader`, while WaveDetail and FriendDetail each maintain ~200 lines of manual pagination logic that is structurally identical.
2. **QuickActionsModalWrapper**: WaveDetail, FriendDetail, and PhotosList each inline a 18-line wrapper pattern (`React.memo` + `forwardRef` + `useImperativeHandle`) around `QuickActionsModal`. A zombie directory at `src/components/QuickActionsModalWrapper/` was created when extraction was started but abandoned.
3. **Notifications**: 50+ `Toast.show()` calls with inconsistent `topOffset` (60, 80, 100), `visibilityTime`, and positional options. 21+ `Alert.alert()` calls with no standardization.
4. **Modals**: Edit wave modal JSX is nearly identical in WaveDetail and WavesHub (both edit and create).
5. **Search debounce**: 4 identical `useEffect` blocks with 300ms timeout across WavesHub, FriendsList, MergeWaveModal, WaveSelectorModal.
6. **Constants**: `ROLE_CONFIG` appears in 3 files (WaveDetail, WaveMembers, WaveCard). `segmentConfig` appears in 4 screens (3 identical bookmarks variants, 1 different geo-feed variant).
7. **Shared components hidden in screen folders**: 5 hooks and 5 components under `src/screens/PhotosList/` that are genuinely shared across 4+ screens but live under PhotosList, making them hard to discover.

## Goals / Non-Goals

**Goals:**
- Consolidate `useFeedLoader` usage to WaveDetail and FriendDetail, eliminating ~400 lines of duplicated pagination logic
- Extract QuickActionsModalWrapper, EditWaveModal, useDebouncedSearch, and notification helpers into reusable, testable modules
- Move PhotosList internals to `src/components/` and `src/hooks/` to make them discoverable as shared resources
- Remove the zombie `QuickActionsModalWrapper/` directory

**Non-Goals:**
- Refactoring `getTheme(isDarkMode)` — the savings (~1 line per file) do not justify introducing a new dependency
- Refactoring `createStyles` — the `SHARED_STYLES` system uses a functional API that conflicts with theme overrides; this is a design discussion for a separate change
- TypeScript conversion of existing JavaScript files
- Backend API changes

## Decisions

### Decision 1: useFeedLoader accepts fetchFn + optional transformFn

**Choice:** `useFeedLoader` will accept a `fetchFn` callback and an optional `transformFn` for photo transformation.

**Rationale:** WaveDetail transforms photos with `createFrozenPhoto({ ...item, waveIsFrozen, waveViewerRole })` while FriendDetail uses the simpler `createFrozenPhoto(item)`. Making `transformFn` optional (defaulting to `createFrozenPhoto`) keeps the common case simple while supporting the edge case.

**Alternatives considered:**
- Always require `transformFn` — adds boilerplate for screens that use the default
- Accept a `photoConfig` object — more flexible but harder to use; `transformFn` is simpler

### Decision 2: Toast utility accepts both simple string arg and full options object

**Choice:** `showToast(message, options?)` where the first arg defaults to `text1` and `type` defaults to `'success'`.

**Rationale:** This allows incremental migration — screens that only need a success message can call `showToast('Wave saved')` instead of `Toast.show({ type: 'success', text1: 'Wave saved' })`. Complex cases can pass a full options object with overrides.

**Alternatives considered:**
- Require full options object — more verbose, higher migration cost
- Separate `showSuccessToast`, `showErrorToast` helpers — adds API surface but eliminates `type` from every call

### Decision 3: Alert utility uses confirmation callback pattern

**Choice:** `showConfirmAlert(title, message, onConfirm?, options?)` where `onConfirm` is the callback for the destructive/primary button.

**Rationale:** Covers the most common use case (delete/merge confirmations). For non-confirmation alerts (error messages, info dialogs), callers can still use `Alert.alert()` directly — the utility targets the pattern with the most duplication.

**Alternatives considered:**
- Replace all `Alert.alert()` calls — the address/location alerts have unique styling and different button layouts, making a universal wrapper harder to justify
- Always require `onConfirm` — breaks non-confirmation uses

### Decision 4: EditWaveModal accepts initialData object

**Choice:** `<EditWaveModal initialData={{ name: '', description: '' }} />` instead of separate `name` and `description` props.

**Rationale:** The modal contains two input fields. Passing them as an object makes it easy to pass `editingWave` directly (`initialData: editingWave ?? { name: '', description: '' }`) and keeps the API extensible if more fields are added later.

**Alternatives considered:**
- Separate `name` and `description` props — explicit but brittle; adding fields requires updating the component signature

### Decision 5: Move PhotosList internals — no circular dependency risk

**Choice:** Move `src/screens/PhotosList/components/` → `src/components/` and `src/screens/PhotosList/hooks/` → `src/hooks/`.

**Rationale:** None of the moved files import from their parent screen (`PhotosList/index.js`). The only imports between moved files are cross-references (e.g., PhotosListMasonry → PhotosListHeader), which remain unchanged since all sources move together.

### Decision 6: QuickActionsModalWrapper accepts optional callbacks

**Choice:** `QuickActionsModalWrapper` accepts `onPhotoDeleted` (required) and `onPhotoRemovedFromWave` (optional) as props.

**Rationale:** WaveDetail passes both callbacks, while FriendDetail and PhotosList only pass `onPhotoDeleted`. Making `onPhotoRemovedFromWave` optional avoids a complex prop interface while supporting the wave-specific use case.

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| WaveDetail/FriendDetail migration to useFeedLoader requires refactoring state management patterns | Each screen can be migrated independently and tested separately; the hook's API is backward-compatible with existing behavior |
| Toast utility change might affect toast positioning for screens that rely on non-default topOffset | Audit all existing calls before migration; screens using topOffset 80 or 100 will need to pass explicit overrides |
| Moving PhotosList internals requires updating 8+ import paths across screens and components | Use a find-and-replace pass; no functional changes, purely structural |
| EditWaveModal extraction might miss subtle differences between WaveDetail and WavesHub modals | Compare both modals line-by-line during implementation; the only known differences are variable names and cancel handler logic |
| useDebouncedSearch hook changes the debounce timing from 300ms (current) to 300ms (default) — should be transparent | Default delay matches existing behavior; only screens with custom delays (none found) would need override |

## Migration Plan

Phase 1 — Low-risk, low-effort (parallelizable):
1. Create `src/utils/showToast.js` and `src/utils/showConfirmAlert.ts`
2. Create `src/hooks/useDebouncedSearch.js`
3. Add `WAVE_ROLES`, `BOOKMARK_LAYOUT_CONFIG`, `GEO_FEED_LAYOUT_CONFIG` to `src/consts.js`
4. Delete `src/components/QuickActionsModalWrapper/` zombie directory

Phase 2 — Extract shared components:
5. Create `src/components/QuickActionsModalWrapper/index.js`
6. Create `src/components/EditWaveModal/index.js`
7. Move PhotosList components and hooks to `src/components/` and `src/hooks/`

Phase 3 — Screen migrations (sequential, screen-by-screen testing):
8. Migrate WaveDetail to useFeedLoader + QuickActionsModalWrapper + EditWaveModal
9. Migrate FriendDetail to useFeedLoader + QuickActionsModalWrapper
10. Migrate WavesHub to EditWaveModal + notification helpers
11. Migrate BookmarksList to useFeedLoader + QuickActionsModalWrapper
12. Migrate WavesHub, FriendsList, MergeWaveModal, WaveSelectorModal to useDebouncedSearch
13. Replace all Toast.show() and Alert.alert() calls with utility functions

## Open Questions

1. **Toast default topOffset:** The current codebase uses 60, 80, and 100. Defaulting to 60 works for most screens but PhotosList uses 100. Should the default be 80 as a compromise, or 60 with explicit overrides for screens that need it?
2. **Alert utility scope:** Should `showConfirmAlert` replace ALL `Alert.alert()` calls, or only confirmation dialogs? The address/location alerts in WaveSelectorModal and WaveSettings have slightly different messages but same structure — should they be extracted into `consts.js` instead?
3. **useFeedLoader abort control:** WaveDetail uses a `stopLoading` ref pattern that `useFeedLoader` already manages. After migration, WaveDetail can drop this ref entirely. Is there any screen that relies on the current `stopLoading` behavior outside of pagination (e.g., search results)?
