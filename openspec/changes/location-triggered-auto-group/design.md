## Context

WiSaw is a React Native app where users take photos that go into an "ungrouped" pool. Currently, users must manually tap "Auto Group" to trigger server-side clustering via the `autoGroupPhotosIntoWaves` GraphQL mutation. The server handles all clustering logic (Haversine distance, reverse geocoding, wave naming). The goal is to make this automatic: when the user resumes the app and has moved significantly from their last grouping location, auto-group should trigger without user intervention.

The app already has `useLocationProvider` with a 3-phase location strategy (Phase 1: last known, Phase 2: high-accuracy GPS, Phase 3: balanced watcher). The app uses Jotai for state, AsyncStorage for persistence, and expo-location for GPS.

## Goals / Non-Goals

**Goals:**
- Auto-trigger server-side grouping on app foreground when location drift exceeds threshold
- Provide granularity settings UI (Near/Medium/Far/World presets)
- Show progress overlay during grouping operations
- Persist auto-group settings (toggle, granularity, last trigger location)

**Non-Goals:**
- Client-side clustering algorithm (server handles this)
- Reverse geocoding on client (server uses AWS GeoPlaces)
- Background location tracking (foreground-only to preserve battery)
- Real-time grouping (batch on foreground events only)
- Per-wave granularity (global per-user setting for v1)

## Decisions

### Decision 1: Trigger on app foreground only (not background tracking)

```
WHY: Battery preservation + sufficient UX coverage
┌─────────────────────────────────────────────────────────────┐
│  App goes to background                                     │
│     │                                                       │
│     ▼                                                       │
│  [Photos taken while bg'd — stored server-side ungrouped]  │
│     │                                                       │
│     ▼                                                       │
│  App resumes to foreground                                   │
│     │                                                       │
│     ▼                                                       │
│  useLocationProvider has Phase 3 watcher running            │
│  (Balanced accuracy, 100m interval, 60s interval)           │
│     │                                                       │
│     ▼                                                       │
│  useLocationDrift hook compares:                            │
│  currentCoords vs lastTriggerLocation                        │
│     │                                                       │
│     ▼                                                       │
│  drift > threshold? → Trigger autoGroupPhotosIntoWaves      │
└─────────────────────────────────────────────────────────────┘

ALT: Background location updates
  → Rejected: battery drain, user might take photos while app is bg'd
  → Mitigated: foreground check on resume catches bg'd photos
```

**Rationale**: The existing Phase 3 watcher already runs in the background when the app is foregrounded. Checking on `AppState` 'foreground' event is sufficient — users typically open the app to check it, and that's when they'd expect grouping.

### Decision 2: Granularity presets (not slider)

```
┌─────────────────────────────────────────────────────────────┐
│  GRANULARITY PRESETS (stored as server enum)                 │
├────────────┬───────────────┬────────┬──────────────────────┤
│  UI Label  │  Server Enum  │  Km    │  Use Case            │
├────────────┼───────────────┼────────┼──────────────────────┤
│  Near      │  DISTRICT     │  10    │  Neighborhood events  │
│  Medium ↩  │  CITY         │  50    │  City-wide (default)  │
│  Far       │  REGION       │  250   │  Regional trips       │
│  World     │  COUNTRY      │ 1000   │  Annual vacation      │
└────────────┴───────────────┴────────┴──────────────────────┘

UI: Horizontal segment control (like tab bar)
┌────────┬────────┬───────┬───────┐
│  Near  │ Medium │  Far  │ World │
└────────┴────────┴───────┴───────┘
```

**Rationale**: Simpler UX (4 taps vs drag), maps directly to server enum, no ambiguity about what "5.3km" means to the user.

### Decision 3: Haversine distance in a utility function

```javascript
// src/utils/haversine.js
export function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371 // km
  const toRad = deg => deg * Math.PI / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
```

**Rationale**: Already exists in the server code (`/tmp/WiSaw.cdk/lambda-fns/controllers/waves/autoGroupPhotosIntoWaves.ts:114`). Duplicate on client is fine — it's a pure function, ~10 lines, no external deps. Avoids adding a geospatial library.

### Decision 4: Persistence layer with AsyncStorage

