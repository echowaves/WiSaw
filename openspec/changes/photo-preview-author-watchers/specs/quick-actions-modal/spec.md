# Delta: quick-actions-modal

## ADDED Requirements

### Requirement: Quick Actions Modal — Photo Author Identity
The quick-actions modal SHALL display the identity of the photo's author in a compact info row associated with the preview, using the same resolution semantics as the expanded photo card's author name: `me` when the photo belongs to the current user, the friend's contact name when the photo belongs to a known friend, and `anonym` when the photo's author is unknown to the current user. The author label SHALL render regardless of whether photo details have loaded, using only the photo's owner identity and the local friends list.

#### Scenario: Own photo shows "me"
- **WHEN** the user opens the quick-actions modal on a photo they own
- **THEN** the author identity row SHALL display `me`

#### Scenario: Friend's photo shows contact name
- **WHEN** the user opens the quick-actions modal on a photo owned by a known friend
- **THEN** the author identity row SHALL display that friend's contact name

#### Scenario: Unknown author shows "anonym"
- **WHEN** the user opens the quick-actions modal on a photo owned by someone not in the local friends list
- **THEN** the author identity row SHALL display `anonym`

#### Scenario: Author shown before details load
- **WHEN** the quick-actions modal is open and photo details have not yet loaded
- **THEN** the author identity row SHALL still be displayed (it does not depend on the details fetch)

### Requirement: Quick Actions Modal — Watchers Count
The quick-actions modal SHALL display the number of times the photo has been bookmarked (watched) as a count next to a gold bookmark icon. The displayed value SHALL be the `watchersCount` from photo details when present (live value, kept current by the bookmark toggle), otherwise the photo's feed-snapshot `watchersCount`. The count SHALL render regardless of whether photo details have loaded. When the count is zero the watchers indicator SHALL NOT be displayed.

#### Scenario: Watchers count shown when present
- **WHEN** the user opens the quick-actions modal on a photo whose resolved watchers count is greater than zero
- **THEN** the modal SHALL display a gold bookmark icon followed by that count

#### Scenario: Watchers indicator hidden when zero
- **WHEN** the user opens the quick-actions modal on a photo whose resolved watchers count is zero or absent
- **THEN** the modal SHALL NOT display a watchers indicator

#### Scenario: Watchers count shown before details load
- **WHEN** the quick-actions modal is open and photo details have not yet loaded
- **THEN** the watchers count (when non-zero) SHALL still be displayed from the feed snapshot

#### Scenario: Bookmarking updates the displayed count
- **WHEN** the user taps the Bookmark action in the quick-actions modal
- **THEN** the modal SHALL stay open and the displayed watchers count SHALL update to the new value returned by the bookmark mutation
- **AND** the updated count SHALL persist while the modal remains open (it is not reset to the stale feed snapshot)

#### Scenario: Removing bookmark updates the displayed count
- **WHEN** the user taps the filled Bookmark action to remove the bookmark
- **THEN** the displayed watchers count SHALL update to the new value returned by the unbookmark mutation
