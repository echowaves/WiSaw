## Purpose
This specification defines expected user-visible behavior, constraints, and validation scenarios for wave header icon in WiSaw.

## ADDED Capabilities

- `auto-group-badge-multi-screen`: Badge updates simultaneously across WavesHub, photo feed header, and drawer when auto-grouping completes

## MODIFIED Capabilities

- `auto-group-photos`: Badge updates now trigger across multiple screens (WavesHub, photo feed header, drawer) when auto-grouping completes
- `waves-header-badge`: Badge on photo feed header now stays fresh without requiring navigation
- `drawer-waves-badge`: Badge on Waves drawer icon updates via atom change detection

## MODIFIED Requirements

## Requirements

### Requirement: Badge Updates on Photo Feed Header
The system SHALL update the wave badge indicator on the photo feed header (WaveHeaderIcon) when auto-grouping completes, whether triggered manually or automatically.

#### Scenario: Badge updates after manual auto-group
- **WHEN** user taps "Auto-Group" button in WavesHub
- **AND** auto-grouping completes
- **THEN** badge on photo feed header updates to reflect new ungrouped photo count
- **AND** icon color updates (coral if waves exist, grey otherwise)

#### Scenario: Badge updates after automatic post-upload auto-group
- **WHEN** photo upload completes and auto-group flushes ungrouped photos
- **AND** auto-grouping completes after 5s delay
- **THEN** badge on photo feed header updates without user navigation
- **AND** badge shows accurate count even if user remains on photo feed

#### Scenario: Badge updates when not on photo feed
- **WHEN** auto-group completes while user is on Waves screen
- **AND** user then navigates to photo feed
- **THEN** badge shows correct updated count

#### Scenario: Badge updates when zero ungrouped photos
- **WHEN** auto-grouping groups all ungrouped photos (count becomes 0)
- **THEN** badge disappears from photo feed header
- **AND** icon color changes to coral (waves now exist)

### Requirement: Badge Updates on Waves Screen
The system SHALL update the badge on WavesHub when auto-grouping completes.

#### Scenario: Badge updates on Waves screen after manual trigger
- **WHEN** user triggers auto-group on Waves screen
- **AND** auto-group completes
- **THEN** badge on WavesHub updates immediately

#### Scenario: Badge updates on Waves screen after automatic trigger
- **WHEN** auto-group completes automatically after upload
- **AND** user is on Waves screen
- **THEN** badge updates without requiring refresh

### Requirement: Badge Updates on Waves Drawer Icon
The system SHALL update the badge on the Waves drawer icon when auto-grouping completes.

#### Scenario: Badge updates on drawer
- **WHEN** auto-group completes (manual or automatic)
- **THEN** badge on Waves drawer icon updates
- **AND** user sees updated count when opening drawer

### Requirement: Event Emission
The system SHALL emit `emitAutoGroupDone()` after auto-grouping completes in all code paths.

#### Scenario: Manual auto-group emits completion
- **WHEN** user triggers auto-group via WavesHub button
- **AND** `runAutoGroup()` completes
- **THEN** `emitAutoGroupDone()` is emitted

#### Scenario: Automatic post-upload emits completion
- **WHEN** `flushUngroupedPhotos()` completes
- **THEN** `emitAutoGroupDone()` is emitted

#### Scenario: Wave deletion emits completion
- **WHEN** wave is deleted in WavesHub
- **THEN** `emitAutoGroupDone()` is emitted

### Requirement: Multiple Subscribers
The system SHALL support multiple subscribers to `emitAutoGroupDone()` and update all affected screens.

#### Scenario: Three screens subscribe
- **WHEN** `emitAutoGroupDone()` is emitted
- **THEN** WavesHub receives event and refreshes badge
- **AND** WaveHeaderIcon receives event and refreshes badge
- **AND** Waves drawer icon receives event and refreshes badge (via atom update)

### Requirement: Badge Updates After Auto-Group
The system SHALL update the WaveHeaderIcon badge on the photo feed header when auto-grouping completes, whether triggered manually via WavesHub or automatically after photo upload.

#### Scenario: Badge updates after manual auto-group
- **WHEN** user triggers auto-group via WavesHub button
- **AND** auto-grouping completes successfully
- **THEN** `emitAutoGroupDone()` is emitted
- **AND** WaveHeaderIcon receives the event and re-fetches counts
- **THEN** badge on photo feed header updates to reflect new state

#### Scenario: Badge updates after automatic post-upload auto-group
- **WHEN** photo upload completes and `flushUngroupedPhotos` runs automatically
- **AND** auto-grouping completes successfully
- **THEN** `emitAutoGroupDone()` is emitted
- **AND** WaveHeaderIcon receives the event and re-fetches counts
- **THEN** badge on photo feed header updates without requiring navigation

#### Scenario: Badge updates when waves created
- **WHEN** auto-grouping creates new waves
- **THEN** `wavesCount` atom is updated
- **AND** WaveHeaderIcon badge updates
- **THEN** icon color changes from grey to coral (if waves now exist)

