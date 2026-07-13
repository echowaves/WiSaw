## Purpose

This specification defines the global upload banner — a fixed-position overlay that shows pending upload status across all drawer screens.

## Requirements

### Requirement: Global upload banner mounts at drawer level

The system SHALL provide a `GlobalUploadBanner` component that mounts inside `UploadProvider` alongside the Drawer in `app/(drawer)/_layout.tsx`.

#### Scenario: Banner mounts when provider renders
- **WHEN** the Drawer layout renders
- **THEN** `GlobalUploadBanner` SHALL be rendered as a sibling to the Drawer inside `UploadProvider`

#### Scenario: Banner is not rendered outside drawer
- **WHEN** a non-drawer screen renders (e.g., pinch modal, modal-input, tandc-modal)
- **THEN** the global banner SHALL NOT be visible

### Requirement: Banner reads UploadContext and network state directly

The `GlobalUploadBanner` SHALL consume `UploadContext` and `STATE.netAvailable` directly. It SHALL NOT receive upload state as props from a parent screen. The banner SHALL read `STATE.netAvailable` via `useAtomValue` from the Jotai state module, NOT by destructuring it from `UploadContext`.

#### Scenario: Banner consumes context
- **WHEN** the banner renders
- **THEN** it SHALL call `useContext(UploadContext)` to get `pendingPhotos`, `isUploading`, and `clearPendingQueue`
- **THEN** it SHALL read `STATE.netAvailable` via `useAtomValue` from the Jotai state module

#### Scenario: Status label reflects network and upload state
- **WHEN** `pendingPhotos` is non-empty and `netAvailable` is `true` and `isUploading` is `true`
- **THEN** the status label SHALL display "uploading"
- **WHEN** `pendingPhotos` is non-empty and `netAvailable` is `true` and `isUploading` is `false`
- **THEN** the status label SHALL display "ready to upload"
- **WHEN** `pendingPhotos` is non-empty and `netAvailable` is `false`
- **THEN** the status label SHALL display "waiting to upload"

#### Scenario: Icon animation responds to network state
- **WHEN** `pendingPhotos` is non-empty and `netAvailable` is `true`
- **THEN** the upload icon SHALL pulse via `Animated.loop` animation
- **WHEN** `pendingPhotos` is non-empty and `netAvailable` is `false`
- **THEN** the upload icon SHALL NOT pulse and SHALL use the disabled color theme

#### Scenario: Banner hides when no pending uploads
- **WHEN** `pendingPhotos` is empty
- **THEN** the banner SHALL return null and publish `bannerHeightAtom` as 0

### Requirement: Banner uses fixed absolute positioning

The `GlobalUploadBanner` SHALL use `position: 'absolute'` anchored to the top of the screen below the safe area inset.

#### Scenario: Banner positions below safe area
- **WHEN** the banner is visible
- **THEN** its top position SHALL equal `useSafeAreaInsets().top`
- **THEN** screen content SHALL NOT be layout-shifted by the banner

#### Scenario: Banner width spans full screen
- **WHEN** the banner is visible
- **THEN** it SHALL span the full screen width with horizontal margins (matching existing PendingPhotosBanner styling)

### Requirement: Banner publishes height via atom for screen padding

The system SHALL provide a `bannerHeightAtom` (Jotai writable atom). The `GlobalUploadBanner` SHALL update this atom with its measured height when visible and 0 when hidden.

#### Scenario: Banner sets height atom on layout
- **WHEN** the banner becomes visible (pending photos added)
- **THEN** it SHALL measure its height via `onLayout` and write the value to `bannerHeightAtom`

#### Scenario: Banner clears height atom when hidden
- **WHEN** the banner becomes hidden (queue empty)
- **THEN** it SHALL write 0 to `bannerHeightAtom`

#### Scenario: Screen reads banner height for padding
- **WHEN** a drawer screen renders
- **THEN** it SHALL read `bannerHeightAtom` and apply it as top padding above its content (AppHeader)

### Requirement: Banner handles toast offset internally

The `GlobalUploadBanner` SHALL compute its own toast top offset for toast notifications triggered by banner actions (e.g., clear queue).

#### Scenario: Toast appears below banner
- **WHEN** the user confirms clearing the upload queue from the banner
- **THEN** the toast SHALL appear below the banner using `safeAreaInsets.top + bannerHeight + 10`

### Requirement: All drawer screens consume bannerHeightAtom

All drawer screens (PhotosList, WaveDetail, WavesHub, BookmarksList, FriendsList) SHALL consume `bannerHeightAtom` and apply it as top padding.

#### Scenario: Existing screens add banner padding
- **WHEN** PhotosList, WaveDetail, or WavesHub renders
- **THEN** it SHALL read `bannerHeightAtom` and apply it as padding above the AppHeader

#### Scenario: Previously missing screens add banner padding
- **WHEN** BookmarksList or FriendsList renders
- **THEN** it SHALL read `bannerHeightAtom` and apply it as padding above the AppHeader

### Requirement: Per-screen banner rendering is removed

The `PendingPhotosBanner` component and `usePendingAnimation` hook SHALL be deleted. All inline renders of `PendingPhotosBanner` in PhotosList, WaveDetail, and WavesHub SHALL be removed.

#### Scenario: PhotosList no longer renders banner
- **WHEN** PhotosList renders
- **THEN** it SHALL NOT import or render `PendingPhotosBanner`
- **THEN** it SHALL NOT call `usePendingAnimation`

#### Scenario: WaveDetail no longer renders banner
- **WHEN** WaveDetail renders
- **THEN** it SHALL NOT import or render `PendingPhotosBanner`

#### Scenario: WavesHub no longer renders banner
- **WHEN** WavesHub renders
- **THEN** it SHALL NOT import or render `PendingPhotosBanner`

#### Scenario: Deleted files are removed
- **WHEN** the change is applied
- **THEN** `src/screens/PhotosList/components/PendingPhotosBanner.js` SHALL be deleted
- **THEN** `src/hooks/usePendingAnimation.js` SHALL be deleted
