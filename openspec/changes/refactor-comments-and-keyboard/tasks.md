## 1. Fix submitComment to return real comment

- [x] 1.1 In `reducer.js`, update the `createComment` mutation selection set to include `updatedAt` and `uuid` alongside the existing `id`, `active`, `comment`.
- [x] 1.2 In `reducer.js`, have `submitComment` return `{ ...comment, hiddenButtons: true }` on success (instead of `return null`).

## 2. Remove optimistic comment machinery from Photo/index.js

- [x] 2.1 Remove the `optimisticComment` / `setOptimisticComment` useState.
- [x] 2.2 Remove the `global.photoOptimisticCallbacks` registration useEffect.
- [x] 2.3 Remove the optimistic-comment-clearing logic (the `setTimeout` + text-match check inside the main data loading useEffect).
- [x] 2.4 Remove the 1500ms delay and the `setPhotoDetails(null)` call from the `internalRefreshKey > 0` branch.
- [x] 2.5 In `renderCommentsRows`, remove the optimistic merge (`allComments` line), the conditional styling for fake comments, and the `optimisticComment` dependency.
- [x] 2.6 In `onSubmitEditing` and the send button `onPress`, replace the `setOptimisticComment(...)` call with: await `submitComment`, take the returned comment, and append it to `photoDetails.comments` via `setPhotoDetails`.

## 3. Fix keyboard scroll with native event

- [x] 3.1 Add `Keyboard` to the react-native import in `Photo/index.js`.
- [x] 3.2 Replace the `setTimeout(300)` block in the "Add Comment" `onPress` handler with a one-shot `Keyboard.addListener('keyboardDidShow', (e) => {...})` that measures the input and passes `keyboardTop: e.endCoordinates.screenY` to `onRequestEnsureVisible`.
- [x] 3.3 In `PhotosListMasonry.js`, update the `onRequestEnsureVisible` callback to use `keyboardTop` (when provided) as the viewport bottom instead of `my + mh`.
