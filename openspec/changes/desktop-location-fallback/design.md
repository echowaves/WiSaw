## Context

WiSaw is distributed on the Mac App Store as a native iOS/iPadOS app running on Apple Silicon Macs via Mac Catalyst / "Designed for iPad." On Mac, `expo-location`'s `getLastKnownPositionAsync()` returns `null` (no cached position), and `watchPositionAsync` starts successfully but its callback never fires because the Mac is stationary — `distanceInterval: 100` (meters) is never met, and `timeInterval: 60000` (ms) may not force an initial emit on macOS. The app remains stuck on status `'pending'` and shows "Finding Your Location..." forever.

macOS does have CoreLocation WiFi-based positioning (Apple's WiFi location service), which provides city-level accuracy (~1-5km). `getCurrentPositionAsync` with low accuracy can force CoreLocation to resolve this, typically within a few seconds.

The feed query `feedByDate` doesn't filter by distance — `ST_Distance` is only computed as annotation. Wave auto-grouping uses 50-100km thresholds. City-level accuracy from WiFi positioning is more than sufficient.

## Goals / Non-Goals

**Goals:**
- Mac users get a resolved location within ~10 seconds of app launch
- Watched photos and search work immediately, even before location resolves
- Camera stays blocked until real (non-zero) location is obtained
- Platform-appropriate error messaging on macOS

**Non-Goals:**
- Supporting GPS-level accuracy on desktop
- External IP geolocation API calls
- Changing the backend to accept null/zero locations for photo uploads
- Modifying the `isValidLocation` utility (it correctly rejects zero/NaN coords)

## Decisions

### 1. Timeout + getCurrentPositionAsync fallback

**Choice**: After permission is granted, start a ~10 second timer. If neither `getLastKnownPositionAsync` nor `watchPositionAsync` have provided a position by then, call `Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Lowest })`. This one-shot call forces CoreLocation to resolve from WiFi.

**Rationale**: `getCurrentPositionAsync` is a blocking "give me whatever you have now" call that doesn't depend on movement/distance thresholds. With `Accuracy.Lowest`, it should resolve quickly from WiFi. The 10-second window gives the normal flow (fast-seed + watcher) a fair chance before falling back, so mobile behavior is unchanged.

**Alternatives considered**:
- **External IP geolocation API**: Adds external dependency, privacy concerns, network dependency. Unnecessary since CoreLocation WiFi positioning is available on Mac.
- **Shorter timeout (3-5s)**: Could race with legitimate slow GPS acquisition on mobile. 10s gives mobile enough time while still resolving quickly on desktop.
- **Lower distanceInterval in watcher**: Would increase battery usage on mobile for minimal benefit.

### 2. Narrow the !location guard in getPhotos to segment 0 only

**Choice**: In `reducer.getPhotos()`, only return early for `!location` when `activeSegment === 0` (geo feed). Segments 1 (watched) and 2 (search) proceed regardless of location state.

**Rationale**: `requestWatchedPhotos` takes `{ uuid, pageNumber, batch }` — no location. `requestSearchedPhotos` takes `{ pageNumber, searchTerm, batch }` — no location. They're blocked needlessly today. This also benefits mobile — users can see watched/search during the brief GPS acquisition window.

### 3. Platform-aware permission-denied messaging

**Choice**: On macOS, replace the `Alert.alert` with "Open Settings" button with a message explaining how to enable Location Services in macOS System Settings (Privacy & Security → Location Services). `Linking.openSettings()` may not navigate to the correct pane on macOS, so provide text instructions instead.

**Rationale**: The current "Open Settings" button calls `Linking.openSettings()` which on macOS may open the wrong settings pane or do nothing. Text instructions are more reliable on desktop.

## Risks / Trade-offs

- **[getCurrentPositionAsync may also fail on some Macs]** → If WiFi positioning is unavailable (rare — would require no WiFi connection), the fallback also fails. Mitigation: Layer 2 ensures watched/search still work. User sees a message about location being unavailable for geo feed only.
- **[10s timeout adds delay on Mac]** → The watcher might genuinely never fire on Mac, so users wait 10 seconds before the fallback kicks in. Acceptable for desktop; mobile is unaffected since watcher typically fires within 1-2 seconds.
- **[No change to mobile behavior]** → The timeout only fires if the normal flow hasn't provided a position. Mobile devices with GPS will resolve before the timeout, so no behavior change for iOS/Android.
