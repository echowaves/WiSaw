## Why

The Ungrouped Photos card already supports bulk auto-grouping and per-photo wave assignment, but the actions overlap when photos are selected. This makes it possible to trigger an operation that ignores the current selection when the user intended to organize only selected photos.

## What Changes

- Keep the "Auto-Group everything" action at the bottom of the Ungrouped Photos card.
- Enable the bulk action only when no photos are selected and disable it while auto-grouping is in progress.
- Keep "Create a wave" and "Add to an existing wave" as the only enabled grouping actions when one or more photos are selected.
- Preserve the existing server-side auto-group operation, confirmation flow, loading state, and post-operation refresh behavior.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `ungrouped-photos-card`: Change grouping-action availability so bulk grouping and per-photo grouping are mutually exclusive based on selection state.

## Impact

- Affected UI: `src/components/UngroupedPhotosCard/index.js`.
- Affected specifications: `openspec/specs/ungrouped-photos-card/spec.md`.
- No GraphQL schema, backend, dependency, storage, or navigation changes.
- Focused component behavior validation should cover zero selected photos, selected photos, selection clearing, and auto-group loading.