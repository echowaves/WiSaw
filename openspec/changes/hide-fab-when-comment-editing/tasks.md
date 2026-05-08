## 1. Update SearchFab Component

- [x] 1.1 Add `isCommentEditing` prop with default value `false`
- [x] 1.2 Apply opacity animation and pointerEvents based on `isCommentEditing`
- [x] 1.3 Ensure fade animation uses spring easing for smooth transition

## 2. Update Photo Component

- [x] 2.1 Add `onCommentInputToggle` prop to Photo component props
- [x] 2.2 Add useEffect to call `onCommentInputToggle(true)` when `showCommentInput` becomes true
- [x] 2.3 Add useEffect to call `onCommentInputToggle(false)` when `showCommentInput` becomes false

## 3. Update PhotosList Screen

- [x] 3.1 Add `isCommentEditing` state (useState boolean, default false)
- [x] 3.2 Create `handleCommentInputToggle` callback function
- [x] 3.3 Pass `isCommentEditing` and `onCommentInputToggle` to SearchFab
- [x] 3.4 Pass `onCommentInputToggle` to Photo components via PhotosListMasonry

## 4. Update BookmarksList Screen

- [x] 4.1 Add `isCommentEditing` state (useState boolean, default false)
- [x] 4.2 Create `handleCommentInputToggle` callback function
- [x] 4.3 Pass `isCommentEditing` and `onCommentInputToggle` to SearchFab
- [x] 4.4 Pass `onCommentInputToggle` to Photo components
