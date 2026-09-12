## ADDED Requirements

### Requirement: Feed loader transient pagination error handling
A transient fetch error (network failure or non-2xx GraphQL error) while loading a feed page SHALL NOT be treated as end-of-data. The existing photo list SHALL be preserved, `noMoreData` SHALL remain false, and subsequent `handleLoadMore` or `reload` calls SHALL retry fetching. Only a successful response with no photos and no `nextPage` SHALL set `noMoreData` to true.

#### Scenario: Transient API error during geo feed load
- **WHEN** a geo-photos page request fails with a network or API error
- **THEN** the previously loaded photos SHALL remain visible in the feed
- **THEN** `noMoreData` SHALL be false
- **THEN** the next `handleLoadMore` or pull-to-refresh SHALL retry the failed page

#### Scenario: Transient API error during watched feed load
- **WHEN** a watched-photos page request fails with a network or API error
- **THEN** the previously loaded photos SHALL remain visible in the feed
- **THEN** `noMoreData` SHALL be false
- **THEN** pagination SHALL NOT be permanently stopped by the error

#### Scenario: Genuine end of data still stops pagination
- **WHEN** a feed page request succeeds and returns zero photos and no `nextPage`
- **THEN** `noMoreData` SHALL be set to true
- **THEN** `handleLoadMore` SHALL be a no-op

### Requirement: Feed loader batch token is per hook instance
The feed loader SHALL scope its batch/correlation token to the individual hook instance so that two simultaneously mounted feed instances (e.g., main feed and a detail feed) cannot abort or discard each other's in-flight loads. A token stored at module scope and shared across instances SHALL NOT be used.

#### Scenario: Two feed instances load independently
- **WHEN** two feed loader instances are mounted at the same time and both issue page loads
- **THEN** an abort or reload in one instance SHALL NOT cancel or discard in-flight responses from the other instance
- **THEN** each instance SHALL apply only its own responses to its own state
