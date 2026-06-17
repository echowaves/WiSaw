## ADDED Requirements

### Requirement: useDebouncedSearch hook SHALL replace inline debounce effects

The system SHALL provide a `useDebouncedSearch()` hook in `src/hooks/useDebouncedSearch.js` that manages search text state, debounce timing, and cleanup. The hook SHALL replace identical `useEffect` blocks in WavesHub, FriendsList, MergeWaveModal, and WaveSelectorModal.

#### Scenario: Basic debounced search
- **WHEN** `useDebouncedSearch()` is called
- **THEN** the hook returns `[searchText, setSearchText]` state and debouncedValue

#### Scenario: Search text updates after debounce
- **WHEN** `setSearchText('test')` is called
- **THEN** `debouncedValue` updates to `'test'` after 300ms (default delay)

#### Scenario: Rapid changes debounce correctly
- **WHEN** `setSearchText('t')` then `setSearchText('te')` then `setSearchText('tes')` are called in quick succession
- **THEN** `debouncedValue` only updates to `'tes'` after 300ms of no changes

#### Scenario: Custom delay
- **WHEN** `useDebouncedSearch({ delay: 500 })` is called
- **THEN** `debouncedValue` updates after 500ms instead of 300ms

#### Scenario: Cleanup on unmount
- **WHEN** the component unmounts
- **THEN** the debounce timer is cleared

### Requirement: WavesHub SHALL adopt useDebouncedSearch

The system SHALL replace WavesHub's inline debounce `useEffect` with `useDebouncedSearch()`.

#### Scenario: WavesHub uses hook instead of useEffect
- **WHEN** WavesHub needs debounced search
- **THEN** it calls `useDebouncedSearch()` and uses the returned state setter

### Requirement: FriendsList SHALL adopt useDebouncedSearch

The system SHALL replace FriendsList's inline debounce `useEffect` with `useDebouncedSearch()`.

#### Scenario: FriendsList uses hook instead of useEffect
- **WHEN** FriendsList needs debounced search
- **THEN** it calls `useDebouncedSearch()` and uses the returned state setter

### Requirement: MergeWaveModal SHALL adopt useDebouncedSearch

The system SHALL replace MergeWaveModal's inline debounce `useEffect` with `useDebouncedSearch()`.

#### Scenario: MergeWaveModal uses hook instead of useEffect
- **WHEN** MergeWaveModal needs debounced search
- **THEN** it calls `useDebouncedSearch()` and uses the returned state setter

### Requirement: WaveSelectorModal SHALL adopt useDebouncedSearch

The system SHALL replace WaveSelectorModal's inline debounce `useEffect` with `useDebouncedSearch()`.

#### Scenario: WaveSelectorModal uses hook instead of useEffect
- **WHEN** WaveSelectorModal needs debounced search
- **THEN** it calls `useDebouncedSearch()` and uses the returned state setter
