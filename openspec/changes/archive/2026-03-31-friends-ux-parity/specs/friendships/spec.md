## MODIFIED Requirements

### Requirement: Friend List Display
The system SHALL display a list of all friends organized by state (pending always first, then confirmed sorted by user-selected sort option) with their custom display names, a visible ⋮ menu button on each row, a LinearProgress loading bar during fetch, an InteractionHintBanner for interaction discovery, a KeyboardStickyView search bar at the bottom, and a FriendsExplainerView when the list is empty.

#### Scenario: User views friend list
- **WHEN** the user navigates to the friends screen
- **THEN** all pending friends SHALL appear at the top of the list
- **THEN** all confirmed friends SHALL appear below, sorted by the active sort option
- **THEN** each friend row SHALL display a ⋮ menu button on the right edge
- **THEN** a search bar SHALL appear at the bottom of the screen (if friends exist)
- **THEN** an InteractionHintBanner SHALL appear (if not previously dismissed)

#### Scenario: User views empty friend list
- **WHEN** the user navigates to the friends screen and has no friends
- **THEN** the system SHALL display FriendsExplainerView with educational content and an "Add a Friend" CTA
- **THEN** the search bar SHALL NOT be displayed

## REMOVED Requirements

### Requirement: Swipe-based friend actions
**Reason:** Replaced by ActionMenu-based context menu system (long-press + ⋮ button). Swipe gestures were not discoverable.
**Migration:** All swipe actions (share, edit, delete) are now available via ActionMenu triggered by long-press or ⋮ tap on any friend row.
