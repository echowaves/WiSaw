## 1. Badge display and styling

- [x] 1.1 In `app/(drawer)/waves/index.tsx`, remove the `99+` ternary cap and render `{ungroupedCount}` directly in the badge text.
- [x] 1.2 In the same file, set badge `minWidth` to 28 and `paddingHorizontal` to 6 so text has adequate content area (28 - 6 - 6 = 16px minimum) while the pill grows for wider numbers.
- [x] 1.3 Add `overflow: 'visible'` to the parent TouchableOpacity so the badge isn't clipped when it extends beyond the button bounds.
