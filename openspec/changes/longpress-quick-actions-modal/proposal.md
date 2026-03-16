## Why

Long-pressing a photo thumbnail in the feed currently shows a platform-specific wave picker (ActionSheetIOS on iOS, limited Alert on Android). Users must fully expand a photo to access other actions like Report, Delete, Star, or Share. This adds friction for common operations and creates two completely separate code paths for wave assignment (feed long-press vs expanded view button). Replacing the long-press behavior with a quick-actions modal that reuses the expanded view's action buttons eliminates code duplication and gives users immediate access to all actions without leaving the feed.

## What Changes

- Extract action button rendering from `Photo/index.js` into a reusable `PhotoActionButtons` component
- Extract action handler logic from `Photo/index.js` into a reusable `usePhotoActions` custom hook
- Create a `QuickActionsModal` component that shows a photo preview, a loading spinner while fetching photo details, and the extracted action buttons
- Replace the existing `handlePhotoLongPress` in `PhotosList/index.js` (ActionSheetIOS / Alert wave picker) with opening the `QuickActionsModal`
- Wire `Photo/index.js` to use the extracted `PhotoActionButtons` and `usePhotoActions` instead of inline code

## Capabilities

### New Capabilities
- `quick-actions-modal`: Modal overlay triggered by long-press on photo thumbnails in the feed, displaying a photo preview and all 5 action buttons with loading state

### Modified Capabilities
- `photo-wave-assignment`: The "Add Photo to Wave from Expanded View" requirement now uses extracted shared components instead of inline code; the long-press wave picker in the feed is replaced by the quick-actions modal

## Impact

- `src/components/Photo/index.js`: ~270 lines of action button JSX and handler code extracted into shared components; Photo component imports and uses them instead
- `src/screens/PhotosList/index.js`: `handlePhotoLongPress` replaced entirely; ActionSheetIOS import removed
- `src/components/PhotoActionButtons/index.js`: New component (extracted button rendering + styles)
- `src/hooks/usePhotoActions.js`: New hook (extracted handler logic)
- `src/components/QuickActionsModal/index.js`: New modal component
- No new dependencies; no API changes; no breaking changes
