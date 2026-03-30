## ADDED Requirements

### Requirement: Feed search hook encapsulates search state
The `useFeedSearch` hook SHALL manage search state and coordination: the search term, expanded/collapsed state of the search FAB, incoming search events from the photo search bus, and deep-link search parameters. It SHALL accept `onSearch` and `onClear` callbacks for triggering reloads.

#### Scenario: Hook returns search state and actions
- **WHEN** `useFeedSearch` is called with `{ onSearch, onClear }`
- **THEN** it SHALL return `searchTerm`, `setSearchTerm`, `isSearchExpanded`, `setIsSearchExpanded`, `isSearchActive`, `submitSearch`, `handleClearSearch`, and `triggerSearch`

### Requirement: Search submit triggers reload
When the user submits a search, the hook SHALL dismiss the keyboard and call the `onSearch` callback with the current search term.

#### Scenario: User submits search
- **WHEN** the user submits the search input
- **THEN** the keyboard SHALL be dismissed
- **THEN** `onSearch(searchTerm)` SHALL be called

### Requirement: Search clear triggers reload
When the user clears the search, the hook SHALL reset the search term, collapse the search FAB, and call the `onClear` callback.

#### Scenario: User clears search
- **WHEN** the user clears the search input
- **THEN** `searchTerm` SHALL be set to `''`
- **THEN** `isSearchExpanded` SHALL be set to `false`
- **THEN** `onClear()` SHALL be called

### Requirement: Search hook handles event bus
The hook SHALL subscribe to the `photoSearchBus` and set the search term when an incoming search event is received. It SHALL then trigger a reload via `onSearch`.

#### Scenario: AI tag click triggers search
- **WHEN** a photo search event is received from the bus with a search term
- **THEN** `searchTerm` SHALL be set to the incoming term
- **THEN** `isSearchExpanded` SHALL be set to `true`
- **THEN** `onSearch(term)` SHALL be called

### Requirement: Search hook handles deep-link search
The hook SHALL accept an optional `searchFromUrl` parameter. When provided and non-empty, it SHALL set the search term and trigger a search on mount.

#### Scenario: Deep-link with search parameter
- **WHEN** `useFeedSearch` is called with `searchFromUrl` set to a non-empty string
- **THEN** `searchTerm` SHALL be set to the `searchFromUrl` value
- **THEN** `isSearchExpanded` SHALL be set to `true`
- **THEN** `onSearch(searchFromUrl)` SHALL be called
