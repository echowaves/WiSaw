## Context

The Waves feature currently allows users to manually create waves and add individual photos to them. The backend already exposes an `autoGroupPhotosIntoWaves(uuid: String!): AutoGroupResult!` mutation that automatically groups a user's ungrouped photos into waves (returning `wavesCreated` and `photosGrouped` counts). The frontend has no way to invoke this.

The existing Waves screen (`src/screens/Waves/index.js`) manages wave CRUD operations through a reducer pattern (`src/screens/Waves/reducer.js`). The screen uses a FlatList with pull-to-refresh, modals for create/edit, and swipe gestures for delete. The `uuid` atom from Jotai state identifies the current user.

## Goals / Non-Goals

**Goals:**
- Provide a single-tap action for users to auto-group ungrouped photos into waves
- Show clear feedback on how many waves were created and photos grouped
- Integrate seamlessly with the existing Waves screen UI
- Refresh the wave list after successful auto-grouping

**Non-Goals:**
- Customizing auto-grouping parameters (radius, time window) — the backend handles this with defaults
- Showing a preview of proposed groupings before confirming
- Modifying the backend `autoGroupPhotosIntoWaves` resolver logic
- Adding undo/rollback capability for auto-grouping

## Decisions

### 1. Add auto-group mutation to existing Waves reducer

**Decision**: Add the `autoGroupPhotosIntoWaves` GraphQL mutation to `src/screens/Waves/reducer.js` alongside existing wave mutations.

**Rationale**: The reducer already contains all wave-related GraphQL operations (`listWaves`, `createWave`, `updateWave`, `deleteWave`). This follows the established pattern and keeps wave operations co-located. Alternative was creating a separate utility module, but that would break the existing convention.

### 2. Place auto-group button in the Waves screen header area

**Decision**: Add an "Auto-Group" button next to the existing "+" (create wave) button in the Waves screen action area.

**Rationale**: The action is wave-management related and belongs on the Waves screen. Placing it near the create button makes it discoverable. Users can choose between manual wave creation or automatic grouping. Alternative of placing it in a menu or settings was considered but rejected for discoverability.

### 3. Use confirmation Alert before triggering auto-group

**Decision**: Show a native `Alert.alert` confirmation dialog before calling the mutation.

**Rationale**: Auto-grouping is a bulk operation that creates potentially many waves. Users should confirm before proceeding. Using the native Alert matches the existing pattern used for wave deletion in the Waves screen. No new dependencies needed.

### 4. Show results via Toast notification

**Decision**: Display the `AutoGroupResult` (wavesCreated, photosGrouped) using the existing `react-native-toast-message` library.

**Rationale**: Toast notifications are already used throughout the app for success/error feedback. This is consistent with how wave creation and deletion confirmations work. The toast naturally disappears, keeping the flow uninterrupted.

### 5. Trigger full wave list refresh after auto-group

**Decision**: After successful auto-grouping, reset pagination state and reload the waves list from the beginning.

**Rationale**: New waves created by auto-grouping need to appear in the list. A full refresh (same pattern as pull-to-refresh) ensures the list is complete and correctly ordered. Incremental insertion would be complex since we don't know which waves were created.

## Risks / Trade-offs

- **[Long-running operation]** → The auto-group mutation may take time if the user has many ungrouped photos. Mitigation: Show a loading indicator and disable the button during the operation.
- **[No undo]** → Once photos are grouped, there's no bulk undo. Mitigation: Confirmation dialog warns the user. Individual photos can still be removed from waves manually.
- **[Zero results]** → If all photos are already grouped, the mutation may return `{ wavesCreated: 0, photosGrouped: 0 }`. Mitigation: Show an informative toast message indicating no ungrouped photos were found.
- **[API availability]** → The mutation must be deployed on the backend. Mitigation: Standard error handling will catch and display any API errors.
