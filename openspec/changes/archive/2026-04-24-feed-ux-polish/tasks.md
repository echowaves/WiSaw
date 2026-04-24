## 1. ScrollToTopFob — move to left side

- [x] 1.1 In `src/components/ScrollToTopFob/index.js`, change container position from `right: 12` to `left: 12`
- [x] 1.2 Reverse `translateX` animation: initial shared value from `80` to `-80`, enter target from `0` (same), dismiss target from `80` to `-80`

## 2. Expanded photo collapse icon

- [x] 2.1 In `src/screens/PhotosList/components/PhotosListMasonry.js`, change the collapse button `Ionicons` name from `chevron-up` to `close` in `renderMasonryItem`

## 3. SearchFab clear button always visible

- [x] 3.1 In `src/components/SearchFab/index.js`, change clear button condition from `searchTerm.length > 0` to `isExpanded`