```
┌─────────────────────────────────────────────────────────────┐
│  PERSISTENCE LAYER (AsyncStorage + Jotai)                    │
├──────────────────────────┬──────────────────────────────────┤
│  Key                     │  Data                           │
├──────────────────────────┼──────────────────────────────────┤
│  autoGroupEnabled        │  "true" | "false" (default: "true") │
│  groupingGranularity     │  "DISTRICT" | "CITY" | "REGION" | "COUNTRY" │
│  lastTriggerLat          │  number (null if never triggered)   │
│  lastTriggerLon          │  number (null if never triggered)   │
└──────────────────────────┴──────────────────────────────────┘

Jotai atoms (derived from AsyncStorage):
  groupingAtom = atomWithStorage('groupingSettings', {
    enabled: true,
    granularity: 'CITY',
    lastTriggerLat: null,
    lastTriggerLon: null,
  })
```

**Rationale**: Use a single Jotai atom with `atomWithStorage` (from `jotai/utils` or a lightweight wrapper) to avoid multiple AsyncStorage calls. Initialize on app start.

### Decision 5: Progress overlay in WavesHub (not full-screen)

```
┌─────────────────────────────────────────────────────────────┐
│  WavesHub (current screen)                                  │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  ⏳ Auto-Grouping                    [cancel]            ││
│  │  ─────────────────────────────────────────────────────── ││
│  │   23 photos grouped                                      ││
│  │   2 waves created                                        ││
│  │                                                          ││
│  │   ████████████████████████░░░░░░░░  70%                  ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  [Waves list below, dimmed during overlay]                   │
└─────────────────────────────────────────────────────────────┘
```

**Rationale**: User should see progress without losing context of what they were doing. Server returns paginated results (`hasMore`), so grouping might take multiple round-trips.

### Decision 6: Last trigger location update semantics

```
┌─────────────────────────────────────────────────────────────┐
│  TRIGGER LOCATION UPDATE RULES                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  autoGroup completes → photosGrouped > 0                    │
│    → UPDATE lastTriggerLat/Lon to current GPS coords          │
│                                                             │
│  autoGroup completes → photosGrouped === 0                  │
│    → DO NOT update last trigger location                    │
│    (no grouping happened, so reference shouldn't move)      │
│                                                             │
│  User manually triggers "Auto Group" (existing button)      │
│    → Same rules apply (update only if photos were grouped)  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Rationale**: Prevents the "drift" reference from moving when no actual grouping occurred. This ensures the next trigger comparison is always against the last REAL grouping location.

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|------|--------|------------|
| User takes photos at Location A, then Location B, app only checks on resume | Photos at Location B stay ungrouped until next resume | Acceptable for v1. User can always manually tap "Auto Group" |
| Location drift triggers at every app resume if user commutes daily | Excessive auto-grouping | Granularity presets let users set large thresholds (e.g., COUNTRY = 1000km). Toggle lets users disable entirely |
| AsyncStorage init race condition (settings not loaded before first foreground) | Misses first foreground trigger | Defer first trigger check until settings are loaded. If settings pending, skip |
| Phase 3 GPS accuracy insufficient for small drifts | False positive triggers (groups when user hasn't moved far) | Phase 2 (High accuracy) runs on app start before Phase 3. Use Phase 2 coords for drift check if available |
| Server autoGroupPhotosIntoWaves is slow (>30s for large batches) | UI hangs during progress | Show loading state. Server processes up to 1000 photos per call. Pagination (`hasMore`) handles larger sets |

## Migration Plan

No migration needed. This is a purely additive feature:
1. New AsyncStorage keys are initialized with defaults
2. Existing "Auto Group" button continues to work unchanged
3. New auto-trigger is opt-in via toggle (default ON)
4. No server changes required

## Open Questions

1. **Should auto-group trigger on app START (not just resume)?** — Currently scoped to foreground events only. Could extend to initial mount if desired.
2. **Should we debounce triggers within a short window (e.g., 5 minutes)?** — Prevents rapid successive triggers if user toggles app quickly. Recommended: add 5-minute cooldown.
3. **Should the granularity setting be per-user global or per-wave?** — Currently scoped to per-user global for v1. Per-wave would require storing granularity per-user and passing it to the mutation (server already accepts it as optional param).
