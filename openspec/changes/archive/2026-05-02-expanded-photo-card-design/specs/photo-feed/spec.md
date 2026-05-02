## MODIFIED Requirements

### Requirement: Photo viewing interaction
The photo feed SHALL display photos in a column masonry grid with responsive column counts based on screen width. The PhotosList screen SHALL pass a feed column profile (`{ 402: 3, 440: 4, 834: 7, 1024: 9, default: 12 }`) to `PhotosListMasonry` via the `columns` prop. When a user taps a thumbnail, the photo SHALL expand inline to full grid width showing the complete Photo detail view inside a unified card, instead of navigating to a modal route. The expanded view SHALL render the photo first, followed by action buttons, then photo info, comments, and AI recognitions.

#### Scenario: Tap photo in feed
- **WHEN** user taps a photo thumbnail in the main feed
- **THEN** the photo expands inline in the masonry grid inside a rounded card showing full detail (image, then actions, then comments)

#### Scenario: Collapse expanded photo
- **WHEN** user taps the collapse control on an expanded photo
- **THEN** the photo collapses back to thumbnail size and the grid resumes normal column flow

#### Scenario: Feed scroll position preserved
- **WHEN** a photo is expanded and then collapsed
- **THEN** the feed scroll position remains near the collapsed thumbnail's position

#### Scenario: Feed uses responsive columns
- **WHEN** the PhotosList screen renders `PhotosListMasonry`
- **THEN** it SHALL pass `columns={{ 402: 3, 440: 4, 834: 7, 1024: 9, default: 12 }}` to the masonry component
