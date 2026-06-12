## ADDED Requirements

### Requirement: Badge counts refresh on upload completion
WavesHub SHALL subscribe to the upload bus and call `fetchCounts()` when a wave-specific upload completes (when `waveUuid` is present in the event). This ensures badge counts update in real-time without requiring the user to navigate away and back.

#### Scenario: Badge counts refresh after photo uploaded to wave
- **WHEN** a photo is uploaded from WaveDetail with a `waveUuid` and the upload completes
- **AND** the upload bus emits `{ photo, waveUuid: "abc-123" }`
- **THEN** WavesHub SHALL call `fetchCounts()` to refresh the ungrouped and wave count badges

#### Scenario: Badge counts NOT refreshed for main feed upload
- **WHEN** a photo is uploaded from the main feed (no `waveUuid`) and the upload completes
- **THEN** WavesHub SHALL NOT call `fetchCounts()` (handled by `autoGroupDone` mechanism)

#### Scenario: Subscription cleanup on unmount
- **WHEN** the WavesHub component unmounts
- **THEN** the upload bus listener SHALL be unsubscribed to prevent memory leaks
