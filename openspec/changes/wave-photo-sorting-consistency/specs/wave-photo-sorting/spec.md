# Wave Photo Sorting Consistency — Specification

## Requirement 1: `listWaves` Query Includes `updatedAt`

### Scenario: Wave Card Fetches Photos with Timestamps

**WHEN** the WavesHub screen loads waves via `listWaves` query

**THEN** each photo in the `photos` array includes the `updatedAt` field

**AND** the `updatedAt` value matches the photo's last modification timestamp from the database

**Example GraphQL Response:**
```graphql
{
  "listWaves": {
    "waves": [
      {
        "waveUuid": "abc-123",
        "name": "My Vacation",
        "photosCount": 15,
        "photos": [
          {
            "id": "photo-001",
            "thumbUrl": "https://...",
            "updatedAt": "2026-07-02T15:30:00.000Z"
          },
          {
            "id": "photo-002",
            "thumbUrl": "https://...",
            "updatedAt": "2026-07-02T14:25:00.000Z"
          }
        ]
      }
    ]
  }
}
```

### Test Cases

| Test ID | Description | Expected |
|---------|-------------|----------|
| 1.1 | `listWaves` query includes `updatedAt` field | Response contains `updatedAt` for each photo |
| 1.2 | `updatedAt` value matches database | Value equals `Photos.updatedAt` from PostgreSQL |
| 1.3 | `updatedAt` is ISO 8601 format | String matches `YYYY-MM-DDTHH:mm:ss.SSSZ` pattern |

---

## Requirement 2: `feedForWave` Query Includes `updatedAt`

### Scenario: Wave Detail Fetches Photos with Timestamps

**WHEN** the WaveDetail screen fetches photos via `feedForWave` query

**THEN** each photo in the `photos` array includes the `updatedAt` field

**AND** the `updatedAt` value matches the photo's last modification timestamp

**Example GraphQL Response:**
```graphql
{
  "feedForWave": {
    "photos": [
      {
        "id": "photo-001",
        "uuid": "uuid-001",
        "thumbUrl": "https://...",
        "updatedAt": "2026-07-02T15:30:00.000Z",
        "createdAt": "2026-07-01T10:00:00.000Z"
      }
    ]
  }
}
```

### Test Cases

| Test ID | Description | Expected |
|---------|-------------|----------|
| 2.1 | `feedForWave` query includes `updatedAt` field | Response contains `updatedAt` for each photo |
| 2.2 | `updatedAt` value matches database | Value equals `Photos.updatedAt` from PostgreSQL |
| 2.3 | Consistency with `listWaves` | Same `updatedAt` value in both queries |

---

## Requirement 3: WavePhotoStrip Detects Photo Reordering

### Scenario: Photo Update Triggers State Refresh

**GIVEN** WavePhotoStrip has received initial photos `[A, B, C]`

**AND** the photos are stored in internal state

**WHEN** new `initialPhotos` prop arrives with same IDs but different `updatedAt` values (reordered)

**THEN** WavePhotoStrip updates internal state with the new photos

**AND** the UI re-renders with correct sort order

### Test Cases

| Test ID | Scenario | Expected |
|---------|----------|----------|
| 3.1 | Same IDs, same timestamps | State NOT updated (no change) |
| 3.2 | Same IDs, different timestamps | State updated (reorder detected) |
| 3.3 | New photo ID added | State updated (existing behavior) |
| 3.4 | Existing photo ID removed | State updated (existing behavior) |
| 3.5 | All photos changed (new array) | State updated (existing behavior) |

### Example: Reorder Detection

**Initial State:**
```javascript
initialPhotos = [
  { id: 'A', thumbUrl: 'url-a', updatedAt: '2026-07-02T15:00:00Z' },
  { id: 'B', thumbUrl: 'url-b', updatedAt: '2026-07-02T14:00:00Z' },
  { id: 'C', thumbUrl: 'url-c', updatedAt: '2026-07-02T13:00:00Z' }
]

// User adds comment to photo A (A's updatedAt becomes newest)
```

