## ADDED Requirements

### Requirement: Dependencies match Expo SDK expectations
All third-party native module packages SHALL be pinned to versions compatible with the installed Expo SDK, as reported by `npx expo install --check`.

#### Scenario: No version mismatch warnings
- **WHEN** `npx expo install --check` is run for async-storage, netinfo, and get-random-values
- **THEN** no version mismatch warnings are reported for these packages

### Requirement: Android release build succeeds
The Android release build SHALL complete without Gradle dependency resolution errors.

#### Scenario: Gradle resolves all dependencies
- **WHEN** the Android release build runs
- **THEN** all Maven artifacts resolve successfully and the build completes
