## Tasks

### Task 1: Replace Wave Detail header icon and styling
- **File**: `app/(drawer)/waves/[waveUuid].tsx`
- **Changes**:
  - Replace `Ionicons` import with `MaterialCommunityIcons` (or add it if `Ionicons` is still needed elsewhere)
  - Change header right icon from `ellipsis-horizontal` (Ionicons, size 24) to `dots-vertical` (MaterialCommunityIcons, size 22)
  - Replace `style={{ padding: 8 }}` on the TouchableOpacity with the styled button pattern: `SHARED_STYLES.interactive.headerButton` + `backgroundColor: theme.INTERACTIVE_BACKGROUND` + `borderWidth: 1` + `borderColor: theme.INTERACTIVE_BORDER`
  - Use `theme.TEXT_PRIMARY` for icon color (already in use)
- **Depends on**: None
