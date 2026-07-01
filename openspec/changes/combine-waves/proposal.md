## Why

Users currently can only merge two waves at a time via a cumbersome long-press → "Merge Into..." flow. Pocket's "Combine Memories" pattern (multi-select + single combine action) is a proven, intuitive UX that lets users consolidate 2+ waves in one gesture. The backend API already supports multi-wave merge (`sourceWaveUuids: [String!]!`), so this is purely a frontend enhancement to unlock existing backend capability.

## What Changes

- **New multi-select mode** in WavesHub: Header "Select" button toggles selection mode, tap waves to toggle selection, floating action bar shows count + "Combine" button
- **Auto-target selection**: When combining N waves, the wave with the most photos becomes the target (survives), all others merge into it and are deleted
- **WaveCard selection UI**: Check overlay on selected waves, disabled context menu in selection mode
- **Updated GraphQL mutation**: Change `sourceWaveUuid` (single string) to `sourceWaveUuids` (array) to match backend schema
- **Combine button**: Disabled at 1 selection (minimum 2 waves required), shows count "Combine (N)"

## Capabilities

### New Capabilities
- `wave-multi-select`: Multi-select mode on WavesHub screen with header toggle, selection state management, floating action bar, and combine flow
- `wave-combine`: End-to-end combine operation - select 2+ waves, auto-pick target, call merge mutation, update UI

### Modified Capabilities
- `wave-assignment`: The `mergeWaves` GraphQL mutation signature changes from single source to array of sources. Existing single-wave merge flow (context menu → "Merge Into...") remains but uses the same array-based mutation.

## Impact

**Frontend files:**
- `src/screens/Waves/reducer.js` - `mergeWaves()` function: `sourceWaveUuid` → `sourceWaveUuids: [...]`, add `name`/`description` params
- `src/components/WaveCard/index.js` - Add `selected` + `selectMode` props, selection overlay UI
- `src/screens/WavesHub/index.js` - Selection mode state, header "Select" button, floating action bar, combine logic
- `src/components/MergeWaveModal/index.js` - Accept multiple source waves, auto-pick target, show merge summary

**Backend:** No changes needed. The `mergeWaves` mutation in `../Wisaw.cdk` already accepts `sourceWaveUuids: [String!]!` and handles the multi-wave merge correctly.

**No breaking changes.** The existing single-wave merge flow (context menu → "Merge Into Another Wave...") continues to work by passing a single-element array.