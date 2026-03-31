## MODIFIED Requirements

### Requirement: Kebab menu badge count capped at 99+
The kebab menu ungrouped count badge on the Waves screen SHALL display "99+" when the count exceeds 99, instead of the raw number.

#### Scenario: Count is 99 or less
- **WHEN** the ungrouped photos count is between 1 and 99
- **THEN** the kebab menu badge SHALL display the exact numeric count

#### Scenario: Count exceeds 99
- **WHEN** the ungrouped photos count is 100 or greater
- **THEN** the kebab menu badge SHALL display "99+"
