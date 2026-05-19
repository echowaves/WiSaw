## Context

The backend `field-matching-grouping` change renamed `Granularity` → `GroupingLevel` and `granularity` → `groupingLevel` across the GraphQL schema, resolvers, lambda functions, and database. The client app still uses the old naming convention, creating a naming inconsistency.

The client's auto-grouping system has two layers:
1. **Client-side trigger** (`useLocationDrift`): Uses haversine distance + threshold to decide WHEN to call the auto-group mutation
2. **Server-side grouping** (`autoGroupPhotosIntoWaves`): Uses field-matching to decide WHICH photos go into waves

The distance threshold function (`getGroupingThreshold`) is a trigger heuristic, not the grouping logic itself. It stays but gets renamed to clarify its purpose.

## Goals / Non-Goals

**Goals:**
- Rename `granularity` → `groupingLevel` consistently across all client files
- Rename storage key with backward-compatible migration
- Update UI text to reflect field-matching behavior
- Update screen descriptions to describe what grouping actually does

**Non-Goals:**
- Changing the grouping algorithm (already done on backend)
- Removing the distance-based trigger (it's a valid heuristic for when to call the mutation)
- Adding per-wave grouping settings (currently global per-user)

## Decisions

### Decision 1: Storage Key Migration

**Choice**: Read from old key on first load, write to new key. Delete old key after successful read.

```
┌──────────────────────────────────────────────────────────────┐
│                    Storage Migration Flow                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  loadGroupingSettings():                                      │
│    1. Try new key @grouping:groupingLevel                     │
│    2. If not found, try old key @grouping:granularity         │
│    3. If old key found, write to new key, delete old key      │
│    4. Return value (new key takes precedence)                 │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Rationale**: Existing users have the old key stored. A clean migration ensures they don't lose their setting while new users get the new key.

**Alternatives considered**:
- Keep old key forever → code has dead branch, confusing
- Break old users → bad UX, they'd reset to default
- Dual-key with no migration → both keys persist forever

### Decision 2: Keep Distance Threshold Function

**Choice**: Rename `getGranularityThreshold` → `getGroupingThreshold` but keep the function. It serves as the auto-trigger distance threshold, not the grouping logic.

**Rationale**: The distance threshold is a reasonable heuristic for deciding WHEN to call the auto-group mutation. The correlation between threshold and grouping level is intentional:

| GroupingLevel | Threshold | Rationale |
|---------------|-----------|-----------|
| DISTRICT | 10km | Neighborhood scale — user needs to move significantly to trigger |
| CITY | 50km | City scale — reasonable for typical city commute |
| REGION | 250km | Regional scale — inter-city travel |
| COUNTRY | 1000km | National scale — cross-country travel |

**Alternatives considered**:
- Remove threshold entirely → would trigger on every foreground, too aggressive
- Time-based cooldown only → doesn't account for actual location change
- Adaptive thresholds based on city size → too complex, requires external API

### Decision 3: Update UI Descriptions

**Choice**: Replace distance-based descriptions with field-matching descriptions.

```
┌──────────────────────────────────────────────────────────────┐
│                    UI Description Changes                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Current (distance-based):           New (field-matching):    │
│  ──────────────────────               ──────────────────────  │
│  Near — Within ~10 km              →  Near — Same district    │
│  Medium — Within ~50 km            →  Medium — Same city      │
│  Far — Within ~250 km              →  Far — Same region       │
│  World — Within ~1000 km           →  World — Same country    │
│                                                              │
│  Section title: "Granularity" → "Grouping Level"              │
│  Info card: "distance threshold" → "field-matching"           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Rationale**: The current descriptions are misleading. Grouping is based on reverse geocoding fields, not distance. Users should understand what actually determines grouping.

### Decision 4: Variable and Function Renames

**Choice**: Consistent rename across all files.

```
┌──────────────────────────────────────────────────────────────┐
│                    Rename Map                                   │
├─────────────────────┬────────────────────────────────────────┤
│ Current Name          │ New Name                              │
├─────────────────────┼────────────────────────────────────────┤
│ _groupingState.granularity │ _groupingState.groupingLevel    │
│ STORAGE_KEYS.GRANULARITY │ STORAGE_KEYS.GROUPING_LEVEL       │
│ saveGroupingGranularity()│ saveGroupingLevel()               │
│ setGroupingGranularity() │ setGroupingLevel()                │
│ getGranularityThreshold()│ getGroupingThreshold()            │
│ handleGranularityPress() │ handleGroupingLevelPress()        │
│ granularity (variable) │ groupingLevel (variable)            │
│ GRANULARITY_OPTIONS  │ GROUPING_LEVEL_OPTIONS               │
└─────────────────────┴────────────────────────────────────────┘
```

## Risks / Trade-offs

### Risk: Storage migration race condition

If the app loads settings from two places simultaneously during migration, the old value could be overwritten.

→ **Mitigation**: The migration reads the old key, writes the new key, then deletes the old key — all in sequence within `loadGroupingSettings()`. No concurrent reads.

### Risk: Existing users with old storage key

Users who have already set their grouping level have it stored under `@grouping:granularity`.

→ **Mitigation**: The migration in `loadGroupingSettings()` reads from the old key and copies it to the new key on first load.

### Risk: UI descriptions are less intuitive

"Same city" is more abstract than "Within ~50 km". Some users may prefer the concrete distance.

→ **Mitigation**: Keep the distance in parentheses as a rough guide: "Same city (~50 km scale)".

## Impact Map

```
┌─────────────────────────────────────────────────────────────────┐
│                     CHANGE IMPACT MAP                             │
├──────────────────────┬──────────────────────────────────────────┤
│ File                   │ Change                                     │
├──────────────────────┼──────────────────────────────────────────┤
│ utils/groupingAtom.js│ granularity → groupingLevel               │
│                        │ setGroupingGranularity → setGroupingLevel│
├──────────────────────┼──────────────────────────────────────────┤
│ utils/groupingStorage│ GRANULARITY → GROUPING_LEVEL              │
│                        │ saveGroupingGranularity →               │
│                        │   saveGroupingLevel                     │
│                        │ getGranularityThreshold →               │
│                        │   getGroupingThreshold                  │
│                        │ Add backward-compatible migration        │
├──────────────────────┼──────────────────────────────────────────┤
│ screens/GroupingSet- │ granularity → groupingLevel               │
│ tings/index.js       │ UI text: "Granularity" → "Grouping Level" │
│                        │ Update descriptions to field-matching    │
├──────────────────────┼──────────────────────────────────────────┤
│ screens/WaveSettings │ Granularity → Grouping Level              │
│ /index.js            │                                          │
├──────────────────────┼──────────────────────────────────────────┤
│ hooks/useLocationDr- │ grouping.granularity →                    │
│ ift.js               │   grouping.groupingLevel                  │
├──────────────────────┼──────────────────────────────────────────┤
│ utils/__tests__/     │ getGranularityThreshold →               │
│ groupingStorage.test │   getGroupingThreshold                  │
└──────────────────────┴──────────────────────────────────────────┘
```
