## Context

The waves list screen (`WavesHub`) displays a paginated grid of waves fetched via GraphQL `listWaves` query. The backend already supports optional `sortBy` (string) and `sortDirection` (string) parameters on `listWaves`, but the frontend does not pass them. The current header kebab menu (in `app/(drawer)/waves/index.tsx`) has: Cancel, Create New Wave, Auto Group. The `listWaves` function lives in `src/screens/Waves/reducer.js` and accepts `{ pageNumber, batch, uuid }`.

## Goals / Non-Goals

**Goals:**
- Allow users to sort the waves list by `createdAt` or `updatedAt`, in `ASC` or `DESC` direction
- Add sort options as items in the existing kebab header menu
- Default to `updatedAt` / `desc`
- Session-only state — sort resets to default on app restart

**Non-Goals:**
- Persist sort preferences across app restarts (SecureStore)
- Add new UI components like chips or sort bars
- Multi-field sorting
- Sort by name or other fields

## Decisions

### 1. Sort state location: Jotai atoms vs. local React state

**Decision**: Use local `useState` in `WavesHub` component, passed down via callback from the waves index route.

**Rationale**: Sort state is session-only and scoped to this screen. The kebab menu lives in `app/(drawer)/waves/index.tsx` (the route), while `loadWaves` lives in `WavesHub`. The route already passes callbacks (`showHeaderMenu`) to WavesHub. Adding sort state as Jotai atoms shared between the route and WavesHub would work, but local state keeps it simpler and consistent with the existing pattern where the route calls into WavesHub callbacks. The route will receive current sort values and an `onSortChange` callback from WavesHub via the existing pattern of header function setup.

**Alternative considered**: Jotai atoms for `sortBy`/`sortDirection` — rejected because this is purely local UI state with no persistence requirement.

### 2. Menu structure: Flat items in existing kebab menu

**Decision**: Add sort options as direct items in the existing ActionSheet alongside Cancel/Create New Wave/Auto Group.

**Rationale**: User chose Option A. The menu will show sort options with a checkmark (✓) prefix on the currently active option. The menu items will be:
- Cancel
- Create New Wave
- Auto Group (N ungrouped)
- ✓ Sort: Updated, Newest First (or whichever is active)
- Sort: Updated, Oldest First
- Sort: Created, Newest First
- Sort: Created, Oldest First

Note: Backend accepts lowercase values (`"asc"`, `"desc"`, `"createdAt"`, `"updatedAt"`) — see `ALLOWED_DIRECTIONS` and `ALLOWED_SORT_FIELDS` maps in the resolver.

### 3. Refresh behavior on sort change

**Decision**: Changing sort resets pagination to page 0 with a new batch UUID, then re-fetches the list.

**Rationale**: Since the backend controls sort order during pagination, changing sort mid-stream requires resetting to the beginning. This is the same pattern used by focus refresh.

### 4. How sort params flow to the GraphQL query

**Decision**: Extend `listWaves` function signature in `src/screens/Waves/reducer.js` to accept optional `sortBy` and `sortDirection` parameters, and include them as GraphQL variables only when provided.

**Rationale**: Keeps backward compatibility — existing callers without sort params continue to work (backend defaults apply). The GraphQL query string adds them as optional `String` parameters.

## Risks / Trade-offs

- [Menu gets longer with 4 sort items] → Acceptable trade-off; the menu goes from 3 to 7 items which is still manageable on mobile
- [No persistence — sort resets on restart] → User explicitly chose session-only; can add persistence later if needed
- [Sort checkmark is text-based, not a native control] → ActionSheetIOS and Alert don't support custom controls; text prefix is the standard mobile pattern
