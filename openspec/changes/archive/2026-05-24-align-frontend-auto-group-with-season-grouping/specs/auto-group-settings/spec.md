## MODIFIED Requirements

### Requirement: GroupingLevel Options

The client MUST provide four grouping level options in the settings UI, with field-matching descriptions:

| GroupingLevel | UI Label | Description |
|---------------|----------|-------------|
| DISTRICT | Near | Same district |
| CITY | Medium | Same city |
| REGION | Far | Same region |
| COUNTRY | World | Same country |

The info card below the options SHALL display:
> "Photos are grouped into waves by location and season. Each wave covers one season (e.g. Winter, Spring) at the selected grouping level."

#### Scenario: User sees Grouping Level options

- **WHEN** user opens Grouping Settings screen
- **THEN** they see "Grouping Level" section with four options: Near (Same district), Medium (Same city), Far (Same region), World (Same country)

#### Scenario: User selects a grouping level

- **WHEN** user taps "Medium" (CITY)
- **THEN** system stores `groupingLevel: 'CITY'` to AsyncStorage and Jotai atom

#### Scenario: Info card describes season-based grouping

- **WHEN** user views the Grouping Settings screen
- **THEN** the info card SHALL display text describing season-based grouping behavior
- **AND** SHALL NOT reference "field-matching" or "local timestamps"
