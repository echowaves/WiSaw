## MODIFIED Requirements

### Requirement: Auto-Group Button in Waves Header
The system SHALL display a kebab (three-dot vertical) menu icon in the upper-right navigation bar of the Waves screen. The button SHALL use reactive theme colors from `getTheme(isDarkMode)` (not static `SHARED_STYLES.theme`) to properly support dark mode. The icon SHALL display an inline ungrouped-count badge when the count is greater than zero. Tapping the icon SHALL open an `ActionMenu` modal with management and sort options, using icons and visual separators between action groups.

#### Scenario: Waves header kebab button uses reactive theme
- **WHEN** the user navigates to the Waves screen in dark mode
- **THEN** the kebab button SHALL use `theme.INTERACTIVE_BACKGROUND` for background, `theme.INTERACTIVE_BORDER` for border, and `theme.TEXT_PRIMARY` for icon color
- **THEN** these values SHALL be derived from `getTheme(isDarkMode)` to reflect the current theme mode

#### Scenario: Waves screen renders header with kebab menu icon
- **WHEN** the user navigates to the Waves screen (via drawer or waves-hub route)
- **THEN** the header's right slot SHALL contain a button with a `dots-vertical` icon (MaterialCommunityIcons)

#### Scenario: Kebab icon shows ungrouped photo count badge
- **WHEN** the Waves screen loads or refreshes
- **THEN** the system SHALL call `getUngroupedPhotosCount(uuid)` GraphQL query
- **THEN** if the count is greater than zero, a pill-shaped badge SHALL display inline next to the kebab icon using a row layout with `marginLeft: 4`
- **THEN** the badge SHALL show the full numeric count without any cap
- **THEN** if the count is zero, no badge SHALL be shown

#### Scenario: Badge updates on focus
- **WHEN** the Waves screen regains focus
- **THEN** the system SHALL re-fetch the ungrouped count
- **THEN** the badge SHALL update to reflect the current count

#### Scenario: Badge updates after auto-group or wave delete
- **WHEN** the `autoGroupDone` event is emitted (after auto-group completes or a wave is deleted)
- **THEN** the system SHALL re-fetch the ungrouped count
- **THEN** the badge SHALL update to reflect the current count

#### Scenario: User taps kebab menu icon
- **WHEN** the user taps the kebab icon
- **THEN** an `ActionMenu` modal SHALL be displayed with the following items:
  - `plus-circle-outline` icon: "Create New Wave"
  - `view-grid-plus-outline` icon: "Auto Group" (with ungrouped count if > 0)
  - separator
  - `sort-descending` icon: "Updated, Newest First" (checked if active)
  - `sort-ascending` icon: "Updated, Oldest First" (checked if active)
  - `sort-descending` icon: "Created, Newest First" (checked if active)
  - `sort-ascending` icon: "Created, Oldest First" (checked if active)

#### Scenario: User selects Create New Wave from menu
- **WHEN** the user selects "Create New Wave" from the ActionMenu
- **THEN** the system SHALL emit the `addWave` event via `emitAddWave()`
- **THEN** WavesHub SHALL receive the event and open the create-wave modal

#### Scenario: User selects Auto Group from menu
- **WHEN** the user selects "Auto Group" from the ActionMenu
- **THEN** the system SHALL call `emitAutoGroup(ungroupedCount)` to trigger the existing auto-group flow

#### Scenario: User selects a sort option from menu
- **WHEN** the user selects a sort option from the ActionMenu
- **THEN** the system SHALL update `sortBy` and `sortDirection` state with the corresponding values
- **THEN** the waves list SHALL refresh with the new sort order

### Requirement: getUngroupedPhotosCount Query
The system SHALL expose a `getUngroupedPhotosCount` function in the waves reducer that calls the `getUngroupedPhotosCount(uuid)` GraphQL query.

#### Scenario: Query returns count
- **WHEN** `getUngroupedPhotosCount` is called with a valid uuid
- **THEN** the function SHALL return an integer representing the number of photos not assigned to any wave
