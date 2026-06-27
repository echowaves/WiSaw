## ADDED Requirements

### Requirement: Photo tap navigation is debounced
The `ImageView` component SHALL debounce tap-to-zoom navigation, preventing rapid successive taps from triggering multiple zoom view navigations. A single tap that occurs more than 500ms after the previous navigation SHALL open the zoom view. A tap that occurs within 500ms of a previous navigation SHALL be ignored.

#### Scenario: Single tap opens zoom view
- **WHEN** a user taps a photo thumbnail
- **THEN** the zoomed photo view opens via navigation to `/pinch`

#### Scenario: Double tap ignores second tap
- **WHEN** a user double-taps a photo thumbnail (second tap within 500ms of the first)
- **THEN** the zoomed photo view opens once (from the first tap) and the second tap does not trigger a second navigation

#### Scenario: Subsequent single tap after debounce window
- **WHEN** a user taps a photo thumbnail, then taps again after 500ms has elapsed
- **THEN** the second tap opens the zoomed photo view independently