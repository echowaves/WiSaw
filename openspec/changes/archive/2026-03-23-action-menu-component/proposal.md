## Why

The app uses three separate ActionSheetIOS + Alert.alert implementations with platform branching (`Platform.OS === 'ios'`) for context menus. These native APIs are string-only — no icons, no separators, no native checkmarks. The waves kebab menu now has 7 items after adding sort options, making scannability important. A reusable custom modal component would provide icon support, visual grouping via separators, proper checkmarks, destructive styling, and eliminate all platform branching — with zero new dependencies.

## What Changes

- Create a new reusable `ActionMenu` component (`src/components/ActionMenu/index.js`) — a themed center-card modal with icon + label rows, separators, checkmark items, and destructive styling
- Replace `ActionSheetIOS` + `Alert.alert` + platform branching in the waves header kebab menu with `ActionMenu`
- Replace `ActionSheetIOS` + `Alert.alert` + platform branching in the wave detail header menu with `ActionMenu`
- Replace `ActionSheetIOS` + `Alert.alert` + platform branching in the wave card long-press context menu with `ActionMenu`
- Remove `ActionSheetIOS`, `Alert`, and `Platform` imports from files that no longer need them

## Capabilities

### New Capabilities
- `action-menu`: Reusable themed modal menu component supporting icon items, separators, checked state, destructive styling, and overlay dismiss

### Modified Capabilities
- `waves-auto-group-header`: Kebab menu switches from ActionSheetIOS/Alert to ActionMenu with icons and separators
- `wave-hub`: Wave card long-press context menu switches from ActionSheetIOS/Alert to ActionMenu with icons
- `wave-detail`: Wave detail header menu switches from ActionSheetIOS/Alert to ActionMenu with icons

## Impact

- New file: `src/components/ActionMenu/index.js`
- Modified: `app/(drawer)/waves/index.tsx` — replace ActionSheetIOS/Alert with ActionMenu
- Modified: `src/screens/WaveDetail/index.js` — replace ActionSheetIOS/Alert with ActionMenu
- Modified: `src/screens/WavesHub/index.js` — replace ActionSheetIOS/Alert with ActionMenu
- No new dependencies — uses existing `MaterialCommunityIcons` from `@expo/vector-icons` and React Native `Modal`
