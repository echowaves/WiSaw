## Purpose
This specification defines the progress overlay behavior for auto-group operations, ensuring users receive appropriate feedback for both manual and automatic triggers.

## Requirements

### Requirement: Progress overlay shows during auto-group loop
The system SHALL display a semi-transparent modal overlay with an activity indicator and progress text while the auto-group loop is executing.

#### Scenario: Progress overlay appears when auto-group starts
- **WHEN** auto-group operation begins (manual or automatic)
- **THEN** a semi-transparent modal overlay SHALL appear
- **AND** the overlay SHALL include an ActivityIndicator (spinner)
- **AND** the overlay SHALL block interaction with underlying UI

#### Scenario: Progress overlay updates during loop
- **WHEN** each batch of auto-group completes
- **THEN** the overlay text SHALL update to show:
  - Waves created: X
  - Photos grouped: Y
  - Photos remaining: Z

### Requirement: Silent mode shows progress but not alert
When auto-grouping is triggered automatically (silent mode), the system SHALL show the same progress overlay as manual mode, but SHALL NOT show the confirmation dialog.

#### Scenario: Silent mode skips confirmation but shows progress
- **WHEN** `emitAutoGroupSilent()` is called
- **THEN** no confirmation dialog SHALL appear
- **AND** progress overlay SHALL appear immediately
- **AND** user SHALL see progress updates during the loop

#### Scenario: User sees progress even when navigating away
- **WHEN** progress overlay is showing
- **AND** user navigates to a different screen
- **THEN** progress overlay MAY disappear (navigation clears overlay)
- **AND** badge SHALL still update after completion

### Requirement: Progress overlay dismisses on completion
The system SHALL dismiss the progress overlay when the auto-group loop completes successfully.

#### Scenario: Progress overlay dismisses after success
- **WHEN** auto-group loop finishes (`hasMore === false`)
- **THEN** progress overlay SHALL be dismissed
- **AND** success toast SHALL appear (unless silent mode)

#### Scenario: Progress overlay dismisses on error
- **WHEN** auto-group encounters an error
- **THEN** progress overlay SHALL be dismissed
- **AND** error toast SHALL appear

### Requirement: Progress overlay only on Waves screen
The progress overlay SHALL only be displayed when the user is currently on the Waves Hub screen.

#### Scenario: Progress shows when on Waves screen
- **WHEN** auto-group is triggered while user is on Waves Hub
- **THEN** progress overlay SHALL appear
- **AND** user SHALL see progress updates

#### Scenario: Progress does not show when on other screens
- **WHEN** auto-group is triggered while user is on PhotosList, Feed, or other screens
- **THEN** no progress overlay SHALL appear
- **AND** user MAY continue using the app normally

### Requirement: Success toast only for manual mode
When auto-group completes successfully, the system SHALL show a success toast only for manual mode (not silent mode).

#### Scenario: Manual mode shows success toast
- **WHEN** manual auto-group completes with `wavesCreated > 0`
- **THEN** a success toast SHALL appear with message:
  - "Auto-group complete: X waves created, Y photos grouped"

#### Scenario: Silent mode does not show success toast
- **WHEN** automatic auto-group completes with `wavesCreated > 0`
- **THEN** no success toast SHALL appear
- **AND** user SHALL NOT be interrupted

#### Scenario: Success toast when no waves created
- **WHEN** auto-group completes with `wavesCreated === 0`
- **THEN** no success toast SHALL appear (neither manual nor silent mode)
- **AND** user SHALL not be notified of "no action" result

### Progress Overlay Implementation

#### Current Implementation (WavesHub/index.js)
```javascript
const [progressVisible, setProgressVisible] = useState(false)
const [progressText, setProgressText] = useState('')
const [totalWavesCreated, setTotalWavesCreated] = useState(0)
const [totalPhotosGrouped, setTotalPhotosGrouped] = useState(0)
const [totalPhotosRemaining, setTotalPhotosRemaining] = useState(0)

const showProgress = useCallback((count) => {
  setProgressVisible(true)
  setTotalWavesCreated(0)
  setTotalPhotosGrouped(0)
  setTotalPhotosRemaining(count)
  setProgressText('Grouping photos into waves...')
}, [])

const updateProgress = useCallback((wavesCreated, photosGrouped, photosRemaining) => {
  setTotalWavesCreated(prev => prev + wavesCreated)
  setTotalPhotosGrouped(prev => prev + photosGrouped)
  setTotalPhotosRemaining(photosRemaining)
  setProgressText(`Grouping... ${totalWavesCreated + wavesCreated} waves, ${totalPhotosGrouped + photosGrouped} photos grouped`)
}, [totalWavesCreated, totalPhotosGrouped])
```

#### Progress Overlay Component
```javascript
{progressVisible && (
  <View style={styles.progressOverlay}>
    <ActivityIndicator size="large" color={CONST.MAIN_COLOR} />
    <Text style={styles.progressText}>{progressText}</Text>
    <Text style={styles.progressSubtext}>
      Waves created: {totalWavesCreated} | Photos grouped: {totalPhotosGrouped} | Remaining: {totalPhotosRemaining}
    </Text>
  </View>
)}
```

#### Overlay Styles
```javascript
const styles = StyleSheet.create({
  progressOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  progressText: {
    color: '#FFF',
    fontSize: 18,
    marginTop: 20,
    marginBottom: 10,
  },
  progressSubtext: {
    color: '#CCC',
    fontSize: 14,
  },
})
```

## Validation Scenarios

### Scenario: Progress overlay appears and updates across multiple batches
- **WHEN** auto-group processes 500 ungrouped photos across 5 API calls
- **THEN** progress overlay SHALL appear at start
- **AND** progress text SHALL update after each batch:
  - Batch 1: "Grouping... 10 waves, 100 photos grouped"
  - Batch 2: "Grouping... 25 waves, 250 photos grouped"
  - Batch 3: "Grouping... 40 waves, 400 photos grouped"
  - Batch 4: "Grouping... 55 waves, 550 photos grouped"
  - Batch 5: "Grouping... 60 waves, 600 photos grouped"
- **AND** overlay SHALL dismiss when complete

### Scenario: Silent mode progress overlay works correctly
- **WHEN** automatic auto-group triggers while on Waves screen
- **THEN** no confirmation dialog appears
- **AND** progress overlay appears immediately
- **AND** progress updates show correctly
- **AND** no toast appears after completion

### Scenario: Progress overlay dismisses cleanly
- **WHEN** auto-group completes (success or error)
- **THEN** progress overlay SHALL be removed from component tree
- **AND** underlying UI SHALL be accessible again
- **AND** no overlay elements SHALL remain

### Scenario: Navigation during progress overlay
- **WHEN** progress overlay is showing
- **AND** user taps back button or navigates away
- **THEN** WavesHub component SHALL unmount
- **AND** progress overlay SHALL disappear
- **AND** auto-group loop SHALL continue running in background
- **AND** badge SHALL update when completion event is emitted

## References

- `src/screens/WavesHub/index.js` — Progress overlay state and UI
- `src/screens/PhotosList/upload/photoUploadService.js` — Auto-group loop
- `src/events/autoGroupBus.js` — Event emission for completion
