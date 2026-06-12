## ADDED Requirements

### Requirement: WaveDetail standardized on usePendingAnimation hook
WaveDetail SHALL use the `usePendingAnimation` hook instead of inline `useRef` for `pendingPhotosAnimation` and `uploadIconAnimation` values, ensuring consistent animation behavior with PhotosList and WavesHub.

#### Scenario: WaveDetail uses usePendingAnimation hook
- **WHEN** the WaveDetail screen renders
- **THEN** it SHALL call `usePendingAnimation({ pendingPhotosCount: pendingPhotos.length, netAvailable })` instead of inline `useRef(new Animated.Value(...))`
- **THEN** it SHALL pass the hook's `pendingPhotosAnimation` and `uploadIconAnimation` to `PendingPhotosBanner`

#### Scenario: WaveDetail animations behave identically to PhotosList
- **WHEN** pending photos are added (upload starts)
- **THEN** WaveDetail SHALL animate the banner in with a spring effect (same tension/friction as PhotosList)
- **WHEN** pending photos are cleared or uploaded
- **THEN** WaveDetail SHALL animate the banner out with a timing animation (300ms duration)
