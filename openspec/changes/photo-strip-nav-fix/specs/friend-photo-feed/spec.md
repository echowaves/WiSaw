# Friend Photo Feed Specification

## Requirements

### Requirement: Friend photo strip click navigates to friend feed
When a user clicks on a photo in a friend card's photo strip, the app shall navigate to the friend's photo feed screen with the friend's photos loaded.

#### Scenario: Click photo in friend card strip
- **WHEN** the user taps on a photo in the `WavePhotoStrip` of a `FriendCard`
- **THEN** the app navigates to `/friendships/[friendUuid]` with params: `friendUuid`, `friendName`, `friendshipUuid`
- **THEN** the `FriendDetail` screen receives `friendUuid` via `useLocalSearchParams()`
- **THEN** `fetchFriendPhotos(uuid, friendUuid)` is called with valid parameters
- **THEN** the friend's photos are fetched and displayed in a masonry grid

#### Scenario: Friend has no photos
- **WHEN** the friend has zero photos shared
- **THEN** the `FriendDetail` screen displays an empty state with "No Photos Yet" message
- **THEN** a "Refresh" button is available to retry loading

#### Scenario: Long-press photo opens context menu
- **WHEN** the user long-presses a photo in the friend's photo feed
- **THEN** the QuickActionsModal opens with appropriate actions (report, delete, etc.)

### Requirement: Friend feed photo fetch uses correct parameters
The `fetchFriendPhotos` GraphQL query shall receive both `uuid` (current user) and `friendUuid` (friend) to fetch the correct photo set.

#### Scenario: Query with valid parameters
- **WHEN** `fetchFriendPhotos` is called with valid `uuid` and `friendUuid`
- **THEN** the query returns photos shared between the current user and the friend
- **THEN** photos are displayed in the friend's photo feed

#### Scenario: Query with missing friendUuid
- **WHEN** `friendUuid` is `undefined` or missing
- **THEN** the query fails or returns empty results
- **THEN** the screen shows "No Photos Yet" empty state

## Implementation Verification

**Fixed by:** `2026-06-18-friends-list-photo-strip-nav-fix`

**Test Steps:**
1. Navigate to Friends list
2. Click on a photo in a friend card's photo strip
3. Verify `FriendDetail` screen loads with friend's photos
4. Verify clicking friend name/info area also navigates correctly
5. Verify friend with no photos shows appropriate empty state
