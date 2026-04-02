## ADDED Requirements

### Requirement: createFriendship mutation matches backend schema
The client `createFriendship` GraphQL mutation SHALL query `Friendship` fields (`friendshipUuid`, `uuid1`, `uuid2`, `createdAt`) directly on the mutation return type, without a nested `friendship` wrapper.

#### Scenario: Successful friendship creation
- **WHEN** a user creates a new friendship via `createFriendship` mutation
- **THEN** the client receives a `Friendship` object with `friendshipUuid`, `uuid1`, `uuid2`, and `createdAt` fields directly from `data.createFriendship`

#### Scenario: Friendship UUID is accessible after creation
- **WHEN** the `createFriendship` mutation succeeds
- **THEN** the returned `friendshipUuid` SHALL be used to save the contact name and reload the friends list
