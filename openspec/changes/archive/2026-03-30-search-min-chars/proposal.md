## Why

The search FAB's send button is currently active regardless of input length, allowing users to submit empty or single-character searches that return too many results and waste API calls. Requiring a minimum of 3 characters before enabling the send button prevents useless queries and gives the user a visual cue that more input is needed.

## What Changes

- Disable the send button (reduced opacity, non-interactive) when `searchTerm.length < 3`
- Enable the send button (full opacity, interactive) when `searchTerm.length >= 3`
- Block keyboard "search" return-key submission when the term is fewer than 3 characters

## Capabilities

### New Capabilities

- `search-input-validation`: Minimum character threshold for enabling search submission via the FAB send button

### Modified Capabilities

_None_

## Impact

- `src/components/SearchFab/index.js` — add disabled state to FAB button and keyboard submit guard
