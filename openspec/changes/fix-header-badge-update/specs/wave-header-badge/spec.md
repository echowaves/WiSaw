# WaveHeaderIcon Badge Updates After Auto-Group

## Requirements

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

## Implementation Notes

### Files to Modify

**src/components/WaveHeaderIcon/index.js**
- Add import: `import { subscribeToAutoGroupDone } from '../../../events/autoGroupBus'`
- Add `useEffect` hook (after existing mount effect)
- Return unsubscribe function for cleanup

### Existing Patterns to Follow

The implementation follows the same pattern used in WavesHub:

```javascript
// WavesHub pattern (already implemented)
useEffect(() => {
  const unsubscribe = subscribeToAutoGroupDone(() => {
    fetchCounts()
  })
  return unsubscribe
}, [fetchCounts])
```

WaveHeaderIcon will use similar pattern but fetch counts inline rather than calling `fetchCounts()` (to keep component self-contained).
