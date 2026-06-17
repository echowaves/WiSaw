## ADDED Requirements

### Requirement: PhotosList internals SHALL be moved to top-level directories

The system SHALL move the following files from `src/screens/PhotosList/components/` to `src/components/`:
- `PhotosListMasonry/index.js`
- `PhotosListFooter/index.js`
- `PhotosListHeader/index.js`
- `PhotosListEmptyState/index.js`

The system SHALL move the following files from `src/screens/PhotosList/hooks/` to `src/hooks/`:
- `useFeedLoader/index.js`
- `usePhotoExpansion/index.js`
- `useFeedSearch/index.js`
- `useCameraCapture/index.js`
- `usePendingAnimation/index.js`

#### Scenario: Import paths are updated
- **WHEN** screens import PhotosList components
- **THEN** they import from `src/components/PhotosListMasonry` instead of `../PhotosList/components/PhotosListMasonry`

#### Scenario: Import paths are updated for hooks
- **WHEN** screens import PhotosList hooks
- **THEN** they import from `src/hooks/useFeedLoader` instead of `../PhotosList/hooks/useFeedLoader`

#### Scenario: Internal cross-imports within the moved files are updated
- **WHEN** PhotosListMasonry imports PhotosListHeader
- **THEN** the import path is `src/components/PhotosListHeader`

### Requirement: QuickActionsModalWrapper SHALL be extracted to src/components

The system SHALL create `src/components/QuickActionsModalWrapper/index.js` that wraps `QuickActionsModal` with `React.memo`, `forwardRef`, `useImperativeHandle`, and longPressPhoto state management.

#### Scenario: WaveDetail uses QuickActionsModalWrapper
- **WHEN** WaveDetail renders `<QuickActionsModalWrapper ref={quickActionsRef} onPhotoDeleted={...} onPhotoRemovedFromWave={...} />`
- **THEN** the wrapper manages longPressPhoto state and forwards the ref

#### Scenario: FriendDetail uses QuickActionsModalWrapper
- **WHEN** FriendDetail renders `<QuickActionsModalWrapper ref={quickActionsRef} onPhotoDeleted={...} />`
- **THEN** the wrapper manages longPressPhoto state and forwards the ref

#### Scenario: PhotosList uses QuickActionsModalWrapper
- **WHEN** PhotosList renders `<QuickActionsModalWrapper>` (both instances)
- **THEN** the wrapper manages longPressPhoto state for both instances

### Requirement: QuickActionsModalWrapper zombie directory SHALL be removed

The system SHALL delete the empty `src/components/QuickActionsModalWrapper/` directory.

#### Scenario: Zombie directory is removed
- **WHEN** the cleanup is complete
- **THEN** `src/components/QuickActionsModalWrapper/` no longer exists
