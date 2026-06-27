## Why

The auto-grouping feature moved server-side in a previous change, but the client still displays UI elements (UngroupedPhotosCard, badge counts) that reference ungrouped photos — creating confusing UX where users see "ungrouped" counts and cards when the server now handles all photo organization automatically.

## What Changes

- **Remove** `UngroupedPhotosCard` from WavesHub `ListHeaderComponent` — the card showing "Ungrouped Photos (N)" with a photo strip should never appear
- **Update** WavesExplainerView initial screen messaging to clearly communicate that photos will be automatically added to waves when taken, replacing ambiguous "take photos to start" language
- **Remove** ungrouped photo count badge from WavesHub kebab menu header button
- **Remove** `getUngroupedPhotosCount` API calls from WaveHeaderIcon component (initial load and autoGroupDone refresh)
- **Remove** ungrouped photo count badge from WaveHeaderIcon water icon
- **Remove** ungrouped photo count badge from Waves drawer icon (red dot based on ungrouped activity)
- **Remove** `getUngroupedPhotosCount` API calls from WavesHub upload and autoGroupDone event handlers

## Capabilities

### New Capabilities
<!-- No new capabilities — this is a UI cleanup change -->

### Modified Capabilities
- `drawer-waves-badge`: Drawer icon badge should only reflect waves count activity, not ungrouped photo count
- `photo-upload-orchestration`: Remove ungrouped count API calls from upload completion handlers
- `photo-wave-assignment`: Remove client-side ungrouped photo tracking since server handles all grouping

## Impact

- **Affected code**:
  - `src/screens/WavesHub/index.js` — remove UngroupedPhotosCard, badge, and API calls
  - `src/components/WavesExplainerView/index.js` — update messaging for new users
  - `src/components/WaveHeaderIcon/index.js` — remove ungrouped count badge and API calls
  - `app/(drawer)/_layout.tsx` — update WavesDrawerIcon to not badge on ungrouped count
- **APIs**: No API changes — `getUngroupedPhotosCount` queries will simply no longer be called from the client
- **Dependencies**: No new dependencies