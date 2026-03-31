## ADDED Requirements

### Requirement: Friends drawer icon color reflects activity state
The Friends drawer icon SHALL use `MAIN_COLOR` when the user has friends and the item is not focused. When the user has no friends or the item is focused, the icon SHALL use the drawer's default `color` prop.

#### Scenario: User has friends and item is not focused
- **WHEN** the `friendsList` Jotai atom has length greater than 0
- **AND** the drawer item is not focused
- **THEN** the Friends drawer icon SHALL render in `MAIN_COLOR`

#### Scenario: User has no friends
- **WHEN** the `friendsList` Jotai atom is empty or null
- **THEN** the Friends drawer icon SHALL render using the drawer's default `color` prop

#### Scenario: Item is focused/active
- **WHEN** the Friends drawer item is focused (active)
- **THEN** the Friends drawer icon SHALL render using the drawer's default `color` prop regardless of friends state
