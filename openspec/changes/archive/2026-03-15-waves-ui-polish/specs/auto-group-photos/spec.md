## MODIFIED Requirements

### Requirement: Auto-group button on Waves screen
The Waves screen SHALL display an "Auto-Group" action button in the upper-right nav bar header that shows the number of ungrouped photos as a badge. The badge SHALL update after auto-group operations complete and on screen mount.

#### Scenario: Auto-group button shows ungrouped count
- **WHEN** the user navigates to the Waves screen and there are ungrouped photos
- **THEN** the auto-group button in the upper-right nav bar SHALL display a red badge with the ungrouped photo count
- **THEN** counts above 99 SHALL display as "99+"

#### Scenario: No ungrouped photos
- **WHEN** the user navigates to the Waves screen and there are no ungrouped photos
- **THEN** the auto-group button SHALL NOT display a badge

#### Scenario: Badge refreshes after auto-group
- **WHEN** the auto-group operation completes
- **THEN** the header button badge SHALL update to reflect the new ungrouped photo count

### Requirement: Confirmation before auto-grouping
The system SHALL display a confirmation dialog before executing the auto-group operation to prevent accidental invocations. The confirmation dialog SHALL include the number of ungrouped photos available for grouping.

#### Scenario: User confirms auto-group
- **WHEN** the user taps the "Auto-Group" button
- **THEN** the system SHALL display a confirmation dialog that includes the ungrouped photo count (e.g. "You have 42 ungrouped photos. This will automatically group them into waves. Continue?")
- **WHEN** the user confirms
- **THEN** the system SHALL call the `autoGroupPhotosIntoWaves` mutation with the user's UUID

#### Scenario: User cancels auto-group
- **WHEN** the user taps the "Auto-Group" button and the confirmation dialog appears
- **WHEN** the user cancels
- **THEN** no mutation SHALL be called and the screen SHALL remain unchanged

## ADDED Requirements

### Requirement: Waves drawer badge shows ungrouped photo count
The Waves item in the navigation drawer SHALL display a badge showing the number of ungrouped photos, matching the visual treatment of the auto-group header button badge.

#### Scenario: Ungrouped photos exist
- **WHEN** the drawer is opened and there are ungrouped photos
- **THEN** the Waves drawer icon SHALL display a red badge with the ungrouped count
- **THEN** counts above 99 SHALL display as "99+"

#### Scenario: No ungrouped photos
- **WHEN** the drawer is opened and there are no ungrouped photos
- **THEN** the Waves drawer icon SHALL NOT display a badge

#### Scenario: Badge refreshes after auto-group
- **WHEN** the auto-group operation completes (success or partial success)
- **THEN** the drawer badge count SHALL update to reflect the new ungrouped photo count
