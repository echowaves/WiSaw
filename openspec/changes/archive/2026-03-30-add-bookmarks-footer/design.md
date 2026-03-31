## Context

The BookmarksList screen currently has `FOOTER_HEIGHT = 20` (just padding) and no navigation footer. The home feed (PhotosList) uses `PhotosListFooter` which provides a drawer menu button (absolutely positioned left) and centered video + camera buttons. BookmarksList lives inside the `(drawer)` route, so `useNavigation().openDrawer()` is available.

Camera capture requires `UploadContext` (for `enqueueCapture`) and the `useCameraCapture` hook (which internally reads `locationAtom` for geotagging). BookmarksList currently uses neither.

## Goals / Non-Goals

**Goals:**
- Reuse `PhotosListFooter` in BookmarksList with identical appearance and behavior
- Enable photo/video capture directly from the bookmarks screen
- Keep the existing `AppHeader` with back button

**Non-Goals:**
- Creating a new footer component — reuse the existing one
- Adding upload progress or pending photos UI to bookmarks
- Modifying `PhotosListFooter` itself

## Decisions

### 1. Reuse PhotosListFooter directly

**Rationale**: The footer component is already self-contained and accepts all needed props. No need to create a bookmarks-specific variant.

**Alternative**: Extract a shared `ScreenFooter` wrapper. Rejected — premature abstraction for two consumers with identical needs.

### 2. Wire UploadContext + useCameraCapture in BookmarksList

**Rationale**: `useCameraCapture` needs `enqueueCapture` from `UploadContext` and reads `locationAtom` internally. BookmarksList must consume `UploadContext` and call the hook to provide `isCameraOpening` and `onCameraPress` props to the footer.

### 3. Read locationAtom for locationReady prop

**Rationale**: The footer visually disables camera buttons when `locationReady` is false. Reading `locationAtom.status === 'ready'` provides the same behavior as PhotosList. Since `locationAtom` is a global Jotai atom populated at app startup, it will already be resolved by the time the user navigates to bookmarks.

## Risks / Trade-offs

- [UploadContext availability] → BookmarksList is rendered inside the drawer layout which already wraps `UploadContext` at the app level. No additional provider needed.
- [Camera photos not appearing in bookmarks] → Photos captured from bookmarks go through the normal upload flow and appear in the home feed, not automatically bookmarked. This matches expected behavior — the camera is a convenience shortcut, not a "bookmark this photo" action.
