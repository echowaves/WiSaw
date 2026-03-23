## 1. Add Close Button to ActionMenu

- [x] 1.1 In `src/components/ActionMenu/index.js`, add `Ionicons` import from `@expo/vector-icons`, add a header `View` at the top of the card with the title (if provided) on the left and a close button (`Ionicons` `close`, size 24, `theme.TEXT_PRIMARY`, `hitSlop: { top: 10, bottom: 10, left: 10, right: 10 }`) on the right. Use `flexDirection: 'row'`, `justifyContent: 'space-between'` when title is present, `justifyContent: 'flex-end'` when title is absent. Close button calls `onClose`.
- [x] 1.2 Add header styles to `createStyles` — `header` with row layout, padding matching existing card padding, and remove the standalone `title` style since the title is now part of the header row.
