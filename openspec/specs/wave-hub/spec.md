### Requirement: Waves List Focus Refresh
The system SHALL re-fetch the waves list and ungrouped photo count from the API every time the Waves screen gains focus, ensuring wave names, photo counts, thumbnails, and the ungrouped badge reflect the latest server state. The refresh SHALL preserve the current sort order. The system SHALL prevent concurrent duplicate fetches using a ref-based loading guard, and SHALL skip the initial debounced-search effect on mount so that only `useFocusEffect` triggers the first load. Thumbnail `Photo` objects (with `id` and `thumbUrl`) SHALL be obtained from the `photos` field of the `listWaves` query response, eliminating separate per-wave thumbnail queries. `WaveCard` thumbnail cache keys SHALL use `${photo.id}-thumb` (matching the `ImageView` pattern) and React `key` SHALL use `photo.id` so that thumbnails update immediately when photos are added or removed.

#### Scenario: User returns to Waves screen after viewing wave detail
- **WHEN** the Waves screen (WavesHub) regains focus (via `useFocusEffect`)
- **THEN** the system SHALL reset pagination and call `loadWaves` with page 0, a new batch UUID, and the current `sortBy`/`sortDirection` values in refresh mode
- **THEN** the waves list SHALL be replaced with the fresh server response including updated names, photo counts, and thumbnail URLs in the current sort order

#### Scenario: First mount triggers single fetch
- **WHEN** the Waves screen mounts for the first time
- **THEN** the `useFocusEffect` SHALL trigger `loadWaves` exactly once
- **THEN** the `debouncedSearch` effect SHALL skip its initial invocation (detected via a mount ref)
- **THEN** no concurrent duplicate fetch SHALL occur

#### Scenario: Concurrent fetch prevention
- **WHEN** `loadWaves` is called while a previous `loadWaves` call is still in progress
- **THEN** the new call SHALL be rejected via a `useRef`-based loading guard
- **THEN** the guard SHALL NOT rely on React state (which suffers from stale closures)

#### Scenario: Thumbnails loaded inline from listWaves
- **WHEN** `loadWaves` fetches the waves list
- **THEN** the `listWaves` query SHALL request `photos { id thumbUrl }` to obtain `Photo` objects from the server
- **THEN** the system SHALL NOT make separate `feedForWave` queries to fetch thumbnails
- **THEN** `WaveCard` SHALL render the collage using `wave.photos` (array of `Photo` objects with `id` and `thumbUrl` fields)
- **THEN** `WaveCard` SHALL set each `CachedImage` `cacheKey` to `${photo.id}-thumb` and React `key` to `photo.id`, matching the established `ImageView` pattern

#### Scenario: Ungrouped count refreshes on focus
- **WHEN** the Waves index screen regains focus
- **THEN** the system SHALL call `getUngroupedPhotosCount({ uuid })` and `getWavesCount({ uuid })`
- **THEN** the results SHALL be written to the global `ungroupedPhotosCount` and `wavesCount` atoms
- **THEN** the badge on the kebab menu icon SHALL display the current ungrouped count

#### Scenario: Wave was renamed while viewing detail
- **WHEN** the user renamed a wave in WaveDetail and navigates back
- **THEN** the waves list SHALL show the updated wave name after the focus refresh completes

#### Scenario: Photos were removed while viewing detail
- **WHEN** photos were removed from a wave while viewing its detail and the user navigates back
- **THEN** the wave's `photosCount` in the list SHALL reflect the current count after the focus refresh completes

## REMOVED Requirements

### Requirement: Upload Target Bar Display
**Reason**: The upload target concept is being removed entirely. Users no longer set a persistent upload target wave.
**Migration**: Users navigate to a wave detail screen and use the camera footer there to upload photos to a specific wave.

## MODIFIED Requirements

### Requirement: Wave Card Context Menu
The system SHALL show an `ActionMenu` modal on long-press of a wave card with icon + label management options.

#### Scenario: Owner long-presses their own wave card
- **WHEN** the wave owner long-presses a wave card
- **THEN** an `ActionMenu` modal SHALL display with items:
  - `pencil-alt` icon: "Edit Wave"
  - `call-merge` icon: "Merge Into Another Wave..."
  - separator
  - `trash-can-outline` icon: "Delete Wave" (destructive)

