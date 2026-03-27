## 1. Create PhotosListContext

- [x] 1.1 Create `src/contexts/PhotosListContext.js` exporting a React Context with default value `{ removePhoto: () => {} }`.

## 2. Update Photo Component

- [x] 2.1 In `src/components/Photo/index.js`, import `PhotosListContext` and replace `useAtom(STATE.photosList)` with `useContext(PhotosListContext)`. Use `removePhoto` from context as the `onDeleted` callback passed to `usePhotoActions`.

## 3. Wrap PhotosList with Provider

- [x] 3.1 In `src/screens/PhotosList/index.js`, import `PhotosListContext` and wrap the screen content with `<PhotosListContext.Provider>` supplying `removePhoto` that filters `STATE.photosList` via `setPhotosList`.

## 4. Wrap WaveDetail with Provider

- [x] 4.1 In `src/screens/WaveDetail/index.js`, import `PhotosListContext` and wrap the screen content with `<PhotosListContext.Provider>` supplying `removePhoto` that filters the local `photos` state via `setPhotos`.
