## Purpose
This delta spec adds a requirement to `wave-hub/spec.md` to prevent stale photo strip state. Apply changes to the main spec file when implementing this change.

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

#### Scenario: Pagination continues after sync
- **WHEN** the user has scrolled through a wave's photos (pagination has loaded additional pages)
- **WHEN** a refresh triggers `initialPhotos` to change
- **THEN** WavePhotoStrip SHALL reset to the fresh `initialPhotos` data
- **AND** pagination state SHALL reset (new batch UUID, page 0)
- **AND** the user CAN continue paginating from the refreshed state
