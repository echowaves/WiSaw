## Context

PhotosList currently stores its photo array in `STATE.photosList`, a custom Jotai atom with an auto-freezing setter. This was originally needed because the `Photo` component directly wrote to the atom for deletion. The `fix-expanded-photo-deletion` change introduced `PhotosListContext`, decoupling `Photo` from any specific state store. Now `STATE.photosList` has a single consumer (PhotosList screen), making it an over-engineered `useState`.

WaveDetail already uses `useState([])` with manual `createFrozenPhoto` calls at write boundaries. PhotosList already does the same freezing at its write boundaries (fetch and upload). The atom's auto-freezing is redundant.

## Goals / Non-Goals

**Goals:**
- Make PhotosList use `useState` for its photo array, matching WaveDetail's pattern
- Remove `photosList` atom, `photosListAtom`, `protectPhotos` from `src/state.js`
- Clean up the now-unnecessary dev log and import

**Non-Goals:**
- Changing how WaveDetail manages state (already uses `useState`)
- Modifying PhotosListContext or Photo component (unchanged)
- Removing other Jotai atoms from state.js (uuid, nickName, etc. are used cross-screen)

## Decisions

### 1. Replace atom with useState, keep freezing at boundaries

**Choice**: `const [photosList, setPhotosList] = useState([])` in PhotosList. Continue calling `createFrozenPhoto` at the two existing write points (fetch callback, upload callback).

**Alternative — Add auto-freezing wrapper around useState**: Create a custom hook `useFrozenState` that mimics the atom's auto-freeze. Rejected: the freezing is already done at both entry points, adding a wrapper would be complexity for no benefit.

**Rationale**: WaveDetail already uses this exact pattern. Both screens freeze at boundaries. Consistent and simple.

### 2. Update QuickActionsModalWrapper prop name

**Choice**: The PhotosList `QuickActionsModalWrapper` currently receives `setPhotosList` prop. Keep this prop name — it's the local setter now instead of the atom setter, but the interface is identical (both accept a function updater or direct value).

## Risks / Trade-offs

- [Risk] If a future feature needs cross-screen photo list access → Would need to re-introduce shared state. Mitigated: no such feature exists or is planned; if needed, the context pattern already provides the right abstraction point.
- [Trade-off] Losing the atom's automatic freeze safety net → Acceptable: both write points already freeze manually, and this matches WaveDetail's working pattern.