#### Scenario: User deletes a wave from context menu
- **WHEN** the user selects Delete Wave from the ActionMenu
- **THEN** a confirmation dialog is shown
- **THEN** upon confirmation, the wave is deleted and removed from the grid
- **THEN** the system SHALL emit `autoGroupDone` to trigger an ungrouped-photos count refresh

#### Scenario: Post-merge list update
- **WHEN** a merge completes successfully from WavesHub
- **THEN** the source wave SHALL be removed from the waves list
- **THEN** the target wave's `photosCount` SHALL be updated to reflect the merged total
- **THEN** a success toast SHALL be shown

### Requirement: Waves List Loading Progress Bar
The system SHALL display a `LinearProgress` bar at the top of the WavesHub content area whenever wave data is loading, matching the PhotosList loading indicator pattern. The bar SHALL be rendered in `WavesHub` (the component used by the route), positioned between the search bar and the FlatList.

#### Scenario: Waves are loading
- **WHEN** the `loading` state is true (initial load, pagination, or refresh)
- **THEN** a 3px `LinearProgress` bar SHALL be displayed between the search bar and the waves FlatList
- **THEN** the bar SHALL use `CONST.MAIN_COLOR` as the color and `theme.HEADER_BACKGROUND` as the track background

#### Scenario: Waves finish loading
- **WHEN** the `loading` state becomes false
- **THEN** the `LinearProgress` bar SHALL be hidden

#### Scenario: User interacts while loading
- **WHEN** the progress bar is visible
- **THEN** the waves list and all other UI elements SHALL remain interactive (non-blocking)

### Requirement: WavesHub Subscribes to AddWave Event
The system SHALL subscribe to the `addWave` event in WavesHub so that the header kebab menu can trigger the create-wave modal.

#### Scenario: Header menu emits addWave event
- **WHEN** the user selects "Create New Wave" from the Waves header kebab menu
- **THEN** `emitAddWave()` SHALL be called
- **THEN** WavesHub SHALL receive the event via `subscribeToAddWave`
- **THEN** WavesHub SHALL set `modalVisible` to true, opening the existing create-wave modal

#### Scenario: AddWave subscription cleanup
- **WHEN** WavesHub unmounts
- **THEN** the `subscribeToAddWave` listener SHALL be unsubscribed to prevent memory leaks

### Requirement: Empty State Hides Search Bar
The system SHALL hide the search bar when the waves list is empty AND no search term is active.

#### Scenario: No waves exist and no search active
- **WHEN** the waves list has zero items AND `searchText` is empty
- **THEN** the search bar SHALL NOT be rendered

#### Scenario: Waves exist
- **WHEN** the waves list has one or more items
- **THEN** the search bar SHALL be rendered at the bottom of the screen

#### Scenario: Search returns zero results
- **WHEN** the waves list has zero items AND `searchText` is non-empty
- **THEN** the search bar SHALL remain visible so the user can modify or clear the search

### Requirement: Waves Search Bar Clear Button
The system SHALL display a clear (`✕`) button inside the waves search input when the search text is non-empty.

#### Scenario: Search text is entered
- **WHEN** `searchText` has one or more characters
- **THEN** a circular clear button with a close icon SHALL appear on the right side of the search input

#### Scenario: Clear button is pressed
- **WHEN** the user presses the clear button
- **THEN** `searchText` SHALL be set to an empty string
- **THEN** the search input SHALL be refocused
- **THEN** the debounced search SHALL trigger, reloading the unfiltered waves list

#### Scenario: Search text is empty
- **WHEN** `searchText` is empty
- **THEN** the clear button SHALL NOT be rendered

### Requirement: Waves Search Bar Bottom Position
The system SHALL render the waves search bar at the bottom of the WavesHub screen, wrapped in `KeyboardStickyView`, with a negative `closed` offset calculated from `useSafeAreaInsets().bottom` plus a fixed gap, so the search bar clears the device safe area (home indicator) with a meaningful visual margin.

