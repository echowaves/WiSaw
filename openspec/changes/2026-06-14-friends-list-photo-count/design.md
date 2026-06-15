## Context

The Waves Hub screen displays photo counts on wave cards using `wave.photosCount` from the GraphQL schema. The Friends list currently only shows friend names and a truncated photo strip, with no count indication. The backend has added `photosCount` field to the `Friendship` type in the `getFriendshipsList` query, making it possible to show photo counts on friend cards.

## Goals / Non-Goals

**Goals:**
- Display photo count on each friend card in the friends list
- Match the visual design and behavior of wave card photo counts exactly
- Use the server-computed `photosCount` field instead of client-side array length

**Non-Goals:**
- Changing the friend card layout beyond adding photo count
- Adding filters or sorting based on photo count
- Modifying the GraphQL schema (backend changes already completed)

## Decisions

### 1. Field Name Consistency: `photosCount` (plural)
**Rationale**: Matches the Waves implementation exactly. The backend uses `photosCount` for both `Wave` and `Friendship` types, ensuring consistency across the app.
**Alternative considered**: `photoCount` (singular) — rejected to maintain consistency with waves.

### 2. Display Format: "{count} {photo|photos}"
**Rationale**: Matches WaveCard exactly. Uses singular "photo" for count=1, plural "photos" otherwise.
**Alternative considered**: Different format for friends — rejected to maintain visual consistency.

### 3. Placement: Meta Row Below Name
**Rationale**: WaveCard uses a meta row below the name with photo count. FriendCard should replicate this exactly.
**Alternative considered**: Badge next to name — rejected to match waves design.

### 4. Fallback Value: `?? 0`
**Rationale**: If `photosCount` is null/undefined, display "0 photos". Matches WaveCard pattern.
**Alternative considered**: Hide count when 0 — rejected to show all friendships, even those with no photos.

### 5. GraphQL Query Update: Add `photosCount` to Existing Query
**Rationale**: Minimal change. The `getFriendshipsList` query already fetches friendship data; adding one field is low-risk.
**Alternative considered**: Separate batch query for counts — rejected as unnecessary complexity.

## Implementation Tasks

### Task 1: Update GraphQL Query
**File:** `src/screens/FriendsList/friends_helper.js`
**Function:** `getRemoteListOfFriendships`

Add `photosCount` to the query fields:
```graphql
query getFriendshipsList($uuid: String!) {
  getFriendshipsList(uuid: $uuid) {
    createdAt
    friendshipUuid
    uuid1
    uuid2
    photosCount  # ← ADD THIS
    photos {
      id
      thumbUrl
    }
  }
}
```

### Task 2: Update FriendCard Component
**File:** `src/components/FriendCard/index.js`

**Step 2a:** Extract photo count from friend prop
```javascript
const photoCount = friend.photosCount ?? 0
```

**Step 2b:** Wrap friend name in nameRow container
```javascript
<View style={styles.nameRow}>
  <Text style={[styles.friendName, { color: theme.TEXT_PRIMARY }]}>
    {displayName}
  </Text>
</View>
```

**Step 2c:** Add metaRow with photo count
```javascript
<View style={styles.metaRow}>
  <Text style={[styles.photoCount, { color: theme.TEXT_SECONDARY }]}>
    {photoCount} {photoCount === 1 ? 'photo' : 'photos'}
  </Text>
</View>
```

**Step 2d:** Add new styles
```javascript
nameRow: {
  flexDirection: 'row',
  alignItems: 'center'
},
metaRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  marginTop: 2
},
photoCount: {
  fontSize: 12
}
```

## Risks / Trade-offs

- **[Backend field not populated]** → If backend `photosCount` is null/undefined, display "0 photos" gracefully (fallback handles this)
- **[Performance impact]** → Negligible; `photosCount` is server-computed, no additional queries needed
- **[Layout shift]** → Friend cards will slightly increase in height to accommodate meta row (acceptable trade-off for information)
