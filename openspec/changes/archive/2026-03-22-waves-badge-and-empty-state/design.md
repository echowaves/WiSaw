## Context

The Waves header has a kebab (three-dot) icon that opens an ActionSheetIOS/Alert menu with "Create New Wave" and "Auto Group (N ungrouped)". The ungrouped count is already fetched and maintained in state via `fetchUngroupedCount()` in the route file (`app/(drawer)/waves/index.tsx`), refreshed on `useFocusEffect` and `subscribeToAutoGroupDone`. However, the count is currently only visible inside the menu text — not on the icon.

The empty state uses `EmptyStateCard` which supports a single action button. The search bar renders unconditionally above the FlatList.

## Goals / Non-Goals

**Goals:**
- Show an inline badge with the ungrouped count on the kebab icon (reuse the proven inline row layout)
- Hide the search bar when the waves list is empty
- Show a secondary "Auto Group N photos" action in the empty state
- Pass `ungroupedCount` from route file to WavesHub as a prop

**Non-Goals:**
- Real-time badge updates while viewing other screens (useFocusEffect is sufficient)
- Adding new event bus channels for photo add/remove
- Changing the auto-group or create-wave flows

## Decisions

### 1. Badge uses inline flexDirection row layout on kebab icon
**Choice**: Same inline layout pattern proven in the previous badge-full-count change — `flexDirection: 'row'` on the button, badge as a sibling `View` with `marginLeft: 4`.
**Rationale**: This pattern was validated through multiple iterations. Absolute positioning fails on iOS due to `overflow: 'hidden'` cascading.

### 2. Pass ungroupedCount to WavesHub as a prop
**Choice**: `<WavesHub ungroupedCount={ungroupedCount} />` in the route file.
**Rationale**: The count is already computed in the route file. Prop drilling one level is simpler than duplicating the GraphQL query or creating a new event bus.

### 3. Extend EmptyStateCard with secondary action props
**Choice**: Add optional `secondaryActionText` and `onSecondaryActionPress` props to `EmptyStateCard`.
**Rationale**: Keeps the component reusable. The secondary button renders below the primary one with a different visual style (outlined vs filled) to establish hierarchy.

### 4. Conditional search bar based on waves.length
**Choice**: Wrap the search bar in `{waves.length > 0 && ...}`.
**Rationale**: Simplest approach. Search is useless with no waves. The `waves` state is already available.

## Risks / Trade-offs

- [EmptyStateCard API expansion] → Low risk; adding optional props is backward-compatible. Existing callers unaffected.
- [Auto-group in empty state shows count of 0] → Auto-group button should be hidden or disabled when `ungroupedCount === 0`. Only show when there are photos to group.
