## MODIFIED Requirements

### Requirement: Masonry component tracks scroll direction for FOB
The `PhotosListMasonry` component SHALL use `ExpoMasonryLayout` with `layoutMode='column'` and `columns={2}` for all segments. It SHALL internally track scroll direction by comparing consecutive `contentOffset.y` values. It SHALL maintain a `prevScrollY` ref and a `showFob` state. The existing `onScroll` callback from the parent SHALL continue to be forwarded without modification. The component SHALL NOT use `getItemDimensions` — column mode computes dimensions from item aspect ratios natively. The component SHALL NOT pass expansion-related props (`isPhotoExpanded`, `expandedPhotoIds`, `onToggleExpand`, `updatePhotoHeight`, `onRequestEnsureVisible`, `justCollapsedId`) to `ExpandableThumb`.

#### Scenario: Scroll event drives FOB visibility
- **WHEN** a scroll event fires in `PhotosListMasonry`
- **THEN** the component SHALL first evaluate FOB visibility based on current offset and scroll direction
- **THEN** the component SHALL forward the event to the parent's `onScroll` callback unchanged

#### Scenario: Masonry wraps content for FOB overlay
- **WHEN** `PhotosListMasonry` renders
- **THEN** it SHALL wrap `ExpoMasonryLayout` in a `<View style={{ flex: 1 }}>` container
- **THEN** the `ScrollToTopFob` SHALL render as an absolutely-positioned sibling within that container
- **THEN** the existing masonry layout behavior SHALL be unaffected

#### Scenario: Masonry uses column layout mode
- **WHEN** `PhotosListMasonry` renders
- **THEN** `ExpoMasonryLayout` SHALL receive `layoutMode='column'` and `columns={2}`
- **THEN** `ExpoMasonryLayout` SHALL NOT receive a `getItemDimensions` prop
- **THEN** each photo SHALL be rendered at its natural aspect ratio within a fixed column width

#### Scenario: Thumbnail tap navigates to photo detail modal
- **WHEN** the user taps a photo thumbnail in the masonry grid
- **THEN** `PhotosListMasonry` SHALL set `photoDetailAtom` and call `router.push('/photo-detail')`
- **THEN** no inline expansion SHALL occur

### Requirement: Masonry manages FOB inactivity timer
The `PhotosListMasonry` component SHALL manage a 3-second inactivity timer via a ref. Each qualifying scroll event (downward, past 200px) SHALL clear and restart the timer. When the timer fires, `showFob` SHALL be set to false. The timer SHALL be cleared on component unmount.

#### Scenario: Timer cleanup on unmount
- **WHEN** the `PhotosListMasonry` component unmounts
- **THEN** the inactivity timer SHALL be cleared to prevent state updates on an unmounted component
