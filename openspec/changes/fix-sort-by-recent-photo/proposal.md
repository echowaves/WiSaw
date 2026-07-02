## Why

The "Recent" sort for both friends and waves currently uses the record's `updatedAt` timestamp (friendship creation date / wave update date) instead of the most recent photo's timestamp. Users expect "Recent" to mean "sorted by most recently added photo" — the primary social signal that drives engagement with these screens.

## What Changes

- **Friends "Recent" sort**: Re-sort confirmed friends by the timestamp of their most recent shared photo (not the friendship creation date). Pending friends remain pinned at top regardless of sort.
- **Waves "Recent" sort**: Re-sort waves by the timestamp of their most recent photo (not the wave `updatedAt` field). Uses the backend's existing `recentPhoto` sort field.
- **A-Z sorts**: No changes — already correctly sorting by name (friends by local `contact`, waves by `name`).

## Capabilities

### Modified Capabilities
- `friends-sort`: Friends "Recent" sort now uses most recent photo date instead of friendship creation date
- `waves-list-sort`: Waves "Recent" sort now uses most recent photo date instead of wave `updatedAt`

## Impact

**Frontend (WiSaw)**:
- `src/screens/FriendsList/index.js` — Update client-side sort for `updatedAt` to use photo date (`photos[0]?.updatedAt`) instead of `updatedAt`
- `src/screens/WavesHub/index.js` — Update `loadWaves` to pass `sortBy: 'recentPhoto'` to backend when sort is "Recent"; update client-side `filteredWaves` accordingly

**Backend (Wisaw.cdk)**:
- No changes needed — `getFriendshipsList.ts` already supports `recentPhoto` sort field with a subquery
- No changes needed — `listWaves.ts` already supports `recentPhoto` sort field with a subquery