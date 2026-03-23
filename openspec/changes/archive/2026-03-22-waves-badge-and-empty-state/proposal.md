## Why

The kebab menu icon in the Waves header currently shows no visual indicator of ungrouped photos — the count is hidden inside the menu. Users cannot tell at a glance whether they have photos to organize. Additionally, the empty waves list still shows a search bar (useless with no waves) and only offers "Create a Wave" — missing the auto-group action that would let users organize existing photos immediately.

## What Changes

- Re-add an ungrouped-count badge on the kebab menu icon itself (inline layout, visible without opening the menu)
- Hide the search bar when the waves list is empty
- Add a secondary "Auto Group N photos" action button to the empty state card
- Pass the ungrouped count from the route file to WavesHub so the empty state can display and use it
- Extend `EmptyStateCard` to support a secondary action button

## Capabilities

### New Capabilities

_None_

### Modified Capabilities

- `waves-auto-group-header`: The kebab menu icon SHALL display an ungrouped-count badge; the count continues to refresh on focus and autoGroupDone events
- `wave-hub`: The empty state SHALL hide the search bar and show both "Create a Wave" and "Auto Group N photos" actions

## Impact

- **Files**: `app/(drawer)/waves/index.tsx`, `src/screens/WavesHub/index.js`, `src/components/EmptyStateCard/index.js`
- **No new dependencies or API changes**
