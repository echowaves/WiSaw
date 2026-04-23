## ADDED Requirements

### Requirement: Photo detail modal route
The system SHALL provide a full-screen modal route at `/photo-detail` registered in `app/_layout.tsx` as a `Stack.Screen` with `presentation: 'fullScreenModal'` and `headerShown: false`. The route SHALL render the existing `Photo` component in standalone mode (`embedded={false}`).

#### Scenario: User taps a photo thumbnail in any masonry grid
- **WHEN** the user taps a collapsed photo thumbnail in any masonry grid (PhotosList, BookmarksList, WaveDetail, FriendDetail)
- **THEN** the app SHALL set `photoDetailAtom` with the photo object and `removePhoto` callback
- **THEN** the app SHALL navigate to `/photo-detail` via `router.push`
- **THEN** a full-screen modal SHALL appear over the current screen

#### Scenario: Photo detail modal renders Photo component
- **WHEN** the `/photo-detail` route mounts
- **THEN** it SHALL read `photoDetailAtom` to obtain the photo and `removePhoto` function
- **THEN** it SHALL wrap the content in a `PhotosListContext.Provider` with the `removePhoto` value
- **THEN** it SHALL render `<Photo photo={photo} embedded={false} />`

#### Scenario: Photo detail modal preserves grid scroll
- **WHEN** the photo detail modal is displayed
- **THEN** the underlying masonry grid screen SHALL remain mounted
- **THEN** the grid scroll position SHALL be preserved

#### Scenario: User closes photo detail modal
- **WHEN** the user taps the close button in the photo detail modal
- **THEN** `router.back()` SHALL be called
- **THEN** the modal SHALL dismiss
- **THEN** the user SHALL return to the masonry grid at the preserved scroll position

#### Scenario: Photo deleted in modal removes from grid
- **WHEN** the user deletes or bans a photo from within the photo detail modal
- **THEN** the Photo component SHALL call `removePhoto(photoId)` from `PhotosListContext`
- **THEN** the `removePhoto` function (sourced from the originating screen's `useFeedLoader`) SHALL remove the photo from the grid's local photo list
- **THEN** when the modal dismisses, the masonry grid SHALL re-render without the deleted photo

#### Scenario: photoDetailAtom is null when modal opens
- **WHEN** the `/photo-detail` route mounts and `photoDetailAtom` is `null`
- **THEN** the modal SHALL call `router.back()` immediately to prevent rendering an empty screen

### Requirement: photoDetailAtom state management
The system SHALL provide a Jotai atom `photoDetailAtom` in `src/state.js` initialized to `null`. The atom SHALL hold an object with shape `{ photo, removePhoto }` when a photo detail modal is active, and `null` otherwise.

#### Scenario: Atom set before navigation
- **WHEN** a thumbnail is tapped in the masonry grid
- **THEN** the originating screen SHALL set `photoDetailAtom` to `{ photo: <photoObject>, removePhoto: <function> }` before calling `router.push('/photo-detail')`

#### Scenario: Atom cleared on modal dismiss
- **WHEN** the photo detail modal unmounts (via back navigation)
- **THEN** `photoDetailAtom` SHALL be set to `null` in a cleanup effect