#### Scenario: Search bar floats above safe area
- **WHEN** the Waves screen is displayed and the search bar is visible
- **THEN** the search bar SHALL be rendered at the bottom of the screen via `KeyboardStickyView` with `closed` offset of `-(insets.bottom + 8)` where `insets.bottom` is from `useSafeAreaInsets()`
- **THEN** the search bar SHALL have visible clearance above the home indicator on notched devices

#### Scenario: Non-notched device
- **WHEN** the device has no home indicator (`insets.bottom === 0`)
- **THEN** the search bar SHALL be positioned 8px above its natural bottom position

#### Scenario: Keyboard opens
- **WHEN** the user taps the search input and the keyboard appears
- **THEN** the search bar SHALL follow the keyboard upward, maintaining 16px gap above the keyboard

#### Scenario: No search icon
- **WHEN** the search bar is rendered
- **THEN** no search icon SHALL be displayed inside the input (the bar auto-submits via debounce, no visual search affordance needed)

### Requirement: Waves list reloads on identity change
The WavesHub screen SHALL subscribe to identity-change events and reload the waves list when the user's identity is established, updated, or reset.

#### Scenario: Identity registered while waves list is mounted
- **WHEN** the user registers an identity and `emitIdentityChange()` fires
- **THEN** WavesHub SHALL call its reload/refresh function to refetch the waves list with the current uuid

#### Scenario: Subscription cleanup on unmount
- **WHEN** the WavesHub component unmounts
- **THEN** the identity-change listener SHALL be unsubscribed to prevent memory leaks

### Requirement: Waves Search-Aware Empty State
The system SHALL display a search-specific empty state when a search query returns zero results, distinct from the waves explainer empty state.

#### Scenario: Search returns no results
- **WHEN** the waves list is empty AND `searchText` is non-empty
- **THEN** the `ListEmptyComponent` SHALL render an `EmptyStateCard` with icon `search`, title "No Results Found", subtitle "Try different keywords.", and action text "Clear Search"
- **THEN** pressing "Clear Search" SHALL clear `searchText`

#### Scenario: No waves exist and no search is active
- **WHEN** the waves list is empty AND `searchText` is empty
- **THEN** the `ListEmptyComponent` SHALL render `WavesExplainerView` with the current `ungroupedPhotosCount` value and appropriate callbacks
- **THEN** the existing `EmptyStateCard` with "No Waves Yet" SHALL NOT be rendered

### Requirement: Waves empty state uses explainer view
The WavesHub component SHALL render the `WavesExplainerView` component instead of the current `EmptyStateCard` when the waves list is empty and no search term is active. The explainer variant SHALL be determined by the `ungroupedPhotosCount` atom value.

#### Scenario: Empty waves list with no search
- **WHEN** the waves list has zero items and `searchText` is empty
- **THEN** WavesHub SHALL render `WavesExplainerView` with the current `ungroupedPhotosCount` value and appropriate callbacks
- **THEN** the existing `EmptyStateCard` with "No Waves Yet" SHALL NOT be rendered

#### Scenario: Empty search results
- **WHEN** the waves list has zero items and `searchText` is non-empty
- **THEN** WavesHub SHALL continue to render the existing `EmptyStateCard` with "No waves found" and "Clear Search" action
- **THEN** `WavesExplainerView` SHALL NOT be rendered

### Requirement: UngroupedCount Prop Passed to WavesHub
The system SHALL pass the `ungroupedCount` value from the route file to WavesHub as a prop.

#### Scenario: Route file passes count
- **WHEN** the Waves route renders WavesHub
- **THEN** it SHALL pass `ungroupedCount` as a prop: `<WavesHub ungroupedCount={ungroupedCount} />`

### Requirement: Waves screen syncs global atoms on focus
The waves index screen SHALL write fetched counts to the global `wavesCount` and `ungroupedPhotosCount` atoms on focus, replacing the local `useState` for ungrouped count.

#### Scenario: Waves screen gains focus
- **WHEN** the waves index screen gains focus
- **THEN** it SHALL fetch `getUngroupedPhotosCount({ uuid })` and `getWavesCount({ uuid })`
- **THEN** it SHALL write the results to the global `ungroupedPhotosCount` and `wavesCount` atoms
- **THEN** it SHALL NOT maintain a separate local `useState` for ungrouped count

