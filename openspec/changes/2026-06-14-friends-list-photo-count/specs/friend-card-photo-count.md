## Purpose
This specification defines expected user-visible behavior for friend photo count display in the friends list.

## Requirements

### Requirement: Photo Count from GraphQL
The system SHALL display the friend photo count using the `photosCount` field from the GraphQL `Friendship` type.

#### Scenario: FriendCard displays photo count
- **WHEN** a FriendCard is rendered in the friends list
- **THEN** the photo count SHALL be read from `friend.photosCount`
- **THEN** the display text SHALL show "{count} photo" or "{count} photos"

#### Scenario: getFriendshipsList query includes photosCount
- **WHEN** the `getFriendshipsList` GraphQL query is executed
- **THEN** the query SHALL request the `photosCount` field on each Friendship
- **THEN** the query SHALL still request the `photos` field for thumbnail display

#### Scenario: Friend has zero photos
- **WHEN** a friendship has no shared photos
- **THEN** `photosCount` SHALL be displayed as "0 photos"

#### Scenario: Friend has one photo
- **WHEN** a friendship has exactly one shared photo
- **THEN** `photosCount` SHALL be displayed as "1 photo" (singular)

#### Scenario: Friend has multiple photos
- **WHEN** a friendship has multiple shared photos
- **THEN** `photosCount` SHALL be displayed as "N photos" (plural)

#### Scenario: Friend name and photo count layout
- **WHEN** FriendCard is rendered
- **THEN** friend name SHALL appear in the primary text color
- **THEN** photo count SHALL appear in a meta row below the name
- **THEN** photo count text SHALL be smaller (12px) than friend name (14px)

#### Scenario: Consistency with WaveCard
- **WHEN** comparing FriendCard photo count to WaveCard photo count
- **THEN** display format SHALL be identical ("N photo"/"N photos")
- **THEN** meta row layout SHALL be identical (gap: 6px, marginTop: 2px)
- **THEN** font size SHALL be identical (12px)
- **THEN** fallback behavior SHALL be identical (?? 0)

## Validation Scenarios

### Scenario: Backend photosCount is null
- **WHEN** backend returns `photosCount: null`
- **THEN** client SHOULD display "0 photos" (fallback to 0)

### Scenario: Backend photosCount is undefined
- **WHEN** backend returns `photosCount: undefined`
- **THEN** client SHOULD display "0 photos" (fallback to 0)

### Scenario: Pending friendship (uuid2 is null)
- **WHEN** friendship is pending (uuid2 === null)
- **THEN** photo count SHALL still display if `photosCount` is available
- **THEN** layout SHALL remain consistent with confirmed friendships
