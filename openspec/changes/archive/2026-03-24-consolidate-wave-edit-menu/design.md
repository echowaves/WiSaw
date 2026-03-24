## Context

The wave action sheet menus in WaveDetail and WavesHub both contain two separate items — "Rename" and "Edit Description" — that open the identical edit modal with name and description fields. Both handlers set the same state and present the same UI. This is a pure UI cleanup with no backend or API changes.

**Current state:**
- `WaveDetail/index.js` — `headerMenuItems` has `rename` and `edit-description` entries with identical `onPress` handlers
- `WavesHub/index.js` — `contextMenuItems` has `rename` (calls `handleEditWave`) and `edit-description` (inlines the same logic)
- Both lead to the same modal with TextInput fields for name and description

## Goals / Non-Goals

**Goals:**
- Consolidate two redundant menu items into a single "Edit Wave" item in both screens
- Reduce user confusion by presenting one clear action instead of two identical ones

**Non-Goals:**
- Changing the edit modal UI or behavior
- Changing the `updateWave` GraphQL mutation or reducer
- Adding new editing capabilities (e.g., separate name-only or description-only modals)

## Decisions

**Single "Edit Wave" menu item** — Replace both items with one `edit-wave` keyed item using the `pencil-outline` icon. This is chosen because both actions already resolve to the same modal. A single entry is clearer and reduces menu length.

**Keep existing `handleEditWave` function in WavesHub** — The existing helper already sets all required state. The consolidated item simply calls it, removing the inlined duplicate.

**No modal changes** — The modal already handles both fields. No reason to touch it.

## Risks / Trade-offs

[Minimal risk] This is a UI-only change removing duplicate entries. No data flow or API changes. → No mitigation needed.

[User expectation] Users accustomed to separate items may briefly look for the old label. → The "Edit Wave" label is self-explanatory and the modal behavior is unchanged.
