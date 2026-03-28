## Context

WiSaw is distributed on the Mac App Store as a native iOS/iPadOS app running on Apple Silicon Macs via Mac Catalyst / "Designed for iPad." On Mac, the app was stuck on "Finding Your Location..." forever.

**Root cause discovered via diagnostic alerts**: `Location.requestForegroundPermissionsAsync()` hangs indefinitely on Mac Catalyst — the Promise never resolves. This blocks all subsequent location code. Once bypassed, `getLastKnownPositionAsync()`, `watchPositionAsync()`, and watcher callbacks all work fine on Mac.

`Location.getForegroundPermissionsAsync()` (check-only, no prompt) works correctly on Mac Catalyst and returns the current permission status.

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

### 1. Permission request timeout with getForegroundPermissionsAsync fallback

**Choice**: Wrap `requestForegroundPermissionsAsync()` in a `Promise.race` with a 5-second timeout. If it doesn't resolve (Mac Catalyst hang), fall back to `getForegroundPermissionsAsync()` (check-only, no prompt) with the same timeout. If both time out, assume `'granted'` (the app wouldn't be running if it had never been granted).

**Rationale**: `requestForegroundPermissionsAsync()` hangs indefinitely on Mac Catalyst — the native bridge call never resolves. `getForegroundPermissionsAsync()` (check-only) works correctly and returns the current permission status. On iOS/Android, `requestForegroundPermissionsAsync()` resolves normally within milliseconds, so the 5s timeout never triggers. No behavior change for mobile.

**Alternatives considered**:
- **Only use `getForegroundPermissionsAsync` everywhere**: Would break the initial permission prompt on iOS/Android for first-time users.
- **Platform detection to skip `requestForeground` on Mac**: Unreliable — Mac Catalyst reports `Platform.OS === 'ios'` with no reliable way to distinguish.
- **Longer timeout**: 5s is generous — on mobile it resolves in <100ms. Shorter would also work but 5s is safe.

### 2. Narrow the !location guard in getPhotos to segment 0 only

**Choice**: In `reducer.getPhotos()`, only return early for `!location` when `activeSegment === 0` (geo feed). Segments 1 (watched) and 2 (search) proceed regardless of location state.

**Rationale**: `requestWatchedPhotos` takes `{ uuid, pageNumber, batch }` — no location. `requestSearchedPhotos` takes `{ pageNumber, searchTerm, batch }` — no location. They're blocked needlessly today. This also benefits mobile — users can see watched/search during the brief GPS acquisition window.

### 3. Platform-aware permission-denied messaging

**Choice**: On macOS, replace the `Alert.alert` with "Open Settings" button with a message explaining how to enable Location Services in macOS System Settings (Privacy & Security → Location Services). `Linking.openSettings()` may not navigate to the correct pane on macOS, so provide text instructions instead.

**Rationale**: The current "Open Settings" button calls `Linking.openSettings()` which on macOS may open the wrong settings pane or do nothing. Text instructions are more reliable on desktop.

## Risks / Trade-offs

- **[5s permission timeout on slow mobile]** → On a very slow device, `requestForegroundPermissionsAsync` might take >5s if the user is slow to respond to the permission dialog. Mitigation: the dialog is native OS, so the Promise resolves when the user taps — 5s is for the hang case where it never resolves at all.
- **[Assuming 'granted' if both permission calls time out]** → If both `requestForeground` and `getForeground` hang, we assume granted and try to use location APIs, which will fail gracefully. This is a last resort that only fires on platforms where the permission bridge is completely broken.
- **[No change to mobile behavior]** → `requestForegroundPermissionsAsync` resolves normally on iOS/Android. The 5s timeout never triggers. All location APIs work identically.
