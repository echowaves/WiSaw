## ADDED Requirements

### Requirement: useSimpleFetch hook provides loading state management

The system SHALL provide a custom React hook `useSimpleFetch` that encapsulates loading state management for single-fetch operations and async action handlers.

#### Scenario: Simple fetch with automatic loading state
- **WHEN** a screen calls `useSimpleFetch(fetchFn, dependencies)` with an async function
- **THEN** the hook returns `{ data, loading, error, execute }` and automatically sets `loading` to `true` during fetch and `false` in the `finally` block

#### Scenario: Execute action handler with loading
- **WHEN** a button calls the returned `execute` function from an event handler
- **THEN** the loading state is managed automatically and the caller does not need try/catch/finally with `setLoading`

#### Scenario: Manual error handling preserved
- **WHEN** the fetch function throws an error
- **THEN** the hook sets `error` state and allows the caller to handle the error (e.g., show a toast) without preventing the error from propagating

#### Scenario: No automatic error handling
- **WHEN** the fetch function throws an error
- **THEN** the hook does NOT automatically show toasts or handle errors — it returns the error for the caller to decide how to handle

### Requirement: useSimpleFetch supports async mutation actions

The system SHALL allow `useSimpleFetch` to be used with mutation operations (not just data fetching), where the action may have side effects like navigation or state updates.

#### Scenario: Action handler with side effects
- **WHEN** `execute` is called with an async function that includes side effects (e.g., toast + navigation)
- **THEN** `loading` is `true` for the entire duration of the async function and `false` when it completes or throws

#### Scenario: Error in action handler
- **WHEN** the async action throws an error
- **THEN** `error` is set and `loading` is reset to `false`, allowing the caller to show an error toast before catching

### Requirement: Existing loading state naming convention is documented

The system SHALL document the canonical loading state naming convention so future screens use consistent variable names.

#### Scenario: Naming standard exists
- **WHEN** a developer reads the naming standard
- **THEN** they find: `loading` for fetch guard, `refreshing` for RefreshControl UI, `stopLoading` for pagination sentinel, `noMoreData` as the boolean flag

## REMOVED Requirements

### Requirement: FriendsList uses `isRefreshing` for RefreshControl
**Reason**: Unified to `refreshing` to match the standard naming
**Migration**: Rename `isRefreshing` → `refreshing` and `setIsRefreshing` → `setRefreshing` in FriendsList/index.js
