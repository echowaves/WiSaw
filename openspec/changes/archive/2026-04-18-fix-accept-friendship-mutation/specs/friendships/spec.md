## MODIFIED Requirements

### Requirement: Pending Friendship Management
The system SHALL support a dual-state friendship model with pending and confirmed states, allowing users to accept or reject pending requests. The `acceptFriendshipRequest` GraphQL mutation SHALL use a flat selection set matching the backend's `Friendship!` return type (no wrapper field), and the client SHALL read the response directly from `result.data.acceptFriendshipRequest`.

#### Scenario: User confirms a pending friendship
- **WHEN** the user accepts a pending friendship request via the confirmation screen
- **THEN** the client SHALL send an `acceptFriendshipRequest` mutation with a flat selection set (`createdAt`, `friendshipUuid`, `uuid1`, `uuid2`) matching the `Friendship` type
- **THEN** the client SHALL read the friendship object directly from `result.data.acceptFriendshipRequest`
- **THEN** the friendship moves to confirmed state and both parties can see each other's shared photos

#### Scenario: Backend rejects invalid mutation
- **WHEN** the client sends a mutation with fields not defined on the `Friendship` type
- **THEN** AppSync SHALL return a validation error before the resolver executes
