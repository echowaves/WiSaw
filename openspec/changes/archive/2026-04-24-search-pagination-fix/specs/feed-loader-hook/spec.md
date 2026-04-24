## MODIFIED Requirements

### Requirement: Feed loader empty response handling
The hook SHALL handle empty responses with the same branching logic as the current `PhotosList`: if `noMoreData` is true, stop. If search is active and `nextPage` exists, auto-page recursively. If no search, apply the consecutive-empty heuristic (stop on first empty if list is empty, or after 10 consecutive empties).

#### Scenario: Auto-page on empty search results
- **WHEN** `load()` returns empty photos with search active and `nextPage` provided
- **THEN** `load()` SHALL recursively call itself with `nextPage`
- **THEN** this SHALL continue until photos are found or `noMoreData` is true

### Requirement: Feed loader auto-pages through all search results
When loading in search mode, the hook SHALL continue fetching subsequent pages after receiving photos until all results are exhausted. This ensures search results are fully loaded regardless of whether VirtualizedList fires `onEndReached`.

#### Scenario: Auto-page on non-empty search results
- **WHEN** `load()` returns photos with search active and `noMoreData` is false and `nextPage` is provided
- **THEN** `load()` SHALL append the photos to the list
- **THEN** `load()` SHALL recursively call itself with `nextPage` and the same search term
- **THEN** this SHALL continue until `noMoreData` is true or no `nextPage` is provided

#### Scenario: Auto-page respects abort signal
- **WHEN** the user starts a new search or navigates away during an auto-page chain
- **THEN** the abort signal SHALL prevent further recursive `load()` calls
- **THEN** no state updates SHALL occur from the aborted chain

#### Scenario: Non-search pagination is unaffected
- **WHEN** `load()` returns photos without a search term active
- **THEN** auto-page SHALL NOT occur
- **THEN** subsequent pages SHALL still be loaded via `onEndReached` → `handleLoadMore`
