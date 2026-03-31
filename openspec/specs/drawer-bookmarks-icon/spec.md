## Requirements

### Requirement: Bookmarks drawer icon color reflects bookmark state
The Bookmarks drawer icon SHALL use `MAIN_COLOR` when the user has bookmarked photos and the item is not focused. When the user has no bookmarks or the item is focused, the icon SHALL use the drawer's default `color` prop.

#### Scenario: User has bookmarks and item is not focused
- **WHEN** the `bookmarksCount` Jotai atom is greater than 0
- **AND** the drawer item is not focused
- **THEN** the Bookmarks drawer icon SHALL render in `MAIN_COLOR`

#### Scenario: User has no bookmarks
- **WHEN** the `bookmarksCount` Jotai atom is 0 or null
- **THEN** the Bookmarks drawer icon SHALL render using the drawer's default `color` prop

#### Scenario: Item is focused/active
- **WHEN** the Bookmarks drawer item is focused (active)
- **THEN** the Bookmarks drawer icon SHALL render using the drawer's default `color` prop regardless of bookmark state

### Requirement: Bookmarks count global atom
The app SHALL expose a `bookmarksCount` Jotai atom in `src/state.js` initialized to `null`. The atom SHALL be populated during the `WaveHeaderIcon` mount fetch and read by `BookmarksDrawerIcon` to drive icon color.

#### Scenario: Atom is populated during header icon mount
- **WHEN** `WaveHeaderIcon` mounts and fetches counts
- **THEN** the `bookmarksCount` atom SHALL be set to the result of `getBookmarksCount({ uuid })`
- **THEN** `BookmarksDrawerIcon` SHALL re-render reactively to reflect the count

### Requirement: Bookmarks count reducer function
The app SHALL expose a `getBookmarksCount({ uuid })` async function that calls the `getWatchedCount` GraphQL query and returns the integer count.

#### Scenario: Successful fetch
- **WHEN** `getBookmarksCount({ uuid })` is called with a valid uuid
- **THEN** it SHALL return the integer count of active watched photos from the backend
