## ADDED Requirements

### Requirement: Waves Hub renders ungrouped-photos first section
The Waves Hub SHALL render an `UngroupedPhotosCard` as the `ListHeaderComponent` of the waves FlatList whenever `getUngroupedPhotosCount({ uuid })` returns a value greater than 0, and SHALL omit the card when the count is 0 or null. The card SHALL appear above all wave cards regardless of the FlatList column count.

#### Scenario: Ungrouped photos card shown as list header
- **WHEN** `getUngroupedPhotosCount({ uuid })` returns a value greater than 0
- **THEN** WavesHub SHALL render `UngroupedPhotosCard` as the `ListHeaderComponent` of the waves FlatList
- **THEN** the card SHALL appear above all wave cards regardless of column count

#### Scenario: Ungrouped photos card hidden when count is zero
- **WHEN** `getUngroupedPhotosCount({ uuid })` returns 0 or null
- **THEN** `ListHeaderComponent` SHALL be omitted (no ungrouped card rendered)

### Requirement: Ungrouped count refresh triggers on relevant events
The Waves Hub SHALL re-query `getUngroupedPhotosCount({ uuid })` whenever the ungrouped pool could change: on initial mount / focus, on photo upload complete, on auto-group complete, and on wave delete (which pushes the deleted wave's photos back into the ungrouped pool).

#### Scenario: Wave deletion surfaces ungrouped photos
- **WHEN** the user deletes a wave
- **THEN** the deleted photos SHALL move into the ungrouped pool server-side
- **THEN** the Waves Hub SHALL re-query `getUngroupedPhotosCount({ uuid })`
- **THEN** the `UngroupedPhotosCard` SHALL appear because the count is now > 0
- **THEN** the user SHALL have access to the grouping actions

### Requirement: Waves Hub drives grouping actions
When the `UngroupedPhotosCard` is rendered, WavesHub SHALL pass the current `ungroupedCount` and `uuid` to the card, and SHALL refresh the ungrouped count after any auto-group or manual-group operation completes so the card hides when the pool becomes empty.

#### Scenario: Count refreshes after grouping
- **WHEN** an auto-group or manual-group operation completes
- **THEN** the Waves Hub SHALL re-query `getUngroupedPhotosCount({ uuid })`
- **THEN** the `UngroupedPhotosCard` SHALL hide when the count reaches 0