#### Scenario: Badge updates when ungrouped count changes
- **WHEN** auto-grouping reduces `ungroupedPhotosCount` (photos grouped into waves)
- **THEN** `ungroupedPhotosCount` atom is updated
- **AND** WaveHeaderIcon badge updates
- **THEN** red dot badge disappears if count reaches 0

#### Scenario: Badge updates on wave deletion
- **WHEN** a wave is deleted in WavesHub
- **THEN** `emitAutoGroupDone()` is emitted
- **AND** WaveHeaderIcon receives the event and re-fetches counts
- **THEN** badge reflects increased ungrouped count (photos returned to pool)

### Requirement: Event Subscription Cleanup
The system SHALL properly clean up the `subscribeToAutoGroupDone` subscription when WaveHeaderIcon unmounts.

#### Scenario: Component unmounts
- **WHEN** WaveHeaderIcon is unmounted (user navigates away from photo feed)
- **THEN** subscription to `emitAutoGroupDone()` is unsubscribed
- **AND** no memory leaks occur

#### Scenario: Component remounts
- **WHEN** user navigates back to photo feed and WaveHeaderIcon remounts
- **THEN** new subscription is created
- **AND** component can receive future `emitAutoGroupDone()` events

### Requirement: No Duplicate Fetches on Mount
The system SHALL NOT trigger duplicate fetches when WaveHeaderIcon mounts AND `emitAutoGroupDone()` fires in quick succession.

#### Scenario: Mount and event coincident
- **WHEN** WaveHeaderIcon mounts at same time `emitAutoGroupDone()` is emitted
- **THEN** both effects may run
- **AND** both may fetch counts
- **AND** this is acceptable because:
  - Counts are idempotent (same data each time)
  - Network overhead is minimal (integer counts, not arrays)
  - Better to refresh twice than show stale data

### Requirement: Wave Icon in Feed Header
The system SHALL display a wave icon in the upper-right corner of the main photo feed header as a state-aware navigation button to the Waves Hub. The icon color SHALL reflect wave state: `MAIN_COLOR` when waves exist, `TEXT_SECONDARY` when no waves exist or state is not yet loaded. A red dot badge SHALL appear when ungrouped photos exist. Navigation SHALL use `router.navigate()` (idempotent) instead of `router.push()` to prevent duplicate screen instances on rapid taps. On mount, the component SHALL fetch `wavesCount`, `ungroupedPhotosCount`, and `bookmarksCount` in a single `Promise.all`.

#### Scenario: User has no waves
- **WHEN** `wavesCount` atom is `0` or `null`
- **THEN** the wave icon SHALL render in `theme.TEXT_SECONDARY` color (grey)
- **THEN** no red dot badge SHALL be displayed (unless ungrouped photos exist)

#### Scenario: User has waves
- **WHEN** `wavesCount` atom is greater than `0`
- **THEN** the wave icon SHALL render in `CONST.MAIN_COLOR` (coral)

#### Scenario: User has ungrouped photos
- **WHEN** `ungroupedPhotosCount` atom is greater than `0`
- **THEN** a red dot badge SHALL be displayed on the wave icon at `position: absolute, top: 4, right: 4`, matching the `IdentityHeaderIcon` badge style
- **THEN** the icon color SHALL be `CONST.MAIN_COLOR` regardless of `wavesCount`

#### Scenario: Atoms not yet loaded
- **WHEN** `wavesCount` is `null` and `uuid` is non-empty
- **THEN** the icon SHALL render in `theme.TEXT_SECONDARY` (grey) with no badge
- **THEN** the component SHALL fetch `getWavesCount`, `getUngroupedPhotosCount`, and `getBookmarksCount` in parallel and update all three atoms

#### Scenario: User taps wave icon
- **WHEN** the user taps the wave icon
- **THEN** the Waves Hub screen SHALL be navigated to via `router.navigate('/waves')`
- **THEN** the navigation SHALL be idempotent — tapping again while already on Waves SHALL NOT push a duplicate

#### Scenario: User double-taps wave icon rapidly
- **WHEN** the user taps the wave icon twice in quick succession
- **THEN** only one Waves Hub instance SHALL exist in the navigation state
- **THEN** the back button SHALL return to the previous screen in one press

## REMOVED Requirements

### Requirement: Upload Target Badge on Wave Icon
The system SHALL **Reason**: The upload target concept is being removed entirely. The wave icon no longer needs to indicate upload target status.
**Migration**: No migration needed. The wave icon becomes a simple navigation button.

#### Scenario: Requirement is exercised
- **WHEN** the relevant action occurs
- **THEN** the system SHALL satisfy this requirement
### Requirement: Upload Target Name on Long-Press
The system SHALL **Reason**: The upload target concept is being removed. There is no upload target name to display.
**Migration**: No migration needed.

#### Scenario: Requirement is exercised
- **WHEN** the relevant action occurs
- **THEN** the system SHALL satisfy this requirement
