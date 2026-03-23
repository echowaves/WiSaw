## Context

The Waves screen header currently has a single auto-group button (with `layer-group` icon and inline ungrouped-count badge) in the `rightSlot`. The "Create New Wave" action only appears in an empty-state card inside WavesHub, making it invisible once the user has waves. The app already uses ActionSheetIOS (iOS) and Alert (Android) for context menus throughout WavesHub and WaveDetail.

An unused event bus (`waveAddBus`) already exists at `src/events/waveAddBus.js` with `emitAddWave` / `subscribeToAddWave` — it was kept during a previous migration but has no active imports.

## Goals / Non-Goals

**Goals:**
- Replace the single auto-group button with a kebab (three-dot) icon that opens a two-item menu
- Menu items: "Create New Wave" and "Auto Group (N ungrouped)"
- Reuse existing platform-native menu pattern (ActionSheetIOS / Alert)
- Reuse existing `waveAddBus` to communicate "create wave" intent from header to WavesHub
- Preserve current auto-group and create-wave flows without modification

**Non-Goals:**
- Changing the create-wave modal UI or validation logic
- Changing the auto-group confirmation or execution flow
- Adding a custom dropdown/popover component (platform-native menus are sufficient)
- Modifying the empty-state card's "Create New Wave" button (it stays as a secondary entry point)

## Decisions

### 1. Platform-native menu via ActionSheetIOS / Alert
**Choice**: Use the same ActionSheetIOS (iOS) / Alert.alert (Android) pattern already used for wave card long-press and WaveDetail header menus.
**Rationale**: Consistent with existing codebase patterns. No new dependencies needed. Platform-native menus are accessible and familiar to users.
**Alternative considered**: Custom dropdown/popover component — rejected because it adds complexity and deviates from existing patterns.

### 2. Revive `waveAddBus` for header → WavesHub communication
**Choice**: Import `emitAddWave` in the route file and `subscribeToAddWave` in WavesHub.
**Rationale**: The event bus already exists and follows the same pattern as `autoGroupBus`. No new abstractions needed — just wire up existing code.
**Alternative considered**: Using a Jotai atom to signal modal open — rejected because event bus is the established pattern for header-to-screen communication in this codebase.

### 3. Move ungrouped count from badge to menu item text
**Choice**: Display the count as part of the Auto Group menu item label, e.g. "Auto Group (5 ungrouped)". No badge on the kebab icon.
**Rationale**: The kebab icon represents a generic menu, not a specific action. Embedding the count in the menu item text keeps the icon clean. The count is still visible when the user opens the menu.
**Alternative considered**: Keeping the badge on the kebab icon — rejected because a badge on a generic menu icon is misleading (suggests notifications, not ungrouped photos).

### 4. Menu item order
**Choice**: "Create New Wave" first, "Auto Group (N ungrouped)" second.
**Rationale**: Creation is the primary action. Auto-group is a utility action. Putting creation first matches importance hierarchy.

## Risks / Trade-offs

- [Count not visible without opening menu] → Acceptable trade-off; users who care about ungrouped count will tap the menu. The count was previously only visible on the small badge anyway.
- [waveAddBus currently unused; may have bit-rotted] → Low risk; the code is straightforward (Set-based listener pattern). Will verify imports work during implementation.
