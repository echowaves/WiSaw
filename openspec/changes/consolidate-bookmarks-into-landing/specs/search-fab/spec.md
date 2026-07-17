## Modified Requirements

### Requirement: Search FAB renders on photo feed
The system SHALL render a floating action button (FAB) with a magnifying glass icon in the bottom-right corner of the PhotosList screen, positioned above the footer. The FAB SHALL be visible on both the Global and Bookmarks modes when search is not active.

#### Scenario: FAB visible on Global segment
- **WHEN** the user is viewing the Global segment (segment 0)
- **THEN** a magnifying glass FAB SHALL be visible in the bottom-right corner
- **THEN** the FAB SHALL be positioned `FOOTER_HEIGHT + 16` pixels from the bottom of the screen and 16 pixels from the right edge
- **THEN** the FAB SHALL have a `zIndex` of 10, floating above the masonry content

#### Scenario: FAB visible on Bookmarks mode
- **WHEN** the user is viewing the Bookmarks mode (segment 1)
- **THEN** the same FAB SHALL be visible with identical positioning

#### Scenario: FAB hidden when no content context
- **WHEN** the network is unavailable or terms and conditions are not accepted
- **THEN** the FAB SHALL NOT be rendered
