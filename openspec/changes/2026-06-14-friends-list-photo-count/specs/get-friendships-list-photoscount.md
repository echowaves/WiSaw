## Purpose
This specification defines the GraphQL query changes for fetching photo counts from the friends list.

## Requirements

### Requirement: GraphQL Query Includes photosCount
The `getFriendshipsList` GraphQL query SHALL request the `photosCount` field on each Friendship.

#### Scenario: Query structure
- **WHEN** the `getFriendshipsList` query is executed
- **THEN** the query SHALL include `photosCount` field
- **THEN** the query SHALL still include `photos` field (for thumbnail display)

#### Scenario: Response includes photosCount
- **WHEN** backend responds to `getFriendshipsList`
- **THEN** each Friendship object SHALL include `photosCount: Int`
- **THEN** each Friendship object SHALL include `photos: [Photo]` (truncated array)

#### Scenario: photosCount value range
- **WHEN** friendship has N photos
- **THEN** `photosCount` SHALL be a non-negative integer (0, 1, 2, ...)
- **THEN** `photosCount` SHALL represent server-computed total photo count

#### Scenario: photosCount null handling
- **WHEN** backend returns `photosCount: null`
- **THEN** client SHOULD treat as 0 (fallback via `?? 0`)

## GraphQL Schema

```graphql
query getFriendshipsList($uuid: String!) {
  getFriendshipsList(uuid: $uuid) {
    createdAt
    friendshipUuid
    uuid1
    uuid2
    photosCount           # ← REQUIRED
    photos {              # ← STILL REQUIRED for thumbnails
      id
      thumbUrl
    }
  }
}
```

## Validation

### Query Validation
- [ ] `photosCount` field present in query
- [ ] `photos` field still present in query (not removed)
- [ ] Query returns both `photosCount` and `photos` in response

### Response Validation
- [ ] Each friendship object includes `photosCount`
- [ ] `photosCount` is an integer or null
- [ ] Each friendship object still includes `photos` array
