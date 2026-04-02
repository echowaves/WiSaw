## MODIFIED Requirements

### Requirement: Pending Friendship Management
The system SHALL support a dual-state friendship model with pending and confirmed states, allowing users to accept or reject pending requests.

#### Scenario: User receives a pending friendship
- **WHEN** another user initiates a friendship
- **THEN** the friendship appears in the pending state in the friend list

#### Scenario: User confirms a pending friendship
- **WHEN** the user accepts a pending friendship request via the confirmation screen
- **THEN** the friendship moves to confirmed state and both parties can see each other's shared photos

## REMOVED Requirements

### Requirement: Chat-related friendship data
**Reason**: Chat has been removed from the app. Friends now interact through shared photo feeds instead of messaging.
**Migration**: All `chatUuid` fields removed from friendship GraphQL queries. Unread count tracking (`getUnreadCountsList`, `resetUnreadCount`) removed. The `friendsUnreadCount` state atom removed.
