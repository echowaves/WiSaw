## Purpose
Defines the visual card wrapper and layout structure for photos expanded inline within the masonry grid feed.

## Requirements

### Requirement: Unified card wrapper for expanded photo
When a photo is expanded inline in the masonry grid (`embedded === true`), the entire expanded view SHALL be wrapped in a single card container with `borderRadius: 20`, `overflow: 'hidden'`, and themed background. The card's shadow, border, and margins SHALL match the collapsed `ExpandableThumb` exactly: `shadowColor: '#000'`, `shadowOffset: { width: 0, height: 4 }`, `shadowOpacity: 0.4`, `shadowRadius: 6`, `elevation: 8`, `borderWidth: 0`, `borderColor: 'transparent'`, and zero explicit margins. The outer measurement container SHALL NOT obscure the card's rounded appearance.

#### Scenario: Expanded photo appears as floating rounded card
- **WHEN** a photo thumbnail is tapped to expand in the masonry feed
- **THEN** the expanded view SHALL appear as a floating rounded card with no visible rectangular background behind it

#### Scenario: Card shadow matches collapsed thumb
- **WHEN** the expanded card renders inside the masonry grid
- **THEN** the card's shadow SHALL use `shadowColor: '#000'`, `shadowOpacity: 0.4`, `shadowRadius: 6`, `shadowOffset: { width: 0, height: 4 }`, `elevation: 8` — identical to the collapsed `ExpandableThumb`

#### Scenario: Card has no stroke border
- **WHEN** the expanded card renders
- **THEN** `borderWidth` SHALL be `0` and `borderColor` SHALL be `'transparent'` — matching the collapsed thumb

#### Scenario: Card uses no explicit margins
- **WHEN** the expanded card renders inside the masonry grid
- **THEN** `marginVertical` and `marginHorizontal` SHALL be `0` — the masonry `spacing` prop handles inter-item gaps

#### Scenario: Outer container is transparent in embedded mode
- **WHEN** the Photo component renders with `embedded === true`
- **THEN** the outer container `View` SHALL have `backgroundColor: 'transparent'` and SHALL NOT have `overflow: 'hidden'`

### Requirement: Section render order in expanded card
Within the expanded card, content sections SHALL render in this order: photo/video, action buttons, photo info (author/date/stats), comments, add comment button, AI recognitions.

#### Scenario: Action buttons appear below photo
- **WHEN** a photo is expanded in the masonry feed
- **THEN** the action buttons (ban, delete, bookmark, wave, share) SHALL appear immediately below the photo image and above the photo info section

#### Scenario: Comments appear below photo info
- **WHEN** a photo is expanded in the masonry feed
- **THEN** comments SHALL appear below the photo info section (author, date, stats)

### Requirement: Flattened inner sections
When rendered inside the outer card wrapper, inner content sections (photo info, comments, action card, AI recognition cards) SHALL NOT render their own card-level styling (independent margins, border radius, border, shadow). They SHALL render as flat content rows within the unified card.

#### Scenario: Inner sections have no independent card chrome
- **WHEN** the Photo component renders with `embedded === true` inside the outer card
- **THEN** the photo info section, comments section, action card, and AI recognition cards SHALL NOT have `marginHorizontal`, `borderRadius`, `borderWidth`, or `shadowColor` styling of their own

#### Scenario: Inner sections use spacing or dividers
- **WHEN** inner sections render inside the outer card
- **THEN** sections SHALL be visually separated by vertical spacing or subtle border dividers rather than independent card containers

### Requirement: Expanded Photo Card — Stable Action Button Geometry
The expanded photo card's action buttons (Report, Delete, Bookmark, Wave, Share) SHALL keep identical geometry (width, height, padding, margin, border radius) regardless of their enabled or disabled state. Any button status update (e.g., bookmarking, which disables Report, Delete, and Share) SHALL change only the buttons' visual appearance (background, border, opacity, icon color) and interactivity — never their size or position within the row.

#### Scenario: Bookmarking does not shift other buttons
- **WHEN** the user bookmarks a photo in the expanded photo view
- **AND** the Report, Delete, and Share buttons become disabled or were already disabled as a result
- **THEN** all action buttons SHALL retain the same width, height, and position they had before the state change
- **THEN** no visible reflow or shift of any action button SHALL occur

#### Scenario: Unbookmarking does not shift other buttons
- **WHEN** the user removes a bookmark from a photo in the expanded photo view
- **AND** the disabled action buttons become enabled as a result
- **THEN** all action buttons SHALL retain the same width, height, and position they had before the state change
- **THEN** no visible reflow or shift of any action button SHALL occur

#### Scenario: Disabled button appearance
- **WHEN** an action button is in its disabled state
- **THEN** the button SHALL be rendered de-emphasized (muted background, border, icon color, reduced opacity)
- **THEN** the button SHALL NOT be shrinkable below the same geometry as its enabled state

### Requirement: Expanded Photo Card — Wave Button Layout
The Wave button in the expanded photo card SHALL be the last element of the action button list and SHALL always render on its own line, below the row of icon-only buttons (Report, Delete, Bookmark, Share). The Wave button SHALL have a fixed width regardless of the wave name; a wave label that does not fit SHALL be truncated with an ellipsis. The button's width SHALL NOT change when photo details load and the label switches from "Add to Wave" to the actual wave name.

#### Scenario: Wave button on separate line
- **WHEN** the expanded photo card displays action buttons
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

### Requirement: Expanded Photo Card — Wave Guard Toast
Pressing the Wave button on a photo that does not belong to the current user SHALL display an info toast "Only your own photos can be added to waves" and SHALL NOT open the wave selector or crash the app. All toast feedback in the shared photo actions hook (wave guard, frozen-wave guards, wave report success, add/remove-from-wave success) SHALL render without runtime errors.

#### Scenario: Wave pressed on non-own photo
- **WHEN** the user taps the Wave button on a photo not owned by them in the expanded photo view
- **THEN** an info toast "Only your own photos can be added to waves" is displayed
- **THEN** the wave selector does NOT open
- **THEN** the app does NOT crash

#### Scenario: Wave pressed on own photo
- **WHEN** the user taps the Wave button on their own photo in the expanded photo view
- **THEN** the wave selector opens

#### Scenario: Wave success toasts render
- **WHEN** a photo is successfully added to or removed from a wave
- **THEN** the corresponding success toast ("Added to: {wave name}" / "Removed from wave") is displayed without runtime errors
