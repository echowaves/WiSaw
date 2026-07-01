## Purpose
This specification defines expected user-visible behavior, constraints, and validation scenarios for wave multi-select in WiSaw.

## Requirements

### Requirement: User can enter wave selection mode
The WavesHub screen SHALL provide a "Select" button in the header that toggles selection mode on and off.

#### Scenario: User enters selection mode
- **WHEN** user taps the "Select" button in browse mode
- **THEN** the screen enters selection mode, the header shows a "Deselect" button and selection count, and WaveCards display selection indicators

#### Scenario: User exits selection mode
- **WHEN** user taps the "Deselect" button in selection mode
- **THEN** the screen returns to browse mode, all selection state is cleared, and the header returns to its default state

### Requirement: User can toggle wave selection by tapping
The system SHALL allow users to tap individual wave cards to toggle their selection state while in selection mode.

#### Scenario: User taps unselected wave
- **WHEN** user taps an unselected wave card in selection mode
- **THEN** the wave becomes selected and displays a check overlay

#### Scenario: User taps selected wave
- **WHEN** user taps a selected wave card in selection mode
- **THEN** the wave becomes deselected and the check overlay is removed

### Requirement: Only owner waves are selectable
The system SHALL only allow waves where the user has the "owner" role to be selected for combining.

#### Scenario: User taps non-owned wave in selection mode
- **WHEN** user taps a wave card where myRole is not "owner" in selection mode
- **THEN** the wave does not change selection state and no visual feedback is shown

### Requirement: Selection count is displayed in header
The system SHALL display the current selection count in the header while in selection mode.

#### Scenario: Selection count updates
- **WHEN** user toggles wave selections
- **THEN** the header count reflects the number of selected waves (e.g., "Count: 3")

### Requirement: Context menu is disabled in selection mode
The system SHALL disable the long-press context menu on wave cards while in selection mode.

#### Scenario: User long-presses wave in selection mode
- **WHEN** user long-presses a wave card in selection mode
- **THEN** the context menu does not appear and the tap is treated as a selection toggle