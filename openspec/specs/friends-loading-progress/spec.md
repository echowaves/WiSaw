# Friends Loading Progress Specification

## Purpose
Displays a linear progress bar during friends list loading and refresh operations to provide visual feedback.

## Requirements

### Requirement: Friends list loading progress bar
The FriendsList screen SHALL display a LinearProgress bar (indeterminate mode) at the top of the list during the initial data fetch and during pull-to-refresh operations.

#### Scenario: Initial friends load
- **WHEN** the FriendsList screen mounts and begins fetching friends data
- **THEN** a LinearProgress bar SHALL appear at the top of the list in indeterminate mode
- **THEN** the progress bar SHALL disappear when loading completes

#### Scenario: Pull-to-refresh loading
- **WHEN** the user triggers a pull-to-refresh on the friends list
- **THEN** a LinearProgress bar SHALL appear at the top of the list
- **THEN** the progress bar SHALL disappear when the refresh completes

#### Scenario: Subsequent visits
- **WHEN** the user navigates away from and back to the friends screen while friends are cached
- **THEN** the LinearProgress bar SHALL appear briefly during the refresh and disappear when complete
