## Purpose
This specification defines expected user-visible behavior for wave photo sorting consistency in WiSaw, ensuring that photos displayed in wave cards match the order shown in wave detail screens, even after photo modifications.
## Requirements
### Requirement: Wave card photos sort order SHALL match wave detail screen
When a user views a wave card in WavesHub, the photo strip SHALL display photos in the same order as the photo list in the wave detail screen (WaveDetail).

#### Scenario: Photo order consistency on first load
- **GIVEN** a wave has photos sorted by `updatedAt DESC`
- **WHEN** the user views the wave card in WavesHub
- **AND** then navigates to WaveDetail
- **THEN** both screens display photos in the same order

#### Scenario: Photo order updates when comment added
- **GIVEN** a wave card displays photos in WavesHub
- **WHEN** a photo in the wave is modified (e.g., comment added)
- **THEN** the wave card photo strip updates within 1-2 seconds
- **AND** the order matches WaveDetail screen

#### Scenario: No app restart required
- **GIVEN** the user has opened WavesHub and viewed wave cards
- **WHEN** a photo in a wave is modified
- **THEN** the wave card photo strip updates without requiring app restart

### Requirement: `listWaves` GraphQL query SHALL include `updatedAt`
The `listWaves` query in `src/screens/Waves/reducer.js` SHALL request the `updatedAt` field for each photo.

#### Scenario: Query includes updatedAt
- **WHEN** the `listWaves` query is executed
- **THEN** each photo in the response includes `updatedAt` field

### Requirement: `feedForWave` GraphQL query SHALL include `updatedAt`
The `feedForWave` query in `src/screens/WaveDetail/reducer.js` SHALL request the `updatedAt` field for each photo.

#### Scenario: Query includes updatedAt
- **WHEN** the `feedForWave` query is executed
- **THEN** each photo in the response includes `updatedAt` field

### Requirement: WavePhotoStrip comparison logic SHALL detect timestamp changes
The `WavePhotoStrip` component in `src/components/WavePhotoStrip/index.js` SHALL detect when photo timestamps have changed to trigger state updates.

#### Scenario: Timestamp change triggers state update
- **GIVEN** WavePhotoStrip has received initial photos
- **WHEN** new `initialPhotos` arrives with same IDs but different `updatedAt` values
- **THEN** WavePhotoStrip updates internal state with the new photos

## What Changes

### Files Modified
- `src/screens/Waves/reducer.js` - Added `updatedAt` to `photos` selection
- `src/components/WavePhotoStrip/index.js` - Updated comparison logic to detect timestamp changes
- `src/screens/WaveDetail/reducer.js` - Added `updatedAt` to `photos` selection

### Backend Changes
None - backend already sorts photos by `updatedAt DESC`.

### Change History
- **2026-07-03**: Change `wave-photo-sorting-consistency` archived as `2026-07-03-wave-photo-sorting-consistency`