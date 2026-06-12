## Purpose
This delta spec adds requirements to `wave-hub/spec.md` to prevent stale photo strip state. Apply changes to the main spec file when implementing this change.

## MODIFIED Requirements

### Requirement: WavePhotoStrip photos reflect latest prop updates
The `WavePhotoStrip` component SHALL sync its internal `photos` state whenever the `initialPhotos` prop changes, ensuring the photo strip always reflects the latest server data.

#### Scenario: Photos update after refresh without navigation
- **WHEN** a wave has photos [p1, p2, p3] displayed in its WavePhotoStrip
- **WHEN** a photo upload completes and `handleRefresh()` fetches fresh data
- **AND** the server returns the wave with photos [p1, p2, p3, pNew]
- **THEN** WavePhotoStrip SHALL update to show [p1, p2, p3, pNew] immediately
- **AND** pNew SHALL be visible in the strip without requiring navigation away and back

#### Scenario: Photos update on focus gain
- **WHEN** the user navigates away from the Waves screen (e.g., into WaveDetail)
- **AND** the wave data has changed on the server during that time
- **WHEN** the user returns to the Waves screen
- **THEN** the focus effect calls `loadWaves()` which provides fresh `initialPhotos`
- **THEN** WavePhotoStrip SHALL display the updated photos immediately

### Requirement: WavePhotoStrip pagination resets with photo data
**ADDED**: When `initialPhotos` changes, WavePhotoStrip SHALL also reset its pagination metadata to prevent stale state from blocking subsequent paginated fetches.

#### Scenario: Pagination metadata resets on refresh
- **WHEN** the user has scrolled through a wave's photos (pagination has loaded pages 0, 1, 2)
- **AND** pageNumber = 2, noMoreData = false, stopLoading.current = false
- **WHEN** a refresh triggers `initialPhotos` to change
- **THEN** WavePhotoStrip SHALL reset pageNumber to -1
- **THEN** WavePhotoStrip SHALL reset noMoreData to false
- **THEN** WavePhotoStrip SHALL reset stopLoading.current to false
- **THEN** the user SHALL be able to scroll right to load more photos starting from page 0

#### Scenario: handleLoadMore does not return early after refresh
- **WHEN** initialPhotos has just been reset by the useEffect
- **THEN** noMoreData SHALL be false
- **THEN** stopLoading.current SHALL be false
- **THEN** handleLoadMore SHALL NOT return early due to these guards
- **THEN** onEndReached SHALL successfully trigger a fetch for page 0
