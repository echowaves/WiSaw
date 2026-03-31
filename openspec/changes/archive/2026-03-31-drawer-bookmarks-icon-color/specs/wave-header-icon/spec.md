## MODIFIED Requirements

### Requirement: Wave Icon in Feed Header
The system SHALL display a wave icon in the upper-right corner of the main photo feed header as a state-aware navigation button to the Waves Hub. The icon color SHALL reflect wave state: `MAIN_COLOR` when waves exist, `TEXT_SECONDARY` when no waves exist or state is not yet loaded. A red dot badge SHALL appear when ungrouped photos exist. Navigation SHALL use `router.navigate()` (idempotent) instead of `router.push()` to prevent duplicate screen instances on rapid taps. On mount, the component SHALL fetch `wavesCount`, `ungroupedPhotosCount`, and `bookmarksCount` in a single `Promise.all`.

#### Scenario: Atoms not yet loaded
- **WHEN** `wavesCount` is `null` and `uuid` is non-empty
- **THEN** the icon SHALL render in `theme.TEXT_SECONDARY` (grey) with no badge
- **THEN** the component SHALL fetch `getWavesCount`, `getUngroupedPhotosCount`, and `getBookmarksCount` in parallel and update all three atoms
