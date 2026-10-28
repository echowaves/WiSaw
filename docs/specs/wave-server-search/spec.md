# Wave Server Search Specification

## Purpose
Server-side wave search enables filtering waves by name through the `listWaves` GraphQL query, with debounced input handling on the client side.

## Requirements

### Requirement: Server-side wave search via listWaves
The `listWaves` GraphQL query SHALL accept an optional `searchTerm` parameter. When provided, the backend SHALL return only waves whose name matches the search term (case-insensitive partial match). When omitted or empty, all waves SHALL be returned (paginated as normal).

#### Scenario: Search with a term
- **WHEN** `listWaves` is called with `searchTerm: "Vacat"`
- **THEN** the response SHALL contain only waves whose name contains "Vacat" (case-insensitive)
- **THEN** results SHALL be paginated (20 per page) within the filtered set

#### Scenario: Search with empty string
- **WHEN** `listWaves` is called with `searchTerm: ""`
- **THEN** the response SHALL return all waves (same as omitting `searchTerm`)

#### Scenario: Search with no matches
- **WHEN** `listWaves` is called with a `searchTerm` that matches no waves
- **THEN** the response SHALL return an empty `waves` array and `noMoreData: true`

### Requirement: Debounced search input
Components using wave search SHALL debounce search input by 300ms before issuing an API request. Each new search term SHALL reset pagination to page 0 with a new batch UUID.

#### Scenario: User types quickly
- **WHEN** the user types "V", "a", "c" in rapid succession (under 300ms between keystrokes)
- **THEN** only one API call SHALL be made with `searchTerm: "Vac"` after the 300ms debounce

#### Scenario: User clears search
- **WHEN** the user clears the search input
- **THEN** after the 300ms debounce, the system SHALL fetch all waves from page 0 with no `searchTerm`

#### Scenario: Search resets pagination
- **WHEN** the user is on page 3 of results and types a new search term
- **THEN** pagination SHALL reset to page 0 with a new batch UUID
- **THEN** the wave list SHALL be replaced with the new search results
