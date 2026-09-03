## ADDED Requirements

### Requirement: Join feedback after join mutation
The wave join confirmation screen SHALL surface user feedback after a join attempt completes, and SHALL NOT throw an unhandled error on the success path or the already-member path — the join mutation has already succeeded at that point, so the user must see feedback and be navigated regardless.

#### Scenario: Join succeeds
- **WHEN** the `joinOpenWave` or `joinWaveByInvite` mutation succeeds
- **THEN** the app SHALL display a success toast naming the joined wave
- **THEN** the app SHALL navigate to the wave detail screen
- **THEN** the success path SHALL complete without throwing

#### Scenario: User is already a member
- **WHEN** the join flow determines the user is already a member of the target wave
- **THEN** the app SHALL display an informational toast explaining the user is already a member
- **THEN** the app SHALL navigate directly to the wave detail screen
- **THEN** this path SHALL complete without throwing
