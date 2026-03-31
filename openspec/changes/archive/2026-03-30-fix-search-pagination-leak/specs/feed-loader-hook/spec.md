## MODIFIED Requirements

### Requirement: Feed loader manages pagination
The hook SHALL track `pageNumber`, `stopLoading`, and `consecutiveEmptyResponses`. The hook SHALL maintain a `searchTermRef` that stores the active search term. The `reload()` function SHALL write the search term override to `searchTermRef`. The `handleLoadMore` function SHALL increment the page number and call `load()` with the search term from `searchTermRef`, ensuring paginated requests preserve the active search context. No `useEffect` watching `pageNumber` SHALL exist.

#### Scenario: Infinite scroll triggers next page
- **WHEN** the masonry grid reaches the scroll threshold and `stopLoading` is false
- **THEN** `handleLoadMore()` SHALL increment `pageNumber` and call `load()` with the new page
- **THEN** fetched photos SHALL be appended to the existing list

#### Scenario: Stop loading when no more data
- **WHEN** `load()` receives `noMoreData: true` from the fetch response
- **THEN** `stopLoading` SHALL be set to true
- **THEN** `handleLoadMore()` SHALL be a no-op

#### Scenario: Pagination preserves search term
- **WHEN** `reload()` is called with a search term override (e.g., "sunset")
- **AND** the user scrolls to load more results
- **THEN** `handleLoadMore()` SHALL pass the stored search term from `searchTermRef` to `load()`
- **THEN** the paginated API request SHALL include `searchTerm: "sunset"`
- **THEN** only matching photos SHALL be returned and appended

#### Scenario: Clearing search resets stored term
- **WHEN** `reload()` is called with an empty string `''` as the search term override
- **THEN** `searchTermRef` SHALL be set to `''`
- **THEN** subsequent `handleLoadMore()` calls SHALL pass an empty search term
- **THEN** the API SHALL return unfiltered results
