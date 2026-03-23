## Tasks

### Task 1: Add progress overlay UI and state to WavesHub
- **File**: `src/screens/WavesHub/index.js`
- **Changes**:
  - Add `autoGroupProgress` state: `{ photosGrouped: 0, wavesCreated: 0 }`
  - Add a `<Modal transparent visible={autoGrouping}>` block with:
    - Semi-transparent backdrop (`rgba(0,0,0,0.5)`)
    - Centered card with `ActivityIndicator` and two `Text` lines showing progress
  - Style the card to match existing modal styling (theme.CARD_BACKGROUND, rounded corners, padding)
- **Depends on**: None

### Task 2: Update handleAutoGroup loop to update progress state
- **File**: `src/screens/WavesHub/index.js`
- **Changes**:
  - Reset `autoGroupProgress` to `{ photosGrouped: 0, wavesCreated: 0 }` at start of loop
  - After each batch iteration, call `setAutoGroupProgress` with running totals
  - Ensure `setAutoGrouping(false)` is called in all exit paths (success, error) to dismiss overlay
- **Depends on**: Task 1
