## Context

WiSaw waves currently have no geographic boundary. The backend already stores `location` (AWSJSON) and `radius` (Int) on the Wave type, and `createWave`/`updateWave` mutations accept `lat`, `lon`, `radius` params — but no client UI exists to set them. The device's location is already tracked globally via `locationAtom` (from `useLocationProvider`). `expo-location` is installed and provides `geocodeAsync` / `reverseGeocodeAsync`.

## Goals / Non-Goals

**Goals:**
- Let wave creators set a geographic location on a wave via "Use My Location" or address input
- Let wave creators set a radius (in miles) for geo-fencing
- Support location/radius at both wave creation (WaveSelectorModal) and wave settings (WaveSettings)
- Display the wave's location as human-readable text (reverse-geocoded)

**Non-Goals:**
- Map picker UI — use text-based input and "Use My Location" button only
- Backend changes — all mutations and types already support location/radius
- Enforcing the geo-fence (posting restriction) — that's a backend concern already handled
- "Clear location" action — not needed per requirements

## Decisions

### 1. Geocoding approach: expo-location built-in functions
Use `Location.geocodeAsync(address)` to convert typed addresses to coords, and `Location.reverseGeocodeAsync({latitude, longitude})` to display stored coords as text.

**Why over alternatives:**
- Already installed, no new dependency
- Works offline on iOS (Apple CLGeocoder), reasonable on Android (Google)
- Simpler than adding a separate geocoding API

### 2. Location state shape
Store location in component state as `{ lat, lon, displayText }`. On load, if wave has `location` (AWSJSON parsed as `{lat, lon}`), reverse-geocode to populate `displayText`. On save, pass `lat`, `lon` to `updateWave`/`createWave`.

### 3. Radius units: miles with conversion
Slider displays miles. Convert to meters for backend storage (`radius` field is Int, representing meters on the server). Conversion: `miles × 1609`.

Range: 1–50 miles, step of 1 mile. Default: 10 miles.

### 4. UI placement in WaveSettings
Add Location section **below** the existing date sections, **above** the frozen notice. Follows the same section pattern (label + control).

### 5. WaveSelectorModal integration
Add a collapsible "Set Location" section to the wave creation modal. Collapsed by default to keep the modal simple. When expanded, shows the same "Use My Location" button, address input, and radius slider.

### 6. Address input: simple TextInput with submit
No autocomplete or dropdown suggestions — just a plain TextInput. User types an address/city and presses return. `geocodeAsync` resolves it. If it fails, show an alert. City-level accuracy is fine.

## Risks / Trade-offs

- **[Geocoding rate limits]** → expo-location geocoding uses platform APIs (Apple/Google) which have generous limits for on-device use. Not a concern for per-user settings usage.
- **[Geocoding unavailable on web]** → `geocodeAsync` may not work on web platform. Mitigation: web is lowest priority platform; location features can be hidden or disabled on web if needed.
- **[Address ambiguity]** → User types "Springfield" — multiple matches exist. Mitigation: `geocodeAsync` returns the best match; reverse-geocode the result to show what was resolved so user can verify.
- **[Radius stored as meters, displayed as miles]** → Rounding differences on load/save. Mitigation: round to nearest mile on display; acceptable at city-level granularity.
