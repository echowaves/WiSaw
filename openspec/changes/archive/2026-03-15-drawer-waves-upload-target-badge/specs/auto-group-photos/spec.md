## REMOVED Requirements

### Requirement: Waves drawer badge shows ungrouped photo count
**Reason**: The drawer badge now indicates upload target wave status instead of ungrouped photo count. The ungrouped count remains visible on the header nav bar auto-group button.
**Migration**: The drawer Waves item uses the `uploadTargetWave` Jotai atom for its badge instead of `getUngroupedPhotosCount`.

## ADDED Requirements

### Requirement: Waves drawer badge shows upload target status
The Waves item in the navigation drawer SHALL display a colored dot badge on its icon when an upload target wave is set, using `CONST.MAIN_COLOR`.

#### Scenario: Upload target wave is set
- **WHEN** the drawer is opened and an upload target wave is set
- **THEN** the Waves drawer icon SHALL display a small filled circle badge in `CONST.MAIN_COLOR`

#### Scenario: No upload target wave
- **WHEN** the drawer is opened and no upload target wave is set
- **THEN** the Waves drawer icon SHALL NOT display any badge

#### Scenario: Badge updates reactively
- **WHEN** the upload target wave is set or cleared while the app is running
- **THEN** the drawer badge SHALL update immediately via the `uploadTargetWave` Jotai atom

### Requirement: Waves drawer label shows upload target wave name
The Waves drawer label SHALL include the upload target wave name when one is set.

#### Scenario: Upload target wave is set
- **WHEN** the drawer is opened and an upload target wave is set
- **THEN** the drawer label SHALL display "Waves — {wave name}"

#### Scenario: No upload target wave
- **WHEN** the drawer is opened and no upload target wave is set
- **THEN** the drawer label SHALL display "Waves"
