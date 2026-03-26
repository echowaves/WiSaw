## MODIFIED Requirements

### Requirement: Waves List Focus Refresh
The system SHALL re-fetch the waves list and ungrouped photo count from the API every time the Waves screen gains focus, ensuring wave names, photo counts, thumbnails, and the ungrouped badge reflect the latest server state. The refresh SHALL preserve the current sort order. The system SHALL prevent concurrent duplicate fetches using a ref-based loading guard, and SHALL skip the initial debounced-search effect on mount so that only `useFocusEffect` triggers the first load. Thumbnail URLs SHALL be obtained from the `photos` field of the `listWaves` query response, eliminating separate per-wave thumbnail queries.

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
- **THEN** the system SHALL use the `photos` field from each wave in the query response as thumbnail URLs
- **THEN** the system SHALL NOT make separate `feedForWave` queries to fetch thumbnails
- **THEN** `WaveCard` SHALL render the collage using `wave.photos` (array of URL strings)

#### Scenario: Ungrouped count refreshes on focus
- **WHEN** the Waves index screen regains focus
- **THEN** the system SHALL call `fetchUngroupedCount()` to re-query `getUngroupedPhotosCount`
- **THEN** the badge on the kebab menu icon SHALL display the current count

#### Scenario: Wave was renamed while viewing detail
- **WHEN** the user renamed a wave in WaveDetail and navigates back
- **THEN** the waves list SHALL show the updated wave name after the focus refresh completes

#### Scenario: Photos were removed while viewing detail
- **WHEN** photos were removed from a wave while viewing its detail and the user navigates back
- **THEN** the wave's `photosCount` in the list SHALL reflect the current count after the focus refresh completes
