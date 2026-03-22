## Context

The WiSaw app has a Waves feature for organizing photos into named collections. Users can create, rename, and delete waves, and photos are associated via `addPhotoToWave`/`removePhotoFromWave` mutations. The backend already exposes a `mergeWaves(targetWaveUuid, sourceWaveUuid, uuid, name?, description?)` mutation that absorbs all photos from a source wave into a target wave and deletes the source. No client UI exists for this mutation today.

The WavesHub screen displays a grid of WaveCards with a long-press context menu (ActionSheetIOS on iOS, Alert on Android) offering Rename, Edit Description, and Delete. The WaveDetail screen has an identical menu behind a header ellipsis (⋯) button. Both menus need a new "Merge Into Another Wave..." option that opens a purpose-built target picker modal.

WaveCards currently have no visual affordance indicating that long-press is available, which hurts discoverability.

## Goals / Non-Goals

**Goals:**
- Let users merge one wave into another via a clear, discoverable UI flow
- Make the long-press context menu discoverable with a tappable ⋮ icon on WaveCard and a one-time tooltip
- Keep the merge flow simple: pick target → confirm → done
- Keep both context menus (WavesHub and WaveDetail) in sync

**Non-Goals:**
- Renaming the target wave during merge (users can rename separately)
- Handling `activeWave` atom when the source is the active wave (v2)
- Connecting auto-group results to a merge flow
- Symmetric merge (creating a new wave from two sources)
- Batch merge (merging multiple waves at once)

## Decisions

### 1. Absorb model (source → target)
The user long-presses the **source** wave and selects a **target** from a list. The source is absorbed into the target. This matches the backend API shape (`targetWaveUuid` + `sourceWaveUuid`) and the most common mental model: "merge this into that."

*Alternative*: Pick two waves then choose which survives. Rejected — adds a step and complicates the flow.

### 2. Purpose-built MergeWaveModal (not reusing WaveSelectorModal)
The existing `WaveSelectorModal` has concerns we don't need (create-new-wave, remove-from-wave) and would require conditional rendering to strip them. A dedicated `MergeWaveModal` is simpler: it fetches the wave list, filters out the source, provides search, and yields a selection.

The modal fetches its own wave list so it always has fresh data, regardless of WavesHub's scroll position or filter state.

*Alternative*: Reuse `WaveSelectorModal` with props to hide unwanted features. Rejected — conditional complexity isn't worth the code reuse savings.

### 3. Tappable ⋮ icon on WaveCard (Google Photos pattern)
A three-dot vertical icon is placed in the WaveCard's info row, right-aligned. Tapping it fires the same `onLongPress` callback. This makes the context menu discoverable without requiring the user to know about long-press.

### 4. One-time tooltip via SecureStore
On first load of WavesHub, a floating tooltip ("Hold or tap ⋮ for options") appears near the first WaveCard's ⋮ icon. A SecureStore key (`waveContextMenuTooltipShown`) persists dismissal so it only shows once per device.

*Alternative*: No tooltip. Rejected — the ⋮ icon alone may not be enough for users who have never seen it.

### 5. Post-merge navigation from WaveDetail
When merging from inside WaveDetail (the source wave's detail view), the source ceases to exist after merge. The handler calls `router.back()` after the mutation succeeds and shows a toast.

### 6. Optimistic list update in WavesHub
After a successful `mergeWaves` response, WavesHub removes the source from `waves` state and updates the target's `photosCount` by adding the source's count. No full refresh needed — the mutation returns the updated target `Wave` object.

## Risks / Trade-offs

- **[Stale photosCount in modal]** The MergeWaveModal fetches waves independently, so counts may be slightly stale if the user just uploaded. → Acceptable; counts are informational only.
- **[Active wave becomes stale]** If the source wave is the user's `activeWave`, merging it doesn't clear the atom. → Documented as non-goal; low frequency edge case for v2.
- **[Large wave merge latency]** If both waves have thousands of photos, the backend mutation may take time. → Show a loading indicator in the confirmation flow. The mutation is atomic on the backend.
- **[Platform menu inconsistency]** iOS uses ActionSheetIOS (native sheet), Android uses Alert (dialog buttons). → Existing pattern throughout the app; not introducing new inconsistency.
