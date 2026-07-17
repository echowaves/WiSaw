## Modified Requirements

### Requirement: Photo viewing interaction
The photo feed SHALL display photos in a column masonry grid with responsive column counts based on screen width. The PhotosList screen SHALL pass a comment-screen column profile (`{ 402: 2, 440: 3, 834: 5, 1024: 7, default: 9 }`) to `PhotosListMasonry` via the `columns` prop, regardless of the active feed mode (geo or bookmarks). The feed SHALL use `BOOKMARK_LAYOUT_CONFIG` for layout parameters (spacing, tile height, aspect ratios). Comment sections SHALL always be shown on thumbnails when applicable (when photos have comments, watchers, or last comment), regardless of the active feed mode. When a user taps a thumbnail, the photo SHALL expand inline to full grid width showing the complete Photo detail view inside a unified card, instead of navigating to a modal route. The expanded view SHALL render the photo first, followed by action buttons, then photo info, comments, and AI recognitions.

#### Scenario: Tap photo in feed
- **WHEN** user taps a photo thumbnail in the main feed
- **THEN** the photo expands inline in the masonry grid inside a rounded card showing full detail (image, then actions, then comments)

#### Scenario: Collapse expanded photo
- **WHEN** user taps the collapse control on an expanded photo
- **THEN** the photo collapses back to thumbnail size and the grid resumes normal column flow

#### Scenario: Feed scroll position preserved
- **WHEN** a photo is expanded and then collapsed
- **THEN** the feed scroll position remains near the collapsed thumbnail's position

#### Scenario: Feed uses comment-screen columns
- **WHEN** the PhotosList screen renders `PhotosListMasonry`
- **THEN** it SHALL pass `columns={{ 402: 2, 440: 3, 834: 5, 1024: 7, default: 9 }}` to the masonry component

#### Scenario: Feed uses bookmark layout config
- **WHEN** the PhotosList screen renders `PhotosListMasonry`
- **THEN** it SHALL pass `BOOKMARK_LAYOUT_CONFIG` as the `segmentConfig` prop (spacing: 8, baseHeight: 200, aspectRatioFallbacks: [1.0])

#### Scenario: Comments always shown on thumbnails
- **WHEN** a photo in the feed has comments, watchers, or a last comment
- **THEN** the comment section SHALL be rendered below the thumbnail regardless of the active feed mode (geo or bookmarks)
- **THEN** `activeSegment` SHALL always be `1` for masonry rendering purposes to enable comment sections
