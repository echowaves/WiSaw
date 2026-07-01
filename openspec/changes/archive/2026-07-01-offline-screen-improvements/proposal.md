## Why

When users are offline, the PhotosList screen shows an offline card that misleadingly states photos can be taken offline — but photo capture actually requires location determination. Additionally, the "Try Again" button does nothing useful when location hasn't resolved yet, leaving users stuck with no clear path forward.

## What Changes

- Update the offline card subtitle to accurately communicate that photos require location determination
- Make the "Try Again" button force-check GPS and refresh the feed, instead of calling `reload()` which silently returns when location is not ready
- Extract `setLocation` at the component level so it can be used in the callback handler

## Capabilities

### Modified Capabilities

- `offline-guard`: Screen offline card behavior — subtitle accuracy and "Try Again" button action

### New Capabilities

<!-- None -->

## Impact

- `src/screens/PhotosList/index.js` — subtitle text, `handleTryAgain` handler, `setLocation` extraction
- `src/components/EmptyStateCard/` — no changes needed (already supports the required props)
- `src/state.js` — no changes needed
- `src/hooks/useLocationProvider.js` — no changes needed