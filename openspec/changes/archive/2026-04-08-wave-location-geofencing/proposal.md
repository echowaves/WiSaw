## Why

Shared waves have no geographic boundary, so anyone with the link can post photos regardless of their physical location. Adding geo-fencing lets wave creators restrict posting to people within a radius of a specific location, keeping content relevant (e.g., an event venue, a neighborhood, a city).

## What Changes

- Add a **Location** section to WaveSettings with:
  - Display of current wave location as reverse-geocoded text (city/address)
  - "Use My Location" button that grabs device coords from `locationAtom` and reverse-geocodes for display
  - Text input to enter a city or address, geocoded to lat/lon on submit
  - Radius slider in **miles** (e.g., 1–50 mi)
- Add location/radius fields to the **wave creation** flow in WaveSelectorModal so creators can set geo-fence at creation time
- Wire `lat`, `lon`, `radius` params through to existing `createWave` and `updateWave` GraphQL mutations (backend already supports these fields)
- Load and display existing wave location/radius when opening WaveSettings (data already returned by `getWave` query)

## Capabilities

### New Capabilities
- `wave-location-input`: UI for setting and displaying a wave's geographic location via "Use My Location" button or address text input, with reverse-geocoding for display
- `wave-radius-input`: Radius slider control (in miles) for configuring geo-fence distance

### Modified Capabilities
- `wave-settings-load`: Add location and radius to the state loaded/saved in WaveSettings
- `wave-selector-modal`: Add optional location/radius fields to wave creation flow

## Impact

- **Code**: `src/screens/WaveSettings/index.js`, `src/components/WaveSelectorModal/index.js`, `src/screens/Waves/reducer.js` (pass-through only — mutations already accept lat/lon/radius)
- **Dependencies**: `expo-location` (already installed) — uses `Location.geocodeAsync()` and `Location.reverseGeocodeAsync()` (new usage, no new package)
- **API**: No backend changes — `createWave` and `updateWave` mutations already accept `lat: Float, lon: Float, radius: Int`
- **Platforms**: iOS, Android, Web (geocoding may have limited availability on web)
