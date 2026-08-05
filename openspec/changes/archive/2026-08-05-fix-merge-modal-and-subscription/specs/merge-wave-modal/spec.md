# Merge Wave Modal — Debounce Reset Fix

## Requirement: Modal Open Without Crash

**GIVEN** the user opens the MergeWaveModal
**WHEN** the modal's `useEffect` fires on `visible` change
**THEN** the modal SHALL clear the search text without throwing a ReferenceError
**AND** `setSearchText('')` SHALL be the only mechanism for clearing search state
**AND** the component SHALL NOT call `setDebouncedSearch` (which does not exist)
