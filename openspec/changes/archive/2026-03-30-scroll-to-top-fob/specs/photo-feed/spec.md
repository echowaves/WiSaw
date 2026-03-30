## ADDED Requirements

### Requirement: Masonry component tracks scroll direction for FOB
The `PhotosListMasonry` component SHALL internally track scroll direction by comparing consecutive `contentOffset.y` values. It SHALL maintain a `prevScrollY` ref and a `showFob` state. The existing `onScroll` callback from the parent SHALL continue to be forwarded without modification.

#### Scenario: Scroll event drives FOB visibility
- **WHEN** a scroll event fires in `PhotosListMasonry`
- **THEN** the component SHALL first evaluate FOB visibility based on current offset and scroll direction
- **THEN** the component SHALL forward the event to the parent's `onScroll` callback unchanged

#### Scenario: Masonry wraps content for FOB overlay
- **WHEN** `PhotosListMasonry` renders
- **THEN** it SHALL wrap `ExpoMasonryLayout` in a `<View style={{ flex: 1 }}>` container
- **THEN** the `ScrollToTopFob` SHALL render as an absolutely-positioned sibling within that container
- **THEN** the existing masonry layout behavior SHALL be unaffected

### Requirement: Masonry manages FOB inactivity timer
The `PhotosListMasonry` component SHALL manage a 3-second inactivity timer via a ref. Each qualifying scroll event (downward, past 200px) SHALL clear and restart the timer. When the timer fires, `showFob` SHALL be set to false. The timer SHALL be cleared on component unmount.

#### Scenario: Timer cleanup on unmount
- **WHEN** the `PhotosListMasonry` component unmounts
- **THEN** the inactivity timer SHALL be cleared to prevent state updates on an unmounted component
