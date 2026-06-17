## Why

The WiSaw codebase has accumulated significant code duplication across screens — nearly 2,000 lines of repeated patterns in pagination, notifications, modals, theme access, and layout configuration. This duplication makes bug fixes error-prone (fix one screen, miss another), increases onboarding time, and hinders consistent UX across the app.

## What Changes

- Extract `useFeedLoader` hook from PhotosList and apply it to WaveDetail and FriendDetail, eliminating manual pagination logic in both screens
- Consolidate `QuickActionsModalWrapper` inline copies across WaveDetail, FriendDetail, and PhotosList into a shared component in `src/components/`
- Create `showToast()` utility with standardized defaults (topOffset, visibilityTime) to replace 50+ inconsistent `Toast.show()` calls
- Create `showConfirmAlert()` utility to standardize `Alert.alert()` usage across the codebase
- Extract the edit wave modal (present in WaveDetail, WavesHub, and WavesHub's create modal) into a reusable `<EditWaveModal>` component
- Extract shared constants (`ROLE_CONFIG`, `segmentConfig`) from `src/consts.js`
- Extract search debounce pattern into a `useDebouncedSearch()` hook
- Move PhotosList internals (5 hooks, 5 components) from `src/screens/PhotosList/` to `src/hooks/` and `src/components/` to make them discoverable as shared resources
- Remove the empty `src/components/QuickActionsModalWrapper/` zombie directory

## Capabilities

### New Capabilities

- `notification-helpers`: Standardized `showToast()` and `showConfirmAlert()` utility functions with consistent defaults for toast positioning, visibility timing, and confirmation dialogs
- `pagination-hook`: Unified `useFeedLoader` hook that handles pagination, loading states, upload/photo-subscription deduplication, and abort control, usable across any photo-listing screen
- `wave-edit-modal`: Reusable `<EditWaveModal>` component for creating and editing waves, replacing inline modal JSX in WaveDetail and WavesHub
- `debounce-hook`: Reusable `useDebouncedSearch()` hook for search input debouncing, replacing identical `useEffect` blocks across WavesHub, FriendsList, MergeWaveModal, and WaveSelectorModal

### Modified Capabilities

- `shared-components`: Move PhotosList internal components (PhotosListMasonry, PhotosListFooter, PhotosListHeader, PhotosListEmptyState, PendingPhotosBanner) and hooks (useFeedLoader, usePhotoExpansion, useFeedSearch, useCameraCapture, usePendingAnimation) to top-level `src/components/` and `src/hooks/` directories
- `constants`: Consolidate `ROLE_CONFIG` and `segmentConfig` definitions into `src/consts.js`
- `theme-access`: Deprecate the `getTheme(isDarkMode)` pattern in favor of a `useTheme()` hook (optional, low-impact)

## Impact

**Affected code:**
- `src/screens/PhotosList/` — 5 hooks and 5 components relocated
- `src/screens/WaveDetail/index.js` — adopt useFeedLoader, extract QuickActionsModalWrapper, extract edit modal
- `src/screens/FriendDetail/index.js` — adopt useFeedLoader, extract QuickActionsModalWrapper
- `src/screens/WavesHub/index.js` — extract edit modal, consolidate alert/toast patterns
- `src/screens/BookmarksList/index.js` — adopt useFeedLoader, extract QuickActionsModalWrapper
- `src/screens/FriendsList/index.js` — standardize toast/alert usage
- `src/screens/WaveMembers/index.js` — adopt shared ROLE_CONFIG
- `src/screens/WaveSelectorModal/index.js` — adopt useDebouncedSearch, consolidate alerts
- `src/screens/WaveSettings/index.js` — consolidate alerts
- New files: `src/utils/showToast.js`, `src/utils/showConfirmAlert.ts`, `src/hooks/useDebouncedSearch.ts`, `src/components/EditWaveModal/index.js`, `src/components/QuickActionsModalWrapper/index.js`

**No API changes:** All changes are internal refactoring. No GraphQL queries, mutations, or external APIs are modified.

**No new dependencies.**
