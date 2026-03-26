## 1. Waves Search Bar Clear Button

- [x] 1.1 Add a `ref` to the `TextInput` in the WavesHub search bar and add a clear (`✕`) `TouchableOpacity` inside the search container, positioned absolutely on the right, shown conditionally when `searchText` is non-empty. On press: clear `searchText` and refocus the input.
- [x] 1.2 Adjust `TextInput` `paddingRight` conditionally when `searchText` is non-empty to prevent text from rendering under the clear button.

## 2. Waves Search Bar Visibility on Empty Results

- [x] 2.1 Change the search bar visibility guard from `waves.length > 0` to `waves.length > 0 || searchText.length > 0` so the search bar stays visible when a search returns zero results.

## 3. Waves Search-Aware Empty State

- [x] 3.1 Update the `ListEmptyComponent` in WavesHub to check `searchText`: when non-empty, render an `EmptyStateCard` with icon `search`, title "No Results Found", subtitle "Try different keywords.", and action text "Clear Search" that clears `searchText`. When empty, keep the existing "No Waves Yet" / "Create a Wave" / "Auto Group" empty state.

## 4. Photos Search Bar Layout Fix

- [x] 4.1 In the `photosList.length > 0` render branch of `PhotosList/index.js`, move the `PhotosListSearchBar` from inside `<View style={styles.container}>` to outside it, as a sibling of `PhotosListFooter`, matching its placement in the other render branches.
