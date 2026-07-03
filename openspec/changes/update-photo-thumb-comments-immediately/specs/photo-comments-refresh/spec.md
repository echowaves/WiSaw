## ADDED Requirements

### Requirement: Photo thumb updates immediately when comment is added
When a user adds a comment to a photo, the photo thumb in all feed views must immediately reflect the updated comment count, watcher count, and last comment text without requiring manual refresh.

#### Scenario: Comment added in main feed
- **WHEN** user adds a comment to a photo in the main feed
- **THEN** the photo thumb's comment count increases by 1
- **AND** the last comment text shows the new comment (truncated if needed)
- **AND** the watcher count updates if auto-watching on comment
- **AND** no manual refresh is required

#### Scenario: Comment added in Wave Detail
- **WHEN** user adds a comment to a photo in Wave Detail screen
- **THEN** the photo thumb updates immediately
- **AND** the change is visible to all users viewing the same feed

#### Scenario: Comment added in Friend Detail
- **WHEN** user adds a comment to a friend's photo
- **THEN** the photo thumb updates immediately

#### Scenario: Comment added in Bookmarks
- **WHEN** user adds a comment to a bookmarked photo
- **THEN** the photo thumb updates immediately

### Requirement: Photo thumb updates immediately when comment is deleted
When a user deletes a comment from a photo, the photo thumb in all feed views must immediately reflect the updated comment count.

#### Scenario: Comment deleted in main feed
- **WHEN** user deletes a comment from a photo in the main feed
- **THEN** the photo thumb's comment count decreases by 1
- **AND** if no comments remain, last comment text is removed
- **AND** no manual refresh is required

### Requirement: Watcher count updates on comment submission
When a user adds a comment, the photo is automatically watched and the watcher count updates immediately in all feed views.

#### Scenario: Auto-watch on comment
- **WHEN** user submits a new comment
- **THEN** watcher count increases by 1
- **AND** the photo thumb shows the updated watcher count immediately

### Requirement: Comment count shows zero when no comments
When all comments are deleted from a photo, the photo thumb must show a comment count of zero and remove last comment text.

#### Scenario: All comments removed
- **WHEN** user deletes the last comment from a photo
- **THEN** comment count shows 0
- **AND** last comment text is removed from the thumb
- **AND** comment section may be hidden if no watchers remain

## MODIFIED Requirements

None. This is a new capability without modifying existing requirements.