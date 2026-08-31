## ADDED Requirements

### Requirement: Quick Actions Modal — Stable Action Button Geometry
The quick-actions modal's action buttons (Report, Delete, Bookmark, Wave, Share) SHALL keep identical geometry (width, height, padding, margin, border radius) regardless of their enabled or disabled state. A change in button state (e.g., toggling the bookmark, which disables Report and Delete) SHALL change only the buttons' visual appearance (background, border, opacity, icon color) and interactivity — never their size or position within the row.

#### Scenario: Bookmarking does not shift other buttons
- **WHEN** the user bookmarks a photo in the quick-actions modal
- **AND** the Report and Delete buttons become disabled as a result
- **THEN** the Report and Delete buttons SHALL retain the same width, height, and position they had while enabled
- **THEN** no visible reflow or shift of any action button SHALL occur

#### Scenario: Unbookmarking does not shift other buttons
- **WHEN** the user removes a bookmark from a photo in the quick-actions modal
- **AND** the Report and Delete buttons become enabled as a result
- **THEN** the Report and Delete buttons SHALL retain the same width, height, and position they had while disabled
- **THEN** no visible reflow or shift of any action button SHALL occur

#### Scenario: Disabled button appearance
- **WHEN** an action button is in its disabled state
- **THEN** the button SHALL be rendered de-emphasized (muted background, border, icon color, reduced opacity)
- **THEN** the button SHALL NOT be shrinkable below the same geometry as its enabled state

### Requirement: Quick Actions Modal — Wave Button Layout
The Wave button in the quick-actions modal SHALL be the last element of the action button list and SHALL always render on its own line, below the row of icon-only buttons (Report, Delete, Bookmark, Share). The Wave button SHALL have a fixed width regardless of the wave name; a wave label that does not fit SHALL be truncated with an ellipsis. The button's width SHALL NOT change when photo details load and the label switches from "Add to Wave" to the actual wave name.

#### Scenario: Wave button on separate line
- **WHEN** the quick-actions modal displays action buttons after photo details load
- **THEN** Report, Delete, Bookmark, and Share SHALL appear on one line
- **THEN** the Wave button SHALL appear on the line below, as the last element

#### Scenario: Wave label truncation
- **WHEN** the wave name is longer than the fixed Wave button width allows
- **THEN** the label SHALL be truncated with an ellipsis
- **THEN** the Wave button SHALL keep its fixed width

#### Scenario: Label swap on details load
- **WHEN** the Wave button label changes from "Add to Wave" to the wave name as photo details load
- **THEN** the Wave button SHALL keep its fixed width and position
- **THEN** no reflow or shift of any action button SHALL occur
