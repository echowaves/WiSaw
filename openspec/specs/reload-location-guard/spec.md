### Requirement: Reload skips geo-feed request when location is unavailable
The PhotosList `reload()` function SHALL return immediately without calling `feedReload` when the derived `location` value is null (i.e., `locationState.status` is not `'ready'`).

#### Scenario: Network becomes available before location is ready
- **WHEN** `netAvailable` changes to `true` and `locationState.status` is not `'ready'`
- **THEN** `reload()` returns without making a geo-feed request and no error is thrown

#### Scenario: Identity changes before location is ready
- **WHEN** an identity-change event fires and `locationState.status` is not `'ready'`
- **THEN** `reload()` returns without making a geo-feed request and no error is thrown

#### Scenario: Location becomes ready after skipped reload
- **WHEN** `locationState.status` transitions to `'ready'` after a previously skipped reload
- **THEN** the `locationState.status` effect fires `reload()` with a valid `location` and the geo-feed loads normally
