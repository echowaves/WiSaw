## ADDED Requirements

### Requirement: Compact date picker for date fields
Each date field (splash date, freeze date) in WaveSettings SHALL use a single compact `DateTimePicker` element that combines date display and date editing, instead of separate display label and picker components.

#### Scenario: iOS date display and editing
- **WHEN** a date field has a value set on iOS
- **THEN** the field SHALL render a `DateTimePicker` with `display='compact'` that shows the current date as a tappable label opening a native calendar popover

#### Scenario: Android date display and editing
- **WHEN** a date field has a value set on Android
- **THEN** the field SHALL render a `DateTimePicker` with `display='default'` that opens a modal date picker on tap

#### Scenario: Date not set
- **WHEN** a date field has no value (null)
- **THEN** the field SHALL display a "Set Date" button instead of the picker

#### Scenario: Setting a date for the first time
- **WHEN** the user taps "Set Date" on an unset date field
- **THEN** the date SHALL be initialized to today and saved to the backend, and the compact picker SHALL appear in place of the button

#### Scenario: Clearing a set date
- **WHEN** a date field has a value and the user taps the clear button
- **THEN** the date SHALL be cleared (set to null) on the backend and the "Set Date" button SHALL replace the picker

### Requirement: No picker visibility toggle state
WaveSettings SHALL NOT maintain separate show/hide state for date pickers. The compact picker manages its own popover state internally.

#### Scenario: State variables removed
- **WHEN** WaveSettings renders
- **THEN** there SHALL be no `showSplashPicker` or `showFreezePicker` state variables
