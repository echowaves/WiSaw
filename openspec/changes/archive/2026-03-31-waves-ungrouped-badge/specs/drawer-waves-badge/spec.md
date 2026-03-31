## ADDED Requirements

### Requirement: Waves drawer item shows ungrouped photo count badge
The Waves drawer item SHALL display a numeric badge showing the ungrouped photos count when the count is greater than zero.

#### Scenario: Ungrouped photos exist
- **WHEN** the ungrouped photos count atom has a value greater than 0
- **THEN** the Waves drawer icon SHALL display a red numeric badge with the count

#### Scenario: No ungrouped photos
- **WHEN** the ungrouped photos count atom is 0 or null
- **THEN** the Waves drawer icon SHALL NOT display a badge

#### Scenario: Count not yet loaded
- **WHEN** the ungrouped photos count atom is null (not yet fetched)
- **THEN** the Waves drawer icon SHALL NOT display a badge

### Requirement: Badge count capped at 99+
The badge SHALL display "99+" when the ungrouped photos count exceeds 99.

#### Scenario: Count is 99 or less
- **WHEN** the ungrouped photos count is between 1 and 99
- **THEN** the badge SHALL display the exact numeric count

#### Scenario: Count exceeds 99
- **WHEN** the ungrouped photos count is 100 or greater
- **THEN** the badge SHALL display "99+"

### Requirement: Badge visual styling
The badge SHALL use red background with white text, positioned at the top-right corner of the icon.

#### Scenario: Badge appearance
- **WHEN** the badge is visible
- **THEN** it SHALL have a `#FF3B30` background color, white bold text, and rounded corners
- **THEN** it SHALL be positioned absolutely at the top-right of the icon container
