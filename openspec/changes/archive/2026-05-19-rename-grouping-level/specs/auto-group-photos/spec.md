# Spec: Auto-group Photos (Client)

## Purpose

Define how the client app configures and triggers photo auto-grouping, with consistent naming aligned to the server-side `GroupingLevel` enum.

## MODIFIED Requirements

### Requirement: GroupingLevel Setting Name

The client MUST use `groupingLevel` (not `granularity`) as the property name for the auto-grouping level setting across all client code:

- Jotai atom state: `{ groupingLevel, enabled, lastTriggerLat, lastTriggerLon, lastTriggerTs }`
- Storage key: `@grouping:groupingLevel`
- Function names: `setGroupingLevel()`, `getGroupingLevel()`
- UI labels: "Grouping Level" (not "Granularity")

### Requirement: GroupingLevel Options

The client MUST provide four grouping level options in the settings UI, with field-matching descriptions:

| GroupingLevel | UI Label | Description |
|---------------|----------|-------------|
| DISTRICT | Near | Same district |
| CITY | Medium | Same city |
| REGION | Far | Same region |
| COUNTRY | World | Same country |

#### Scenario: User sees Grouping Level options

- **WHEN** user opens Grouping Settings screen
- **THEN** they see "Grouping Level" section with four options: Near (Same district), Medium (Same city), Far (Same region), World (Same country)

#### Scenario: User selects a grouping level

- **WHEN** user taps "Medium" (CITY)
- **THEN** system stores `groupingLevel: 'CITY'` to AsyncStorage and Jotai atom

### Requirement: Storage Migration

The client MUST migrate existing users from the old `@grouping:granularity` storage key to the new `@grouping:groupingLevel` key:

1. On load, try new key `@grouping:groupingLevel` first
2. If not found, try old key `@grouping:granularity`
3. If old key found, write value to new key, delete old key
4. Return the value (new key takes precedence)

#### Scenario: New user has no existing settings

- **WHEN** app loads settings for the first time
- **THEN** default `groupingLevel` is `'CITY'`

#### Scenario: Existing user with old storage key

- **WHEN** app loads settings and old key `@grouping:granularity` exists
- **THEN** value is read from old key, written to new key, old key deleted

#### Scenario: User's setting is preserved after update

- **WHEN** user has `groupingLevel: 'REGION'` stored under old key
- **THEN** after app update, their setting is migrated to new key and preserved

### Requirement: Auto-trigger threshold function

The client MUST provide `getGroupingThreshold(groupingLevel)` function that returns the distance threshold in km for the auto-trigger mechanism:

| GroupingLevel | Threshold | Purpose |
|---------------|-----------|---------|
| DISTRICT | 10km | Neighborhood scale trigger |
| CITY | 50km | City scale trigger |
| REGION | 250km | Regional scale trigger |
| COUNTRY | 1000km | National scale trigger |

**Note**: This threshold is used for the auto-trigger mechanism (deciding WHEN to call the mutation), not for the actual grouping logic (which is field-matching on the server).

#### Scenario: Get threshold for CITY

- **WHEN** `getGroupingThreshold('CITY')` is called
- **THEN** it returns `50`

#### Scenario: Get threshold for unknown level

- **WHEN** `getGroupingThreshold('UNKNOWN')` is called
- **THEN** it returns `50` (CITY default)

### Requirement: Settings UI labels

The Grouping Settings screen MUST use the following labels:

- Section title: "Grouping Level" (not "Granularity")
- Section description: "How far should users be to be grouped into the same wave?" (unchanged)
- Info card: References "field-matching" (not "distance threshold")
- Wave Settings link: Shows "Grouping Level: CITY" (not "Granularity: CITY")

#### Scenario: User views Grouping Settings

- **WHEN** user navigates to Grouping Settings
- **THEN** they see "Grouping Level" section with field-matching descriptions

#### Scenario: User views Wave Settings

- **WHEN** user views Wave Settings
- **THEN** the auto-group link shows "Grouping Level: CITY · Enabled"
