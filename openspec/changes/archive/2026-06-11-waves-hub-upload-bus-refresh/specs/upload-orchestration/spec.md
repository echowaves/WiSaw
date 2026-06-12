## MODIFIED Requirements

### Requirement: Upload bus has multiple screen consumers
In addition to PhotosList and WaveDetail, WavesHub SHALL subscribe to the upload bus to receive upload completion events. When WavesHub receives an upload event with a non-null `waveUuid`, it SHALL call `fetchCounts()` to refresh the ungrouped photo count and wave count badges.

#### Scenario: WavesHub subscribes to upload bus
- **WHEN** the WavesHub screen mounts
- **THEN** the system SHALL call `subscribeToUploadComplete(listener)` in a `useEffect`
- **THEN** the returned unsubscribe function SHALL be called when the component unmounts

#### Scenario: WavesHub refreshes counts on wave-specific upload
- **WHEN** the upload bus emits `{ photo, waveUuid }` where `waveUuid` is a non-null string
- **THEN** WavesHub SHALL call `fetchCounts()` to refresh badge counts
- **THEN** the ungrouped photo count and wave count badges SHALL reflect the latest server state

#### Scenario: WavesHub ignores main feed uploads
- **WHEN** the upload bus emits `{ photo, waveUuid: undefined }`
- **THEN** WavesHub SHALL NOT call `fetchCounts()` (main feed uploads are handled via `autoGroupDone`)

#### Scenario: WavesHub unmounted during upload
- **WHEN** WavesHub is not mounted when an upload completes
- **THEN** the event is missed
- **THEN** when WavesHub next mounts (via navigation or focus), `fetchCounts()` and `loadWaves()` will refresh state
