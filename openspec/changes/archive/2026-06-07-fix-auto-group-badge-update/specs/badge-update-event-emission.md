## Purpose
This specification defines the event emission behavior for auto-group completion, ensuring badge indicators update correctly after both manual and automatic auto-group operations.

## Requirements

### Requirement: emitAutoGroupDone triggers badge updates
The system SHALL emit `emitAutoGroupDone()` after any auto-group operation completes (successful or failed), which SHALL trigger subscribers to call `fetchCounts()` and update the badge indicators.

#### Scenario: Manual auto-group emits completion event
- **WHEN** user confirms and manual auto-group completes successfully
- **THEN** `emitAutoGroupDone()` SHALL be emitted
- **AND** WavesHub's subscription listener SHALL call `fetchCounts()`
- **AND** badge indicators SHALL update

#### Scenario: Automatic auto-group emits completion event
- **WHEN** automatic auto-group (post-upload) completes successfully
- **THEN** `emitAutoGroupDone()` SHALL be emitted
- **AND** WavesHub's subscription listener SHALL call `fetchCounts()`
- **AND** badge indicators SHALL update

#### Scenario: Auto-group error still emits completion event
- **WHEN** auto-group operation encounters an error
- **THEN** `emitAutoGroupDone()` SHALL still be emitted
- **AND** `fetchCounts()` SHALL be called to refresh counts to current state
- **AND** badge SHALL update to reflect current ungrouped count

### Requirement: emitAutoGroupDone signature and parameters
The `emitAutoGroupDone()` function SHALL emit an event with no parameters to signal completion. This is distinct from `emitAutoGroup()` which triggers the auto-group operation.

#### Scenario: emitAutoGroupDone has no parameters
- **WHEN** `emitAutoGroupDone()` is called
- **THEN** the event SHALL contain no data payload
- **AND** subscribers SHALL fetch fresh counts from the server (via `fetchCounts()`)

#### Scenario: Multiple subscribers receive completion event
- **WHEN** `emitAutoGroupDone()` is emitted
- **THEN** all subscribers (WavesHub, WavesList, etc.) SHALL receive the event
- **AND** each subscriber SHALL call its respective refresh function

### Requirement: Badge update via Jotai atom refresh
After `emitAutoGroupDone()` is emitted and `fetchCounts()` is called, the badge indicators SHALL be updated via Jotai atom state changes.

#### Scenario: wavesCount atom updates badge
- **WHEN** `fetchCounts()` retrieves new `wavesCount` from server
- **THEN** the `wavesCount` Jotai atom SHALL be updated
- **AND** WaveHeaderIcon SHALL render in coral color if `wavesCount > 0`

#### Scenario: ungroupedPhotosCount atom updates badge
- **WHEN** `fetchCounts()` retrieves new `ungroupedPhotosCount` from server
- **THEN** the `ungroupedPhotosCount` Jotai atom SHALL be updated
- **AND** red dot badge SHALL appear if `ungroupedPhotosCount > 0`

#### Scenario: Bookmarks count updates badge
- **WHEN** `fetchCounts()` retrieves new `bookmarksCount` from server
- **THEN** the `bookmarksCount` Jotai atom SHALL be updated
- **AND** Waves drawer icon badge SHALL reflect bookmarks count

### Requirement: Subscription pattern for completion events
The system SHALL use a subscription pattern to listen for `emitAutoGroupDone()` events, allowing multiple components to react to auto-group completion.

#### Scenario: WavesHub subscribes to completion events
- **WHEN** WavesHub component mounts
- **THEN** it SHALL subscribe to `autoGroupBus` via `subscribeToAutoGroupDone()`
- **AND** it SHALL call `fetchCounts()` when the event is received
- **AND** it SHALL unsubscribe when unmounted

#### Scenario: Multiple screens can subscribe to completion events
- **WHEN** PhotosList, WavesHub, and WavesList all mount
- **THEN** each SHALL be able to subscribe to `emitAutoGroupDone()` independently
- **AND** each SHALL update its respective badge or list

### Event Bus API

```javascript
// Event Bus: src/events/autoGroupBus.js

// Trigger auto-group operation
emitAutoGroup(count, groupingLevel, silent = false)

// Trigger silent auto-group (bypasses confirmation)
emitAutoGroupSilent(count, groupingLevel)

// Subscribe to auto-group completion
subscribeToAutoGroupDone(callback: () => void): () => void

// Emit completion event
emitAutoGroupDone()
```

### Implementation Notes

#### Current Implementation (BROKEN)
```javascript
// src/events/autoGroupBus.js
export function subscribeToAutoGroup(callback) {
  const handler = (event) => {
    callback(event.detail.count, event.detail.groupingLevel)
  }
  window.addEventListener('auto-group', handler)
  return () => window.removeEventListener('auto-group', handler)
}
```

#### Fixed Implementation
```javascript
// src/events/autoGroupBus.js
export function subscribeToAutoGroupDone(callback) {
  const handler = () => {
    callback()
  }
  window.addEventListener('auto-group-done', handler)
  return () => window.removeEventListener('auto-group-done', handler)
}

export function emitAutoGroupDone() {
  window.dispatchEvent(new CustomEvent('auto-group-done'))
}
```

#### WavesHub Subscription
```javascript
// src/screens/WavesHub/index.js
useEffect(() => {
  const unsubscribeDone = subscribeToAutoGroupDone(() => {
    fetchCounts()
  })
  
  const unsubscribeAutoGroup = subscribeToAutoGroup((count, groupingLevel, silent) => {
    handleAutoGroup(count, groupingLevel, silent)
  })
  
  return () => {
    unsubscribeDone()
    unsubscribeAutoGroup()
  }
}, [handleAutoGroup, fetchCounts])
```

## Validation Scenarios

### Scenario: Badge updates after multiple sequential auto-groups
- **WHEN** manual auto-group completes and emits `emitAutoGroupDone()`
- **AND** badge updates to reflect new count
- **AND** automatic auto-group completes and emits `emitAutoGroupDone()`
- **THEN** badge SHALL update again to reflect new count
- **AND** no stale data SHALL persist

### Scenario: Subscription cleanup prevents memory leaks
- **WHEN** WavesHub component unmounts
- **THEN** both `unsubscribeAutoGroup` and `unsubscribeDone` SHALL be called
- **AND** no event listeners SHALL remain attached to window
- **AND** no memory leaks SHALL occur

### Scenario: Completion event does not carry payload
- **WHEN** `emitAutoGroupDone()` is called with no parameters
- **THEN** subscribers SHALL NOT receive any event data
- **AND** each subscriber SHALL fetch fresh counts from server
- **AND** no client-side state is used for badge update

## References

- `src/events/autoGroupBus.js` — Event bus for auto-group triggers
- `src/screens/WavesHub/index.js` — Subscription to completion events
- `src/components/WaveHeaderIcon/index.js` — Badge display component
- `src/screens/Waves/reducer.js` — Jotai atoms for counts
