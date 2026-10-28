## Purpose
This specification defines expected user-visible behavior, constraints, and validation scenarios for wave frozen enforcement in WiSaw.

## Requirements

### Requirement: Block photo removal from frozen wave
The app SHALL prevent users from removing photos from a frozen wave, except for the wave owner.

#### Scenario: Contributor attempts remove from frozen wave
- **WHEN** a contributor attempts to remove a photo from a frozen wave
- **THEN** the "Remove from Wave" action SHALL be hidden or disabled
- **THEN** if somehow triggered, a toast SHALL explain "This wave is frozen and cannot be modified"

#### Scenario: Facilitator attempts remove from frozen wave
- **WHEN** a facilitator attempts to remove a photo from a frozen wave
- **THEN** the "Remove from Wave" action SHALL be hidden or disabled

#### Scenario: Owner removes from frozen wave
- **WHEN** the wave owner removes a photo from a frozen wave
- **THEN** the action SHALL proceed (owner privilege)

### Requirement: Block photo deletion for frozen wave photos
The app SHALL prevent deletion of photos that belong to a frozen wave from any screen (wave detail, global feed, watched feed), except by the wave owner.

#### Scenario: User attempts to delete photo in frozen wave
- **WHEN** any user attempts to delete a photo that belongs to a frozen wave
- **THEN** the delete action SHALL be hidden or disabled
- **THEN** if somehow triggered, a toast SHALL explain "Cannot delete a photo that is in a frozen wave"

#### Scenario: Owner deletes photo from frozen wave
- **WHEN** the wave owner deletes a photo in a frozen wave
- **THEN** the action SHALL proceed (owner privilege)

### Requirement: Block comments on frozen wave photos
The app SHALL prevent adding or deleting comments on photos that belong to a frozen wave, for all users including the wave owner.

#### Scenario: User attempts to comment on frozen wave photo
- **WHEN** any user attempts to add a comment to a photo that belongs to a frozen wave
- **THEN** the comment input SHALL be disabled or hidden
- **THEN** a notice SHALL explain that comments are locked because the photo belongs to a frozen wave

#### Scenario: User attempts to delete comment on frozen wave photo
- **WHEN** any user attempts to delete a comment on a photo that belongs to a frozen wave
- **THEN** the delete comment action SHALL be hidden or disabled
- **THEN** if somehow triggered, a toast SHALL explain that comments on frozen wave photos cannot be modified

#### Scenario: Frozen applies from global feed too
- **WHEN** a user views a photo in the global feed that also belongs to a frozen wave
- **THEN** the comment restrictions SHALL still apply
- **THEN** the photo detail SHALL indicate that this photo belongs to a frozen wave

### Requirement: Block wave modifications when frozen
The app SHALL prevent modifications to wave settings when the wave is frozen, except for freeze toggle and end date changes by the owner.

#### Scenario: Owner attempts non-freeze edits on frozen wave
- **WHEN** the wave owner attempts to change name, description, open/closed, start date, or geo boundaries on a frozen wave
- **THEN** those fields SHALL be disabled with an explanation that the wave is frozen

#### Scenario: Owner changes freeze status on frozen wave
- **WHEN** the wave owner toggles the freeze switch or changes the end date on a frozen wave
- **THEN** the action SHALL proceed normally

### Requirement: Frozen state context from wave data
The app SHALL use the `isFrozen` and `waveUuid` fields from the photo details response to determine frozen-state restrictions across all screens.

#### Scenario: Photo has wave context in details
- **WHEN** `getPhotoDetails` returns `waveUuid` and `waveName` for a photo
- **THEN** the app SHALL check if the wave is frozen (via cached wave data or the wave's `isFrozen` field)
- **THEN** the frozen restrictions SHALL be applied to all photo actions on that screen
