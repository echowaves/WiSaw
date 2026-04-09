## 1. WaveSettings — Location & Radius UI

- [x] 1.1 Add location and radius state variables to WaveSettings (`lat`, `lon`, `locationText`, `radius`)
- [x] 1.2 Update `loadSettings` to parse `location` (AWSJSON) and `radius` from `getWave` response, reverse-geocode coords to populate `locationText`, convert radius from meters to miles
- [x] 1.3 Add "Use My Location" button that reads from `locationAtom`, reverse-geocodes, and updates location state
- [x] 1.4 Add address TextInput that geocodes on submit via `Location.geocodeAsync()`, reverse-geocodes the result, and updates location state
- [x] 1.5 Add radius Slider (1–50 miles, step 1, default 10) that only shows when location is set
- [x] 1.6 Update the save/update handler to pass `lat`, `lon`, `radius` (converted to meters) to `updateWave` mutation

## 2. WaveSelectorModal — Location at Creation

- [x] 2.1 Add collapsible "Set Location (optional)" section below the wave name input in create mode
- [x] 2.2 Add "Use My Location" button, address TextInput, and radius slider inside the collapsible section (same logic as WaveSettings)
- [x] 2.3 Pass `lat`, `lon`, `radius` (converted to meters) through `onCreateWave` callback to `createWave` mutation

## 3. Wiring & Integration

- [x] 3.1 Ensure `createWave` call sites (WavesHub, usePhotoActions) forward `lat`, `lon`, `radius` params from WaveSelectorModal to the reducer

## 4. Verification

- [ ] 4.1 Test WaveSettings: set location via "Use My Location", verify reverse-geocoded text displays, save, reload — location persists
- [ ] 4.2 Test WaveSettings: enter an address, verify geocoding resolves and displays normalized text, save, reload
- [ ] 4.3 Test WaveSettings: adjust radius slider, save, reload — radius persists (miles ↔ meters conversion correct)
- [ ] 4.4 Test WaveSelectorModal: create a wave with location/radius, verify params reach `createWave` mutation
- [ ] 4.5 Test WaveSelectorModal: create a wave without setting location, verify no location params sent
