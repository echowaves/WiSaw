# Wave PhotoStrip Spec — Delta

## MODIFIED Requirements

### Requirement: Wave photo strip supports paginated loading
**MODIFIED:** When `onEndReached` fires during horizontal scrolling and photos are successfully fetched and appended, the strip SHALL auto-scroll to the end to maintain the user in the "load more" zone.

#### Scenario: Subsequent scroll triggers next page
**MODIFIED:** 
- **WHEN** the user scrolls the strip to the end after page 0 has loaded and `noMoreData` is false
- **THEN** `fetchFn` SHALL be called with the next incrementing `pageNumber` (1, 2, ...)
- **THEN** returned photos SHALL be deduplicated and appended
- **THEN** `scrollToEnd({ animated: false })` SHALL be called to reposition the user at the new end

### Requirement: Wave photo strip auto-scrolls after pagination loads
When photos are successfully fetched and appended during horizontal pagination, the strip SHALL auto-scroll to the end using `scrollToEnd({ animated: false })` to keep the user in the "load more" zone for seamless continuous scrolling. Auto-scroll SHALL be skipped when the strip starts with 0 initial photos (first load from empty state) to avoid visual jumping.

#### Scenario: Auto-scroll after loading additional photos
- **WHEN** the strip has existing photos and `onEndReached` triggers a successful fetch that appends new photos
- **THEN** `scrollToEnd({ animated: false })` SHALL be called immediately after photos are appended
- **THEN** the user's position SHALL be instantly repositioned at the new end of the strip
- **THEN** the user can continue scrolling right to trigger further page loads without manual repositioning

#### Scenario: No auto-scroll on first load from empty state
- **WHEN** the strip mounts with 0 initial photos and `fetchFn` is provided
- **THEN** the first `onEndReached` triggers a fetch of page 0
- **THEN** when page 0 photos are appended, `scrollToEnd` SHALL NOT be called
- **THEN** the user must manually scroll right to continue loading additional pages

#### Scenario: Auto-scroll does not interrupt photo interactions
- **WHEN** a page fetch completes and auto-scroll fires
- **THEN** `scrollToEnd` SHALL be called with `animated: false`
- **THEN** the instant reposition SHALL NOT interfere with ongoing tap or long-press gestures on existing thumbnails