**New Props:**
```javascript
initialPhotos = [
  { id: 'A', thumbUrl: 'url-a', updatedAt: '2026-07-02T16:00:00Z' }, // Updated!
  { id: 'B', thumbUrl: 'url-b', updatedAt: '2026-07-02T14:00:00Z' },
  { id: 'C', thumbUrl: 'url-c', updatedAt: '2026-07-02T13:00:00Z' }
]
```

**Expected:** Internal photos state updates to match new order

---

## Requirement 4: Sort Order Consistency

### Scenario: Wave Card and Wave Detail Show Same Order

**GIVEN** a wave with photos `[P1, P2, P3]` sorted by `updatedAt DESC`

**WHEN** the user views the wave in WavesHub (wave card)

**AND** then navigates to WaveDetail

**THEN** both screens show photos in the same order

**AND** if a photo is modified (e.g., comment added):

**WHEN** the modification completes

**THEN** both screens reflect the updated order without app restart

### Test Cases

| Test ID | Scenario | Expected |
|---------|----------|----------|
| 4.1 | Initial load order matches | Wave card and wave detail show same order |
| 4.2 | After comment added | Both screens show updated order within 1-2 seconds |
| 4.3 | After comment deleted | Both screens show updated order within 1-2 seconds |
| 4.4 | After photo upload to wave | Both screens show updated order |
| 4.5 | Pull refresh on WavesHub | Fresh data with correct order displayed |

---

## Requirement 5: No App Restart Required

### Scenario: Photo Updates Reflect Immediately

**GIVEN** the user has opened WavesHub and viewed wave cards

**WHEN** a photo in a wave is modified (comment added/deleted)

**THEN** the wave card's photo strip updates to reflect new sort order

**AND** the user does NOT need to restart the app to see the updated order

**AND** the user does NOT need to manually refresh the screen

### Acceptance Criteria

- [ ] Photo order updates within 1-2 seconds of modification
- [ ] No manual refresh required
- [ ] No app restart required
- [ ] Order matches WaveDetail screen
- [ ] Works for: comment adds, comment deletes, photo uploads

---

## Integration Points

### GraphQL Queries

**listWaves** (in `src/screens/Waves/reducer.js`)
```graphql
query listWaves($pageNumber: Int!, $batch: String!, $uuid: String!, $searchTerm: String) {
  listWaves(pageNumber: $pageNumber, batch: $batch, uuid: $uuid, searchTerm: $searchTerm) {
    waves {
      waveUuid
      name
      photosCount
      photos {
        id
        thumbUrl
        updatedAt  # ← REQUIRED
      }
    }
    batch
    noMoreData
  }
}
```

**feedForWave** (in `src/screens/WaveDetail/reducer.js`)
```graphql
query feedForWave($waveUuid: String!, $pageNumber: Int!, $batch: String!) {
  feedForWave(waveUuid: $waveUuid, pageNumber: $pageNumber, batch: $batch) {
    photos {
      id
      uuid
      thumbUrl
      updatedAt  # ← REQUIRED
      createdAt
    }
    batch
    noMoreData
  }
}
```

### Components

**WavePhotoStrip** (`src/components/WavePhotoStrip/index.js`)
- Compares `initialPhotos` prop with internal state
- Must detect both ID changes AND timestamp changes
- Updates state when reorder detected

---

## Performance Considerations

- **Network**: Minimal increase - `updatedAt` is a single timestamp per photo (~24 bytes)
- **Memory**: Negligible - timestamps stored alongside existing photo data
- **CPU**: Low - timestamp comparison is O(n) per photo array
- **Cache**: No changes - Apollo uses `network-only` policy

---

## Edge Cases

| Case | Handling |
|------|----------|
| Empty photo array | No comparison needed, state resets |
| Single photo | Timestamp comparison still works |
| Rapid successive updates | Debounce not needed - React batches updates |
| Network latency | Apollo refetches with fresh data |
| Timestamp collision (unlikely) | Still detects as "changed" - acceptable |

---

## Rollback Plan

If issues arise:

1. Remove `updatedAt` from GraphQL queries
2. Revert WavePhotoStrip comparison logic to ID-only
3. No data migration needed (no database changes)
