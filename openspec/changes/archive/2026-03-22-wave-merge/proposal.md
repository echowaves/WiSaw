## Why

Users who auto-group photos into waves—or create waves manually over time—end up with waves that should be combined. There is no way to merge two waves today; users must manually move each photo one at a time, then delete the empty wave. The backend `mergeWaves` mutation already exists but the client has no UI for it.

## What Changes

- Add a **"Merge Into Another Wave..."** option to the WaveCard long-press context menu on the WavesHub screen and to the header ellipsis menu on the WaveDetail screen.
- Add a tappable **⋮ (three-dot) icon** to each WaveCard so the context menu is discoverable without knowing about long-press.
- Show a **one-time tooltip** ("Hold or tap ⋮ for options") the first time the user sees the WavesHub, persisted via SecureStore.
- Build a **purpose-built MergeWaveModal** that lists all waves except the source, supports search/filter, and lets the user select the target wave.
- Show a **confirmation alert** with photo count details before executing the merge.
- After a successful merge: remove the source wave from the list and update the target wave's `photosCount` (WavesHub), or navigate back (WaveDetail).
- Wire up the existing backend `mergeWaves(targetWaveUuid, sourceWaveUuid, uuid, name?, description?)` GraphQL mutation in the client.

## Capabilities

### New Capabilities
- `wave-merge`: Merge one wave into another—GraphQL mutation, merge target picker modal, confirmation flow, and post-merge state updates.
- `wave-card-context-hint`: Tappable ⋮ icon on WaveCard and one-time tooltip for discoverability.

### Modified Capabilities
- `wave-hub`: Add merge option to long-press context menu and handle post-merge list updates.
- `wave-detail`: Add merge option to header ellipsis menu and navigate back after merge.

## Impact

- **Code**: `src/screens/Waves/reducer.js`, `src/screens/WavesHub/reducer.js`, `src/screens/WaveDetail/reducer.js`, `src/screens/WavesHub/index.js`, `src/screens/WaveDetail/index.js`, `src/components/WaveCard/index.js`, new `src/components/MergeWaveModal/index.js`.
- **APIs**: Consumes existing `mergeWaves` mutation—no backend changes needed.
- **Dependencies**: None added. Uses existing `expo-secure-store` for tooltip persistence.
- **Platforms**: iOS, Android, Web.
