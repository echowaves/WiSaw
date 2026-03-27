## Why

When a user deletes an expanded photo from the WaveDetail screen, the API call succeeds but the photo stays in the masonry grid. The `Photo` component hardcodes `useAtom(STATE.photosList)` for its deletion handler, which updates the global Jotai atom — not WaveDetail's local `useState`. The same flow works in PhotosList only because both the screen and `Photo` happen to share the same atom.

The root cause is that `Photo` is coupled to a specific state store. The fix introduces a React Context (`PhotosListContext`) so each screen provides its own `removePhoto` implementation. `Photo` consumes the context — no prop threading through ExpandableThumb or PhotosListMasonry needed.

## What Changes

- Create `PhotosListContext` with a `removePhoto(photoId)` function
- `Photo` component uses `useContext(PhotosListContext)` instead of `useAtom(STATE.photosList)` for deletion
- PhotosList wraps its content with the context provider, supplying an atom-based `removePhoto`
- WaveDetail wraps its content with the context provider, supplying a useState-based `removePhoto`

## Capabilities

### New Capabilities

_None_

### Modified Capabilities

- `wave-detail`: Deleting or removing an expanded photo SHALL immediately filter it from the masonry grid, matching PhotosList behavior

## Impact

- `src/contexts/PhotosListContext.js` — new file, ~5 lines
- `src/components/Photo/index.js` — replace `useAtom(STATE.photosList)` with `useContext(PhotosListContext)`
- `src/screens/PhotosList/index.js` — wrap content with `PhotosListContext.Provider`
- `src/screens/WaveDetail/index.js` — wrap content with `PhotosListContext.Provider`
- No changes to ExpandableThumb, PhotosListMasonry, QuickActionsModalWrapper, or usePhotoActions