### Requirement: WavesHub updates wavesCount atom on wave mutations
WavesHub SHALL update the global `wavesCount` atom when waves are created, deleted, or auto-grouped, keeping the atom in sync with local state changes.

#### Scenario: Wave created via modal
- **WHEN** `handleCreateWave` succeeds and prepends the new wave to the local list
- **THEN** the `wavesCount` atom SHALL be incremented by 1

#### Scenario: Wave deleted via context menu
- **WHEN** `handleDeleteWave` succeeds and removes the wave from the local list
- **THEN** the `wavesCount` atom SHALL be decremented by 1
- **THEN** the `ungroupedPhotosCount` atom SHALL be incremented by the deleted wave's `photosCount`

#### Scenario: Auto-group creates waves
- **WHEN** the auto-group process completes with `totalWavesCreated` waves created
- **THEN** the `wavesCount` atom SHALL be incremented by `totalWavesCreated`
- **THEN** the `ungroupedPhotosCount` atom SHALL be set to 0

### Requirement: EmptyStateCard Secondary Action
The `EmptyStateCard` component SHALL support an optional secondary action button.

#### Scenario: Secondary action provided
- **WHEN** `secondaryActionText` and `onSecondaryActionPress` props are provided
- **THEN** a secondary button SHALL render below the primary action button
- **THEN** the secondary button SHALL have an outlined style (border, no fill) to differentiate from the primary

#### Scenario: Secondary action not provided
- **WHEN** `secondaryActionText` or `onSecondaryActionPress` is not provided
- **THEN** no secondary button SHALL be rendered (backward-compatible)

### Requirement: WavesHub Search Uses Server-Side Query
The WavesHub search bar SHALL send the search term to the backend via the `listWaves` `searchTerm` parameter instead of filtering client-side.

#### Scenario: User types in WavesHub search bar
- **WHEN** the user types in the WavesHub search input
- **THEN** after a 300ms debounce, the system SHALL call `listWaves` with the `searchTerm` parameter, `pageNumber: 0`, and a new `batch` UUID
- **THEN** the waves list SHALL be replaced with the server-filtered results
- **THEN** the current sort order (`sortBy`, `sortDirection`) SHALL be preserved in the query

#### Scenario: User clears WavesHub search
- **WHEN** the user clears the search input
- **THEN** after the 300ms debounce, the system SHALL fetch all waves from page 0 with no `searchTerm`
- **THEN** infinite scroll SHALL continue to work for the unfiltered results

#### Scenario: User scrolls while search is active
- **WHEN** a search term is active and the user scrolls to the bottom
- **THEN** the system SHALL fetch the next page with the same `searchTerm` and `batch`
- **THEN** results SHALL be appended to the existing filtered list

### Requirement: Wave create modal keyboard avoidance
The wave create modal SHALL use `KeyboardAwareScrollView` from `react-native-keyboard-controller` so text inputs remain visible when the keyboard is open.

#### Scenario: Creating a wave with keyboard open
- **WHEN** a user taps the description field in the create wave modal
- **THEN** the modal content SHALL scroll so the description input and Save button remain visible above the keyboard

### Requirement: Wave edit modal keyboard avoidance
The wave edit modal SHALL use `KeyboardAwareScrollView` from `react-native-keyboard-controller` so text inputs remain visible when the keyboard is open.

#### Scenario: Editing a wave with keyboard open
- **WHEN** a user taps the description field in the edit wave modal
- **THEN** the modal content SHALL scroll so the description input and Save button remain visible above the keyboard

### Requirement: WavesHub offline card
The WavesHub screen SHALL read `STATE.netAvailable` via `useAtom`. When `netAvailable` is `false`, it SHALL display an `EmptyStateCard` with `icon='wifi-off'` instead of attempting to load waves.

#### Scenario: WavesHub renders offline card
- **WHEN** `netAvailable` is `false`
- **THEN** the WavesHub screen SHALL display an offline `EmptyStateCard`
- **THEN** it SHALL NOT call `reducer.listWaves()` or any other GraphQL operation

#### Scenario: WavesHub loads normally when online
- **WHEN** `netAvailable` is `true`
- **THEN** the WavesHub screen SHALL render its normal waves list
