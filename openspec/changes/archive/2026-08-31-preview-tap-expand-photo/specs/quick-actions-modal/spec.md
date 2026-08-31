## ADDED Requirements

### Requirement: Preview image tap closes overlay and expands photo in feed
The quick-actions modal SHALL treat a tap on the photo preview image area as a "select this photo" gesture: it closes the overlay and expands the tapped photo inline in the host feed via the screen's existing `toggleExpand` expansion mechanism, with the masonry's existing auto-scroll behavior bringing the expanded item into view. The tap target SHALL be limited to the photo preview image container (the progressive two-layer `CachedImage` area). The dimmed backdrop and the action buttons SHALL retain their existing behavior — a backdrop tap closes the overlay WITHOUT expanding, and action buttons perform their existing actions.

#### Scenario: Tap preview image to expand in main feed
- **WHEN** the user long-presses a photo thumbnail in the main feed and the quick-actions modal opens
- **THEN** the user taps the photo preview image inside the modal
- **THEN** haptic feedback is triggered
- **THEN** the modal closes
- **THEN** the tapped photo expands inline in the masonry feed (full-width `<Photo embedded>` card) at the current waterline position
- **THEN** the masonry auto-scrolls so the expanded item is near the top of the viewport with the existing 8px offset

#### Scenario: Tap preview image in wave detail feed
- **WHEN** the quick-actions modal is opened from a photo thumbnail in a wave detail screen and the user taps the preview image
- **THEN** the modal closes and the tapped photo expands inline in the wave detail masonry feed

#### Scenario: Tap preview image in friend feed
- **WHEN** the quick-actions modal is opened from a photo thumbnail in a friend detail screen and the user taps the preview image
- **THEN** the modal closes and the tapped photo expands inline in the friend detail masonry feed

#### Scenario: Tap target is limited to the preview image
- **WHEN** the user taps the dimmed backdrop outside the modal content
- **THEN** the modal closes WITHOUT expanding any photo
- **WHEN** the user taps an action button (Report, Delete, Bookmark, Wave, Share)
- **THEN** the button's existing action is performed and the preview image tap behavior does NOT fire

#### Scenario: Expand replaces a different expanded photo
- **WHEN** a different photo is already expanded in the host feed when the user taps the preview image
- **THEN** the previously expanded photo collapses and the tapped photo expands, consistent with the existing single-expansion invariant

#### Scenario: Stale photo id does not expand
- **WHEN** the tapped photo is no longer present in the host feed's photo list (e.g., the feed reloaded or the photo was deleted elsewhere before the tap)
- **THEN** the modal still closes
- **THEN** no expansion is attempted (the feed is left unchanged)

#### Scenario: Expansion timing is immediate
- **WHEN** the user taps the preview image
- **THEN** the close and the expand are triggered in the same event handler (the masonry expansion animates while the modal fade-out completes)
- **THEN** no deferred/pending-expansion state keyed to modal `onDismiss` is used

#### Scenario: Video post preview behaves identically
- **WHEN** the quick-actions modal is showing a video post's preview (poster frame) and the user taps the preview image
- **THEN** the modal closes and the video post expands inline in the feed like any photo
