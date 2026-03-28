## MODIFIED Requirements

### Requirement: Location Drift Banner
The system SHALL provide a `LocationDriftBanner` component at `src/screens/PhotosList/components/LocationDriftBanner.js` that warns the user when their live device location has drifted significantly from the location the geo feed was loaded with. The banner SHALL only be visible on segment 0 (Global/geo feed). The banner SHALL be tappable to trigger a feed reload. The `showDriftBanner` useMemo SHALL include a `feedLocationVersion` state counter in its dependency array so that it recalculates after every `reload()` call that snapshots the feed location.

#### Scenario: Banner appears when drift exceeds threshold
- **WHEN** `activeSegment` is 0 and `feedLocationRef` has been set
- **AND** the haversine distance between `feedLocationRef` coords and live `locationAtom.coords` exceeds 500 meters
- **THEN** the banner SHALL be rendered between the header and the feed content
- **THEN** the banner SHALL display a location icon and text: "Your location has updated. Tap to refresh for nearby photos."

#### Scenario: Banner hidden when drift is within threshold
- **WHEN** `activeSegment` is 0 and the haversine distance between `feedLocationRef` and live coords is 500 meters or less
- **THEN** the banner SHALL NOT be rendered

#### Scenario: Banner hidden on non-geo segments
- **WHEN** `activeSegment` is 1 (watched) or 2 (search)
- **THEN** the banner SHALL NOT be rendered regardless of location drift

#### Scenario: Banner tap triggers reload and dismisses banner
- **WHEN** the user taps the drift banner
- **THEN** the feed SHALL reload via the existing `reload()` function
- **THEN** `feedLocationRef` SHALL be updated with the current `locationAtom.coords`
- **THEN** `feedLocationVersion` SHALL be incremented to force `showDriftBanner` useMemo recalculation
- **THEN** the banner SHALL disappear because the recalculated haversine drift is now ≈ 0m

#### Scenario: Banner styling
- **WHEN** the banner is rendered
- **THEN** it SHALL use the same card styling as `PendingPhotosBanner` (themed card background, border, shadow, rounded corners, icon + text layout)
- **THEN** it SHALL use the app's theme colors from the current dark/light mode

### Requirement: Feed Location Snapshot
The system SHALL maintain a `feedLocationRef` (React ref) in the PhotosList screen that stores the coordinates the geo feed was most recently loaded with. This ref SHALL be updated every time the feed reloads, providing the baseline for drift comparison. A `feedLocationVersion` state counter SHALL be incremented alongside each ref update to signal the `showDriftBanner` useMemo to recalculate.

#### Scenario: Snapshot on initial load
- **WHEN** the `locationAtom.status` transitions to `'ready'` and the feed loads for the first time
- **THEN** `feedLocationRef.current` SHALL be set to the current `locationAtom.coords`

#### Scenario: Snapshot on pull-to-refresh
- **WHEN** the user pulls to refresh the feed
- **THEN** the `reload()` function SHALL update `feedLocationRef.current` with the current `locationAtom.coords`
- **THEN** `feedLocationVersion` SHALL be incremented

#### Scenario: Snapshot on segment button press
- **WHEN** the user taps any segment button (including re-tapping the current segment)
- **THEN** if the reload triggers for segment 0, `feedLocationRef.current` SHALL be updated with the current `locationAtom.coords`
- **THEN** `feedLocationVersion` SHALL be incremented

#### Scenario: Snapshot on banner tap
- **WHEN** the user taps the location drift banner
- **THEN** `feedLocationRef.current` SHALL be updated with the current `locationAtom.coords` via the `reload()` function
- **THEN** `feedLocationVersion` SHALL be incremented

#### Scenario: Ref starts as null
- **WHEN** the PhotosList screen mounts
- **THEN** `feedLocationRef.current` SHALL be `null`
- **THEN** no drift banner SHALL be shown until `feedLocationRef` is set
