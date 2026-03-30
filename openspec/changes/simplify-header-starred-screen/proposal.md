## Why

The main screen header currently contains a segment control (Global / Starred) that adds visual complexity and limits header simplification. Starred content is functionally a separate feed with different data source (watched photos vs geo-feed), different layout config, and no location dependency. Promoting Starred to its own screen in the drawer simplifies the header and makes both feeds independently extensible. With only one segment remaining, the segment concept becomes unnecessary overhead.

## What Changes

- Remove the segment control (Global / Starred toggle) from `PhotosListHeader`
- Simplify the header to: identity icon (left), empty center, waves icon (right)
- Move Starred into the drawer menu, positioned between Identity and Friends
- Create a new Starred screen (`app/(drawer)/starred.tsx`) backed by its own screen component
- Extract shared feed logic into reusable hooks (`useFeedLoader`, `useFeedSearch`) so both Global and Starred screens share pagination, photo list management, search, and event subscriptions without code duplication
- Remove all segment-related state and branching from `PhotosList`
- Remove `activeSegment`, `updateIndex`, segment config switching, and segment-dependent conditionals from `PhotosList/index.js`

## Capabilities

### New Capabilities
- `starred-screen`: Standalone screen for starred/watched content, accessible from drawer navigation
- `feed-loader-hook`: Shared hook encapsulating feed loading, pagination, abort control, photo list management, and event subscriptions — parameterized by fetch function
- `feed-search-hook`: Shared hook encapsulating search state, search FAB coordination, event bus integration, and deep-link search handling

### Modified Capabilities
- `photo-feed`: Remove segment switching; the main feed becomes Global-only with no segment state or UI
- `identity-header-icon`: No functional change, but header layout context changes (no adjacent segment control)
- `wave-header-icon`: No functional change, but header layout context changes

## Impact

- **Screens**: `src/screens/PhotosList/` loses segment logic; new `src/screens/StarredList/` created
- **Routing**: New `app/(drawer)/starred.tsx` route; drawer layout updated in `app/(drawer)/_layout.tsx`
- **Components**: `PhotosListHeader.js` simplified (segment control removed)
- **Hooks**: Two new hooks in `src/screens/PhotosList/hooks/` (or `src/hooks/`)
- **Reducer**: `src/screens/PhotosList/reducer.js` — `getPhotos()` segment dispatch simplified; `requestWatchedPhotos` extracted for Starred screen use
- **State**: `activeSegment` local state removed from PhotosList
- **No API changes**: Both `feedByDate` and `feedForWatcher` GraphQL queries remain unchanged
- **No dependency changes**: No new packages needed
