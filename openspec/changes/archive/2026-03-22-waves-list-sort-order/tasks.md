## 1. GraphQL Query Update

- [x] 1.1 Add `sortBy` and `sortDirection` as optional parameters to the `listWaves` function in `src/screens/Waves/reducer.js` — update the GraphQL query string to include `$sortBy: String` and `$sortDirection: String`, pass them as variables when provided

## 2. WavesHub Sort State and Data Flow

- [x] 2.1 Add `sortBy` / `sortDirection` state to `src/screens/WavesHub/index.js` with defaults `"updatedAt"` / `"DESC"`, pass them to `loadWaves` calls, and expose `onSortChange` + current sort values to the parent route via the existing `setShowHeaderMenu` pattern
- [x] 2.2 Implement sort change handler: when sort changes, reset pagination to page 0 with new batch UUID and re-fetch; skip refresh if selecting the already-active sort

## 3. Kebab Menu Sort Options

- [x] 3.1 Update the kebab menu in `app/(drawer)/waves/index.tsx` to include four sort items after the existing options: "Sort: Updated, Newest First", "Sort: Updated, Oldest First", "Sort: Created, Newest First", "Sort: Created, Oldest First" — prefix the active option with "✓ ", and wire selection to `onSortChange`
