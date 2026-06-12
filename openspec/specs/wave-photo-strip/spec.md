## Purpose
This specification defines expected user-visible behavior, constraints, and validation scenarios for wave photo strip in WiSaw.
## Requirements
### Requirement: Wave photo strip renders horizontal scrollable thumbnails
The `WavePhotoStrip` component SHALL render a horizontal `FlatList` of photo thumbnails. Each thumbnail SHALL be a square `CachedImage` (80x80). The strip SHALL have a fixed height. The component SHALL accept `initialPhotos` (array of photos to display immediately), `fetchFn` (async function accepting `(pageNumber, batch)` returning `PhotoFeed`), and `theme`. The component SHALL use a `useEffect` to sync internal photo state when the `initialPhotos` prop updates asynchronously (e.g., when the parent fetches data after mount). When `initialPhotos` changes, the `useEffect` SHALL also reset the `userHasScrolled` ref to `false` and the `autoScrollTrigger` state to `false` to ensure clean initial state on prop updates.

#### Scenario: Render initial photos
- **WHEN** `WavePhotoStrip` mounts with `initialPhotos` containing 4 photos
- **THEN** 4 square thumbnails SHALL be rendered in a horizontal row
- **THEN** no fetch call SHALL be made until the user scrolls

#### Scenario: Initial photos update after mount (Reload scenario)
- **WHEN** the parent component fetches new photos asynchronously and updates `initialPhotos` (e.g., after waves list refresh)
- **THEN** `WavePhotoStrip` SHALL update its internal state to display the new photos via a `useEffect` watching `initialPhotos`
- **THEN** the `userHasScrolled` ref SHALL be reset to `false` to prevent stale scroll state from triggering auto-scroll
- **THEN** the `autoScrollTrigger` state SHALL be reset to `false` to clear any pending scroll commands
- **THEN** the FlatList SHALL render starting at scroll position 0 (left edge), not at a previously scrolled position

#### Scenario: Empty initial photos shows placeholder
- **WHEN** `WavePhotoStrip` mounts with empty `initialPhotos` and no `fetchFn`
- **THEN** a placeholder icon SHALL be displayed (FontAwesome5 `water` icon)

### Requirement: Wave photo strip supports paginated loading
**MODIFIED:** When `onEndReached` fires during horizontal scrolling and photos are successfully fetched and appended, the strip SHALL auto-scroll to the end to maintain the user in the "load more" zone.

#### Scenario: Subsequent scroll triggers next page
**MODIFIED:** 
- **WHEN** the user scrolls the strip to the end after page 0 has loaded and `noMoreData` is false
- **THEN** `fetchFn` SHALL be called with the next incrementing `pageNumber` (1, 2, ...)
- **THEN** returned photos SHALL be deduplicated and appended
- **THEN** `scrollToEnd({ animated: false })` SHALL be called to reposition the user at the new end

### Requirement: Wave photo strip auto-scrolls after pagination loads
When photos are successfully fetched and appended during horizontal pagination, the strip SHALL auto-scroll to the end using `scrollToEnd({ animated: false })` to keep the user in the "load more" zone for seamless continuous scrolling. Auto-scroll SHALL be skipped when the strip starts with 0 initial photos (first load from empty state) OR when `initialPhotos` prop updates (reload scenario) to avoid visual jumping.

#### Scenario: Auto-scroll after loading additional photos
- **WHEN** the strip has existing photos and `onEndReached` triggers a successful fetch that appends new photos
- **THEN** `scrollToEnd({ animated: false })` SHALL be called immediately after photos are appended
- **THEN** the user's position SHALL be instantly repositioned at the new end of the strip
- **THEN** the user can continue scrolling right to trigger further page loads without manual repositioning

#### Scenario: No auto-scroll on first load from empty state
- **WHEN** the strip mounts with 0 initial photos and `fetchFn` is provided
- **THEN** the first `onEndReached` triggers a fetch of page 0
- **THEN** when page 0 photos are appended, `scrollToEnd` SHALL NOT be called
- **THEN** the user must manually scroll right to continue loading additional pages

#### Scenario: No auto-scroll on reload with new initial photos
- **WHEN** `initialPhotos` prop updates with new data (e.g., parent refreshes waves list)
- **THEN** the `useEffect` watching `initialPhotos` SHALL reset `userHasScrolled.current` to `false`
- **THEN** the `autoScrollTrigger` SHALL be reset to `false`
- **THEN** even if `onEndReached` fires, `scrollToEnd` SHALL NOT be called because `userHasScrolled.current` is `false`
- **THEN** the user must manually scroll right to continue loading additional pages

#### Scenario: Auto-scroll does not interrupt photo interactions
- **WHEN** a page fetch completes and auto-scroll fires
- **THEN** `scrollToEnd` SHALL be called with `animated: false`
- **THEN** the instant reposition SHALL NOT interfere with ongoing tap or long-press gestures on existing thumbnails

### Requirement: Wave photo strip supports photo long press
The `WavePhotoStrip` component SHALL accept an optional `onPhotoLongPress` callback prop and an optional `onPhotoPress` callback prop. When either is provided, each thumbnail SHALL be wrapped in a `Pressable`. The `Pressable` SHALL wire `onPress` to `onPhotoPress(item)` (if provided) and `onLongPress` to `onPhotoLongPress(item)` (if provided), where `item` is the photo object. When neither callback is provided, thumbnails SHALL render without a `Pressable` wrapper.

#### Scenario: Tap on thumbnail with press handler
- **WHEN** `onPhotoPress` is provided and the user taps a thumbnail
- **THEN** `onPhotoPress` SHALL be called with the photo object

#### Scenario: Long press on thumbnail with handler
- **WHEN** `onPhotoLongPress` is provided and the user long-presses a thumbnail
- **THEN** `onPhotoLongPress` SHALL be called with the photo object

#### Scenario: Both handlers provided
- **WHEN** both `onPhotoPress` and `onPhotoLongPress` are provided
- **THEN** tap SHALL call `onPhotoPress` and long press SHALL call `onPhotoLongPress`

#### Scenario: No handlers means no Pressable wrapper
- **WHEN** neither `onPhotoPress` nor `onPhotoLongPress` is provided
- **THEN** thumbnails SHALL render as plain `CachedImage` elements without `Pressable` wrapping

### Requirement: Wave photo strip scroll state resets on initial photos change
The `WavePhotoStrip` component SHALL use a `useEffect` hook that watches the `initialPhotos` prop. When `initialPhotos` changes, the effect SHALL reset both the `userHasScrolled` ref (to `false`) and the `autoScrollTrigger` state (to `false`) to ensure the component starts in a clean state without accumulated scroll history from previous renders.

#### Scenario: Scroll state resets on new initialPhotos
- **WHEN** `initialPhotos` prop changes from one array to another (different content or length)
- **THEN** `userHasScrolled.current` SHALL be `false` immediately after the `useEffect` runs
- **THEN** `autoScrollTrigger` SHALL be `false` immediately after the `useEffect` runs
- **THEN** the FlatList SHALL render with scroll position at the left edge (index 0)

