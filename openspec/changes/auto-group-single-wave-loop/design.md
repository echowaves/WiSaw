## Context

The auto-group feature was recently implemented: a single button on the Waves screen calls `autoGroupPhotosIntoWaves(uuid)` which returned `{ wavesCreated, photosGrouped }` as a batch summary. The backend API has now changed so that each call creates at most one wave, returning `{ waveUuid, name, photosGrouped }`. When `photosGrouped` is `0`, there are no more ungrouped photos. The frontend must call the mutation in a loop until done.

Current implementation lives in:
- `src/screens/Waves/reducer.js` — `autoGroupPhotos({ uuid })` function with the GraphQL mutation
- `src/screens/Waves/index.js` — `handleAutoGroup` callback that calls the reducer once and shows a toast

## Goals / Non-Goals

**Goals:**
- Update the GraphQL mutation to match the new return shape (`{ waveUuid, name, photosGrouped }`)
- Implement a loop that calls the mutation repeatedly until `photosGrouped === 0`
- Show progressive feedback during the loop (how many waves created so far)
- Add each newly created wave to the list incrementally
- Handle errors mid-loop gracefully (show partial results)

**Non-Goals:**
- Changing the button placement, confirmation dialog, or overall UX flow
- Adding cancellation mid-loop (keep it simple for now)
- Modifying the backend mutation behavior

## Decisions

### 1. Loop in the handler, not the reducer

**Decision**: Keep the reducer function as a single-call wrapper. The loop logic lives in `handleAutoGroup` in the Waves screen.

**Rationale**: The reducer is a thin GraphQL call layer — it shouldn't own retry/loop logic. The screen handler already manages state (toasts, loading flags, list updates) so the loop belongs there. Alternative of putting the loop in the reducer would mix concerns.

### 2. Incremental wave list update during the loop

**Decision**: Prepend each newly created wave to the waves list as it comes back, rather than doing a full refresh at the end.

**Rationale**: This gives immediate visual feedback — users see waves appearing one by one. A final `handleRefresh` at the end would cause a flash as the whole list reloads. We still do a final refresh after the loop to ensure consistency, but the incremental updates keep the UX responsive.

### 3. Show a cumulative toast after completion, not per-wave toasts

**Decision**: Show a single summary toast after the loop finishes, not one toast per wave created.

**Rationale**: If the user has many ungrouped photos, showing a toast per wave would spam them. A single summary toast ("Created N waves with M photos") is cleaner. During the loop, the loading indicator and incremental list updates provide sufficient feedback.

### 4. Handle mid-loop errors by reporting partial progress

**Decision**: If an error occurs during the loop, stop the loop, show an error toast that includes how many waves were successfully created, and refresh the list.

**Rationale**: Partial results are still useful. The user can see what was created and retry if needed. Silently swallowing the error or rolling back would be worse.

## Risks / Trade-offs

- **[Long-running loop]** → If there are many ungrouped photos, the loop could take a while. Mitigation: Loading indicator stays active, button is disabled, incremental updates show progress.
- **[No cancellation]** → User can't stop the loop mid-way. Mitigation: Keep this simple for now; individual waves can be deleted manually. Can add cancellation later if needed.
- **[Network interruption mid-loop]** → A network error mid-loop leaves partial results. Mitigation: Error handler shows what was created so far and refreshes the list.
