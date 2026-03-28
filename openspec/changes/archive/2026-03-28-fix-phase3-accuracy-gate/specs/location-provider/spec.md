## MODIFIED Requirements

### Requirement: Location Provider Hook
The system SHALL provide a `useLocationProvider` hook at `src/hooks/useLocationProvider.js` that manages location permission, fast-seed, 3-phase watcher lifecycle, and accuracy-gated atom updates. It SHALL be called once from the root `_layout.tsx`. The permission request SHALL handle Mac Catalyst where `requestForegroundPermissionsAsync` hangs by falling back to `getForegroundPermissionsAsync` with a timeout.

#### Scenario: Phase 3 transition resets accuracy gate
- **WHEN** Phase 2 ends and the hook transitions to Phase 3
- **THEN** `storedAccuracyRef` SHALL be reset to `Infinity` before the Phase 3 watcher is started
- **THEN** Phase 3 Balanced-accuracy fixes SHALL be accepted immediately, regardless of the accuracy achieved during Phase 2

#### Scenario: Phase 3 maintenance watcher
- **WHEN** Phase 2 ends (accuracy threshold met or timeout)
- **THEN** the hook SHALL start a watcher with `Accuracy.Balanced`, `distanceInterval: 100`, `timeInterval: 60000`
- **THEN** on each callback, the atom SHALL only be updated if the new accuracy is less than or equal to the stored accuracy

## ADDED Requirements

### Requirement: Development logging
The hook SHALL log phase transitions and watcher callbacks to the console when `__DEV__` is true. Logs SHALL be stripped from production builds automatically by the bundler.

#### Scenario: Phase transition logging
- **WHEN** `__DEV__` is true and a phase transition occurs (Phase 1 seed, Phase 2 start, Phase 2→3 transition, Phase 3 start)
- **THEN** a console log SHALL be emitted with the phase name and current accuracy/coords

#### Scenario: Watcher callback logging
- **WHEN** `__DEV__` is true and a Phase 2 or Phase 3 watcher callback fires
- **THEN** a console log SHALL be emitted with the fix accuracy, coordinates, and whether the fix was accepted or rejected by the gate
