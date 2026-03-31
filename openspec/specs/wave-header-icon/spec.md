## MODIFIED Requirements

### Requirement: Wave Icon in Feed Header
The system SHALL display a wave icon in the upper-right corner of the main photo feed header as a state-aware navigation button to the Waves Hub. The icon color SHALL reflect wave state: `MAIN_COLOR` when waves exist, `TEXT_SECONDARY` when no waves exist or state is not yet loaded. A red dot badge SHALL appear when ungrouped photos exist. Navigation SHALL use `router.navigate()` (idempotent) instead of `router.push()` to prevent duplicate screen instances on rapid taps. On mount, the component SHALL fetch `wavesCount`, `ungroupedPhotosCount`, and `bookmarksCount` in a single `Promise.all`.

#### Scenario: User has no waves
- **WHEN** `wavesCount` atom is `0` or `null`
- **THEN** the wave icon SHALL render in `theme.TEXT_SECONDARY` color (grey)
- **THEN** no red dot badge SHALL be displayed (unless ungrouped photos exist)

#### Scenario: User has waves
- **WHEN** `wavesCount` atom is greater than `0`
- **THEN** the wave icon SHALL render in `CONST.MAIN_COLOR` (coral)

#### Scenario: User has ungrouped photos
- **WHEN** `ungroupedPhotosCount` atom is greater than `0`
- **THEN** a red dot badge SHALL be displayed on the wave icon at `position: absolute, top: 4, right: 4`, matching the `IdentityHeaderIcon` badge style
- **THEN** the icon color SHALL be `CONST.MAIN_COLOR` regardless of `wavesCount`

#### Scenario: Atoms not yet loaded
- **WHEN** `wavesCount` is `null` and `uuid` is non-empty
- **THEN** the icon SHALL render in `theme.TEXT_SECONDARY` (grey) with no badge
- **THEN** the component SHALL fetch `getWavesCount`, `getUngroupedPhotosCount`, and `getBookmarksCount` in parallel and update all three atoms

#### Scenario: User taps wave icon
- **WHEN** the user taps the wave icon
- **THEN** the Waves Hub screen SHALL be navigated to via `router.navigate('/waves')`
- **THEN** the navigation SHALL be idempotent — tapping again while already on Waves SHALL NOT push a duplicate

#### Scenario: User double-taps wave icon rapidly
- **WHEN** the user taps the wave icon twice in quick succession
- **THEN** only one Waves Hub instance SHALL exist in the navigation state
- **THEN** the back button SHALL return to the previous screen in one press

## REMOVED Requirements

### Requirement: Upload Target Badge on Wave Icon
**Reason**: The upload target concept is being removed entirely. The wave icon no longer needs to indicate upload target status.
**Migration**: No migration needed. The wave icon becomes a simple navigation button.

### Requirement: Upload Target Name on Long-Press
**Reason**: The upload target concept is being removed. There is no upload target name to display.
**Migration**: No migration needed.
