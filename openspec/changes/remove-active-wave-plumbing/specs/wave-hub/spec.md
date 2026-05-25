## MODIFIED Requirements

### Requirement: Waves List Focus Refresh
The system SHALL re-fetch the waves list and ungrouped photo count from the API every time the Waves screen gains focus, ensuring wave names, photo counts, thumbnails, and the ungrouped badge reflect the latest server state. The refresh SHALL preserve the current sort order. The system SHALL prevent concurrent duplicate fetches using a ref-based loading guard, and SHALL skip the initial debounced-search effect on mount so that only `useFocusEffect` triggers the first load. The `useFocusEffect` callback SHALL be wrapped in `useCallback` (required by the React Navigation API to prevent infinite re-render loops), and the loading guard ref SHALL be reset to `false` at the start of each focus callback to prevent stale lock-outs from prior navigations. Thumbnail `Photo` objects (with `id` and `thumbUrl`) SHALL be obtained from the `photos` field of the `listWaves` query response, eliminating separate per-wave thumbnail queries. `WaveCard` SHALL pass `wave.photos` as `initialPhotos` to `WavePhotoStrip`, which SHALL use `CachedImage` with `cacheKey` `${photo.id}-thumb` and React `key` `photo.id`.

#### Scenario: User returns to Waves screen after viewing wave detail
- **WHEN** the Waves screen (WavesHub) regains focus (via `useFocusEffect`)
- **THEN** the system SHALL reset pagination and call `loadWaves` with page 0, a new batch UUID, and the current `sortBy`/`sortDirection` values in refresh mode
- **THEN** the waves list SHALL be replaced with the fresh server response including updated names, photo counts, and thumbnail URLs in the current sort order

#### Scenario: Repeated visits always refresh
- **WHEN** the user navigates away from the Waves screen and returns multiple times without changing sort or search
- **THEN** each return SHALL trigger a fresh `loadWaves` call
- **THEN** the `loadingRef` guard SHALL prevent concurrent duplicate fetches if the previous call is still in-flight

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
- **THEN** `WaveCard` SHALL pass `wave.photos` as `initialPhotos` to the `WavePhotoStrip` component

#### Scenario: WaveCard horizontal scroll does not conflict with card press
- **WHEN** a `WaveCard` is rendered with a `WavePhotoStrip`
- **THEN** the card outer container SHALL be a plain `View` (not `TouchableOpacity`) so horizontal scroll gestures are not intercepted
- **THEN** press and long-press handlers SHALL be attached to a `Pressable` wrapping only the info area below the strip

#### Scenario: Ungrouped count refreshes on focus
- **WHEN** the Waves index screen regains focus
- **THEN** the system SHALL call `getUngroupedPhotosCount({ uuid })` and `getWavesCount({ uuid })`
- **THEN** the results SHALL be written to the global `ungroupedPhotosCount` and `wavesCount` atoms
- **THEN** the ungrouped card visibility SHALL update based on the new count

#### Scenario: Refresh does not sync active wave
- **WHEN** `loadWaves` completes in refresh mode
- **THEN** the system SHALL NOT search for an `isActive` wave in the results
- **THEN** the system SHALL NOT call `setActiveWave`, `saveActiveWave`, or `clearActiveWave`

### Requirement: WavesHub updates wavesCount atom on wave mutations
WavesHub SHALL update the global `wavesCount` atom when waves are created, deleted, or auto-grouped, keeping the atom in sync with local state changes.

#### Scenario: Wave created via modal
- **WHEN** `handleCreateWave` succeeds and prepends the new wave to the local list
- **THEN** the `wavesCount` atom SHALL be incremented by 1

#### Scenario: Wave deleted via context menu
- **WHEN** `handleDeleteWave` succeeds and removes the wave from the local list
- **THEN** the `wavesCount` atom SHALL be decremented by 1
- **THEN** the `ungroupedPhotosCount` atom SHALL be incremented by the deleted wave's `photosCount`
- **THEN** the system SHALL NOT check or clear any active wave state

#### Scenario: Auto-group creates waves
- **WHEN** the auto-group process completes with `totalWavesCreated` waves created
- **THEN** the `wavesCount` atom SHALL be incremented by `totalWavesCreated`
- **THEN** the `ungroupedPhotosCount` atom SHALL be set to 0
- **THEN** the system SHALL NOT save an active wave from the auto-group result
