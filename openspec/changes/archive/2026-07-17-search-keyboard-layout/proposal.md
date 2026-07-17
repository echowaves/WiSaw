## Why

When the search FAB expands and the keyboard appears, masonry tiles flow under the keyboard, obscuring photos at the bottom of the viewport. Additionally, the search TextInput submits on the Return key — users expect search to trigger only via the FAB send button.

## What Changes

- **Masonry keyboard avoidance**: The masonry layout dynamically adjusts its bottom padding when the keyboard is open so photos no longer flow under the keyboard.
- **Search submit by button only**: Remove `onSubmitEditing` from the search TextInput. Search is submitted exclusively by tapping the FAB send button. The Return key will dismiss the keyboard without triggering a search.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `search-fab`: Masonry now resizes when keyboard opens (was explicitly "SHALL NOT resize"). Search input no longer submits on Return key press.
- `search-input-validation`: Keyboard return key no longer submits search; only the FAB send button triggers submission.

## Impact

- `src/components/SearchFab/index.js` — remove `onSubmitEditing`, change `returnKeyType`
- `src/screens/PhotosList/index.js` — add keyboard height tracking, pass dynamic `contentPaddingBottom`
- `src/components/PhotosListMasonry/index.js` — `contentPaddingBottom` becomes reactive
- `openspec/specs/search-fab/spec.md` — update scenario about masonry not resizing
- `openspec/specs/search-input-validation/spec.md` — update keyboard submit scenarios
