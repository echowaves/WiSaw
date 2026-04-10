## 1. Remove picker visibility state

- [x] 1.1 Remove `showSplashPicker` and `showFreezePicker` state declarations from WaveSettings
- [x] 1.2 Remove `setShowSplashPicker` and `setShowFreezePicker` calls from `handleSplashDateChange` and `handleFreezeDateChange`

## 2. Restructure splash date section

- [x] 2.1 Replace the splash date section: when `splashDate` is null, render a "Set Date" button that sets today's date and saves; when set, render `DateTimePicker` with `display={Platform.OS === 'ios' ? 'compact' : 'default'}` plus a clear button
- [x] 2.2 Update `handleSplashDateChange` to work with the always-rendered compact picker (remove show/hide toggling)

## 3. Restructure freeze date section

- [x] 3.1 Replace the freeze date section: same pattern as splash — "Set Date" button when null, compact `DateTimePicker` plus clear button when set
- [x] 3.2 Update `handleFreezeDateChange` to work with the always-rendered compact picker (remove show/hide toggling)

## 4. Clean up styles

- [x] 4.1 Remove unused styles (`dateButton`, `dateText`) and add any new styles needed for the "Set Date" button layout

## 5. Verify

- [ ] 5.1 Test on iOS: tap compact date label → calendar popover opens → select date → saves → clear button removes date → "Set Date" button reappears
- [ ] 5.2 Test: frozen wave settings — freeze date picker remains usable, splash date "Set Date" / picker is disabled
