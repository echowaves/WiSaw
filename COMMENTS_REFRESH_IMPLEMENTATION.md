# Comments Refresh Implementation

## Overview

This implementation ensures that when a user adds a comment to a photo and returns to the photo details screen, the comments are refreshed to show the newly added comment.

## How it works

### 1. Refresh Key System

- The photo detail screen (`app/(drawer)/(tabs)/photos/[id].tsx`) uses a `refreshKey` state that increments each time the screen comes into focus
- This is achieved using `useFocusEffect` from Expo Router

### 2. Data Flow

1. User views photo details with comments
2. User taps "Add Comment" → navigates to modal-input screen
3. User adds comment and submits → navigates back to photo details
4. Photo details screen comes into focus → `useFocusEffect` triggers
5. `refreshKey` is incremented
6. `refreshKey` is passed to `PhotosDetails` component
7. `PhotosDetails` passes `refreshKey` to each `Photo` component
8. `Photo` component's `useEffect` has `refreshKey` in dependencies
9. When `refreshKey` changes, the effect re-runs and fetches fresh photo details (including comments)

### 3. Key Components Modified

#### `app/(drawer)/(tabs)/photos/[id].tsx`

- Added `refreshKey` state with `useFocusEffect` to increment on focus
- Passes `refreshKey` to `PhotosDetails` via route params

#### `src/screens/PhotosDetails/index.js`

- Extracts `refreshKey` from route params
- Passes `refreshKey` to each `Photo` component

#### `src/components/Photo/index.js`

- Accepts `refreshKey` prop (defaults to 0 for backward compatibility)
- Added `refreshKey` to `useEffect` dependency array for photo details loading
- When `refreshKey` changes, photo details (including comments) are refetched

### 4. Navigation Flow

1. PhotosList → Photo Details (with comments)
2. Photo Details → Add Comment Modal
3. Add Comment Modal → Photo Details (comments refreshed automatically)

## Benefits

- Seamless user experience - new comments appear immediately
- Uses React's natural re-rendering mechanism
- Backward compatible - doesn't break existing usage
- Minimal performance impact - only refetches when actually returning from comment addition

## Testing

To test this functionality:

1. Navigate to a photo with existing comments
2. Tap "Add Comment"
3. Add a new comment and submit
4. Verify that the new comment appears in the comments list without manual refresh
