## Why

PhotosList (the main feed) stores its photo array in a global Jotai atom (`STATE.photosList`) while WaveDetail uses local `useState`. Now that the `PhotosListContext` decouples the `Photo` component from any specific state store, `STATE.photosList` has exactly one consumer — PhotosList itself. A global atom serving a single screen is unnecessary complexity. Switching PhotosList to `useState` makes both photo-list screens consistent, removes dead atom code, and simplifies state.js.

## What Changes

- Replace `useAtom(STATE.photosList)` in PhotosList with `useState([])`, freezing photos at write boundaries (already done at both entry points)
- Remove `photosList`, `photosListAtom`, and `protectPhotos` from `src/state.js`
- Remove the dev-mode console.log about the enhanced atom
- Remove the `createFrozenPhoto` import from `src/state.js` (no longer needed there)

## Capabilities

### New Capabilities

_None_

### Modified Capabilities

- `photo-feed`: PhotosList SHALL use screen-local state (`useState`) for its photo array instead of a global Jotai atom, consistent with WaveDetail

## Impact

- `src/state.js` — remove `photosList` atom, `photosListAtom`, `protectPhotos`, related import and dev log (~20 lines deleted)
- `src/screens/PhotosList/index.js` — switch from `useAtom(STATE.photosList)` to `useState([])`; update `removePhoto` and `QuickActionsModalWrapper` to use local setter
- No impact on WaveDetail, Photo, PhotosListContext, or any other file
