# Auto-Group Badge Update Across Screens

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

## Capabilities

### Modified Capabilities

- `auto-group-photos`: Badge updates now trigger across multiple screens (WavesHub, photo feed header, drawer) when auto-grouping completes
- `waves-header-badge`: Badge on photo feed header now stays fresh without requiring navigation
- `drawer-waves-badge`: Badge on Waves drawer icon updates via atom change detection

### New Capabilities

- `auto-group-badge-multi-screen`: Badge updates simultaneously across WavesHub, photo feed header, and drawer when auto-grouping completes

## Impact

- **Files modified**: 
  - `src/components/WaveHeaderIcon/index.js` — Add `subscribeToAutoGroupDone` subscription
  - `src/screens/WavesHub/index.js` — Already has subscription (no change)
  - `app/(drawer)/_layout.tsx` — Badge updates via atom change (no change)
- **Behavior change**: Badge on photo feed header updates immediately after auto-group (manual or automatic)
- **User experience**: Users see accurate ungrouped photo count in all locations without navigation

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    AUTO-GROUP COMPLETION FLOW                           │
└─────────────────────────────────────────────────────────────────────────┘

autoGroupPhotos() completes
         │
         ▼
┌──────────────────────┐
│ emitAutoGroupDone()  │
│ (WavesHub or         │
│  photoUploadService) │
└──────────┬───────────┘
           │
           ├───────────────────────────────┐
           ▼                               ▼
┌──────────────────────┐      ┌──────────────────────┐
│ WavesHub listener    │      │ WaveHeaderIcon       │
│ fetchCounts()        │      │ re-fetch counts      │
│ - wavesCount         │      │ - wavesCount         │
│ - ungroupedPhotosCount│     │ - ungroupedPhotosCount│
└──────────┬───────────┘      └──────────┬───────────┘
           │                               │
           ▼                               ▼
┌──────────────────────┐      ┌──────────────────────┐
│ Badge updates on     │      │ Badge updates on     │
│ WavesHub screen      │      │ Photo feed header    │
└──────────────────────┘      └──────────────────────┘
                                    │
                                    ▼
                           ┌──────────────────────┐
                           │ Atom updates:          │
                           │ - wavesCount           │
                           │ - ungroupedPhotosCount │
                           └──────────┬───────────┘
                                      │
                                      ▼
                           ┌──────────────────────┐
                           │ Badge updates on       │
                           │ Waves drawer icon      │
                           └──────────────────────┘
```
