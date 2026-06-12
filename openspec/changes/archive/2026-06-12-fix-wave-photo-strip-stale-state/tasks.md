# Tasks: Fix WavePhotoStrip Stale Photos State

## Phase 1: Fix Stale State in WavePhotoStrip

### Task 1.1: Add useEffect to sync initialPhotos
- [x] Add `useEffect(() => { setPhotos(initialPhotos) }, [initialPhotos])` in `WavePhotoStrip`
- [x] Ensure `useEffect` is already imported (it is — line 1)
- [x] Place the effect after the `useState` declarations and before the `autoScrollTrigger` effect

**Files**: `src/components/WavePhotoStrip/index.js`

**Acceptance**:
- When `initialPhotos` prop changes, `photos` state updates to match
- New photos appear in the strip immediately after refresh without navigation
- No component remounting (no key prop changes)
