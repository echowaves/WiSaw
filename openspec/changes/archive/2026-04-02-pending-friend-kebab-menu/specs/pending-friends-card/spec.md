## ADDED Requirements

### Requirement: Pending friend row has kebab menu button
Each pending friend row SHALL display a kebab menu button (`ellipsis-vertical` icon) at the bottom-right of the row. Tapping the kebab button SHALL trigger the same ActionMenu as long-pressing the row.

#### Scenario: Tapping kebab opens ActionMenu
- **WHEN** the user taps the kebab `⋮` button on a pending friend row
- **THEN** the ActionMenu SHALL open with "Share Link" and "Cancel Request" items

#### Scenario: Kebab button position
- **WHEN** a pending friend row renders
- **THEN** the kebab button SHALL appear at the bottom-right of the row
- **THEN** the Share button SHALL remain at the top-right inline with the friend name
