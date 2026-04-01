## 1. Shared Component Updates

- [x] 1.1 Add `hintText` prop to `src/components/ui/InteractionHintBanner.js` with default value of current hardcoded text
- [x] 1.2 Add Jotai atoms `friendsSortBy` and `friendsSortDirection` to `src/state/index.js` (default: `recentlyAdded` / `desc`)

## 2. Fix Header Dark Mode

- [x] 2.1 Update `app/(drawer)/friends.tsx` to use `getTheme(isDarkMode)` instead of static `SHARED_STYLES.theme` for header button styling

## 3. Remove Swipe Gestures

- [x] 3.1 Remove PanGestureHandler import and all swipe gesture code from FriendItem in `src/screens/FriendsList/index.js` (translateX, gesture handlers, stripe animations, swipe state)
- [x] 3.2 Remove swipe-related inline action buttons for pending friends (share/delete buttons that appear instead of swipe)

## 4. Add ActionMenu Context Menu

- [x] 4.1 Add visible ⋮ menu button to each friend row (right edge, themed)
- [x] 4.2 Add `onLongPress` handler to each friend row triggering ActionMenu
- [x] 4.3 Implement ActionMenu for confirmed friends with items: Share Name, Edit Name, separator, Remove Friend (destructive)
- [x] 4.4 Implement ActionMenu for pending friends with items: Share Link, separator, Cancel Request (destructive)

## 5. Add Loading Progress Bar

- [x] 5.1 Import LinearProgress and render at top of FriendsList, visible during initial load and pull-to-refresh

## 6. Add Interaction Hint Banner

- [x] 6.1 Add InteractionHintBanner to FriendsList with `hintText="Long-press a friend for options, or tap ⋮"` and `hasContent` bound to friends list length

## 7. Add Client-Side Search

- [x] 7.1 Add search state (`searchText`, `debouncedSearch`) with 300ms debounce effect to FriendsList
- [x] 7.2 Add KeyboardStickyView search bar at bottom of FriendsList (hidden when list is empty and no search active)
- [x] 7.3 Filter displayed friends list by debounced search term (case-insensitive name match)
- [x] 7.4 Add search-aware EmptyStateCard ("No friends found" with "Clear Search" action) when search yields no results

## 8. Add Sort Options

- [x] 8.1 Update `app/(drawer)/friends.tsx` header to include ⋮ ActionMenu button with sort options (Alphabetical A-Z, Alphabetical Z-A, Recently Added, Most Recent Chat) with checkmark on active option
- [x] 8.2 Implement sort logic in FriendsList: partition pending friends to top, then sort confirmed friends by selected option
- [x] 8.3 Wire sort Jotai atoms to FriendsList rendering

## 9. Add FriendsExplainerView

- [x] 9.1 Create `src/components/FriendsExplainerView/index.js` following WavesExplainerView visual pattern — icon circle, explanatory cards, "Add a Friend" CTA, dark mode support
- [x] 9.2 Use FriendsExplainerView as ListEmptyComponent in FriendsList when no friends exist and no search is active
