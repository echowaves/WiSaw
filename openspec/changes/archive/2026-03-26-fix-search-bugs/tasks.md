## 1. Waves Search Bar: Move to Bottom

- [x] 1.1 Add `KeyboardStickyView` to the import from `react-native-keyboard-controller` in WavesHub.
- [x] 1.2 Move the search bar from the top of WavesHub to the bottom (after ActionMenu, before closing `</View>`), wrapped in `KeyboardStickyView` with `offset: { closed: 4, opened: 16 }`. Remove the search icon (`FontAwesome5 search`). Keep the same visibility guard (`waves.length > 0 || searchText.length > 0`).
- [x] 1.3 Remove the unused `searchIcon` style. Update `searchInput` `paddingLeft` from 36 to 16 (no longer need space for the icon).

## 2. Waves Search Bar: Clear Button

- [x] 2.1 Add `useRef` to React imports and `Ionicons` to icon imports. Create `searchInputRef` and attach it to the `TextInput`. Add a clear (`✕`) `TouchableOpacity` inside the search container, positioned absolutely on the right, shown when `searchText` is non-empty. On press: clear `searchText` and refocus.
- [x] 2.2 Adjust `TextInput` `paddingRight` conditionally to 36 when `searchText` is non-empty to prevent text from rendering under the clear button.

## 3. Waves Search-Aware Empty State

- [x] 3.1 Update the `ListEmptyComponent` in WavesHub: when `searchText` is non-empty, render an `EmptyStateCard` with icon `search`, title "No Results Found", subtitle "Try different keywords.", and action text "Clear Search". When empty, keep the existing "No Waves Yet" / "Create a Wave" / "Auto Group" empty state.

## 4. Photos Search Bar Layout Fix

- [x] 4.1 In the `photosList.length > 0` render branch of `PhotosList/index.js`, move both `PhotosListSearchBar` and `PhotosListFooter` from inside `<View style={styles.container}>` to the outer `<View style={{ flex: 1 }}>` level, matching the default/empty-state branches.
