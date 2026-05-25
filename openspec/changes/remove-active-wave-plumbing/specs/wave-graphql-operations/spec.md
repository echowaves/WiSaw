## MODIFIED Requirements

### Requirement: Update listWaves query to include new fields
The frontend `listWaves` query SHALL request the `freezeMode` field from the backend in addition to existing Wave fields. The query SHALL NOT request the `isActive` field, which has been removed from the backend Wave type.

#### Scenario: List waves returns extended fields
- **WHEN** `listWaves` is called
- **THEN** the query SHALL request `open`, `frozen`, `startDate`, `endDate`, `isFrozen`, `freezeMode`, `myRole`, `joinUrl`, `location`, `radius` in addition to existing fields
- **THEN** the query SHALL NOT request `isActive`
