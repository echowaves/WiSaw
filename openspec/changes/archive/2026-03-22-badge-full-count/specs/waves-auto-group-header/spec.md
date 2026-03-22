## MODIFIED Requirements

### Requirement: Auto-Group Button in Waves Header
The system SHALL display an auto-group button in the upper-right navigation bar of the Waves screen, visible at all times without scrolling.

#### Scenario: Waves screen renders header with auto-group button
- **WHEN** the user navigates to the Waves screen (via drawer or waves-hub route)
- **THEN** the header's right slot SHALL contain a button with a `layer-group` icon

#### Scenario: Auto-group button shows ungrouped photo count badge
- **WHEN** the Waves screen loads or refreshes
- **THEN** the system SHALL call `getUngroupedPhotosCount(uuid)` GraphQL query
- **THEN** if the count is greater than zero, a pill-shaped badge SHALL display the full numeric count on the auto-group button without any cap or abbreviation
- **THEN** the badge SHALL expand horizontally to fit the number with adequate padding
- **THEN** if the count is zero, no badge SHALL be shown

#### Scenario: User taps auto-group button
- **WHEN** the user taps the auto-group button in the header
- **THEN** a confirmation dialog SHALL appear: "This will automatically group your ungrouped photos into waves. Continue?"
- **THEN** upon confirmation, the `autoGroupPhotosIntoWaves` mutation SHALL execute in a loop until `hasMore` is false

#### Scenario: Auto-group completes
- **WHEN** auto-grouping finishes successfully
- **THEN** the wave list SHALL refresh to show newly created waves
- **THEN** the ungrouped photo count badge SHALL update to reflect the remaining count (typically zero)
- **THEN** a success toast SHALL display the number of waves created and photos grouped

#### Scenario: No ungrouped photos exist
- **WHEN** the user taps the auto-group button and `getUngroupedPhotosCount` returns zero
- **THEN** a toast SHALL inform the user "No ungrouped photos found"
