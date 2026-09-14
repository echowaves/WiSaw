# Delta: expanded-photo-card

## ADDED Requirements

### Requirement: Expanded Photo Card — Watchers Count Stat
The expanded photo card's stats row SHALL display the number of times the photo has been bookmarked (watched) as a count next to a gold bookmark icon. The displayed value SHALL be the `watchersCount` from photo details when that field is present, otherwise the photo's feed-snapshot `watchersCount`. When the resolved count is zero, the watchers stat SHALL NOT be displayed (matching the existing conditional that hides stats when both comment and watcher counts are zero).

#### Scenario: Watchers count shown when present
- **WHEN** a photo is expanded and the resolved watchers count is greater than zero
- **THEN** the stats row SHALL display a gold bookmark icon followed by that count

#### Scenario: Watchers stat hidden when zero
- **WHEN** a photo is expanded and both the comment count and the resolved watchers count are zero
- **THEN** the stats row SHALL NOT be rendered (existing behavior preserved)

#### Scenario: Live value preferred once backend returns it
- **WHEN** photo details include a `watchersCount` value
- **THEN** the stats row SHALL display the details `watchersCount` (live value) rather than the feed snapshot

#### Scenario: Feed snapshot fallback before backend support
- **WHEN** photo details do not include a `watchersCount` value and the photo's feed snapshot `watchersCount` is greater than zero
- **THEN** the stats row SHALL display the feed-snapshot count
