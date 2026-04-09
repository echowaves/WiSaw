## Why

The WaveSettings date fields (splash date, freeze date) show a confusing two-element UI: a read-only label displaying the current date value, plus a separate date picker that expands below when tapped. These two views represent the same data and create unnecessary visual complexity. Combining them into a single compact date picker element simplifies the UI.

## What Changes

- Replace the manual date display button + conditionally-shown `DateTimePicker` with a single always-rendered `DateTimePicker` using `display='compact'` on iOS (tappable date label that opens a calendar popover)
- On Android, keep `display='default'` (already a modal picker triggered by tap)
- Remove `showSplashPicker` and `showFreezePicker` toggle state — no longer needed since the picker is always visible as a compact label
- When no date is set, show a "Set Date" button that initializes the picker with a default date
- Keep the clear (ⓧ) button for removing a set date

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `wave-settings-load`: Date fields change from two-element (display + picker) to single compact picker element

## Impact

- **WaveSettings** (`src/screens/WaveSettings/index.js`): Restructure date sections to use compact picker, remove picker visibility state, update styles
- **No new dependencies**: `@react-native-community/datetimepicker` already installed and supports `display='compact'`
- **No backend changes**
- **No API changes**
