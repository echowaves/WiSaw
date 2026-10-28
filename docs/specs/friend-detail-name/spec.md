## Purpose
This specification defines expected user-visible behavior, constraints, and validation scenarios for friend detail name in WiSaw.

## Requirements

### Requirement: FriendDetail setContactName accepts NamePicker callback object
The `setContactName` function in `FriendDetail` SHALL accept an object `{ contactName }` matching the signature used by `NamePicker`, and use the `contactName` string value for local storage and state updates.

#### Scenario: Renaming a friend from FriendDetail screen
- **WHEN** the user saves a name via NamePicker on the FriendDetail screen
- **THEN** `setContactName` SHALL destructure `contactName` from the callback object
- **THEN** the friend name SHALL be saved locally and the screen SHALL update to reflect the new name
