## Why

Both the Waves and Friends screens have inconsistent sort UIs (arrows vs segmented) and inconsistent sort semantics (Waves uses Updated/Created, Friends uses A-Z/Z-A/Recent). Users expect a uniform experience: A-Z with up arrow for ascending, Recent with up arrow for newest-first, and clicking toggles direction. Additionally, "Recent" should sort by `updatedAt` (not `createdAt`) for both screens.

## What Changes

- **Unify sort UI**: Both screens use `mode="arrows"` in SortOrderPicker — each option shows a label + chevron that toggles on tap
- **Unify sort options**: Replace "Updated"/"Created" on Waves and "A-Z"/"Z-A"/"Recent" on Friends with a consistent set: **A-Z** and **Recent**
- **A-Z behavior**: Default direction is ascending (A→Z, ▲). Tapping toggles to descending (Z→A, ▼). Tapping again returns to A-Z (▲).
- **Recent behavior**: Default direction is newest-first (▲). Tapping toggles to oldest-first (▼). Tapping again returns to newest-first (▲).
- **Recent sort field**: Both screens sort "Recent" by `updatedAt` (not `createdAt`)
- **Remove createdAt sort**: Neither screen passes sort-by createdAt to the API

## Capabilities

### Modified Capabilities
- `friends-sort`: Sort options, UI mode, sort field for "recent"
- `photo-wave-assignment`: Sort options for waves (name-based instead of Created/Updated)

## Impact

- `src/screens/FriendsList/index.js` — sort options, UI mode, sort logic
- `src/screens/WavesHub/index.js` — sort options, sort logic
- `src/screens/WavesHub/reducer.js` — add name sort to GraphQL query
- `src/components/SortOrderPicker/index.js` — no changes needed (already supports arrows mode)
- `src/state.js` — no changes needed (atoms already use correct default values)