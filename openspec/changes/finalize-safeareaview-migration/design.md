## Context

The codebase has been progressively migrating `SafeAreaView` from `react-native` to `react-native-safe-area-context`. Most files are migrated. Two remain:

| File | SafeAreaView usages | Also uses `useSafeAreaViewStyle`? |
|------|---------------------|-----------------------------------|
| `src/screens/Secret/index.js` | 4 wrappers | Yes — `safeAreaViewStyle` applied to all |
| `src/screens/PhotosList/components/PhotosListFooter.js` | 1 wrapper | No |

Both files already import from `react-native-safe-area-context` for other symbols, so the package is already a dependency.

## Design Decisions

### 1. Direct import swap

Replace `SafeAreaView` in the `react-native` import with an import from `react-native-safe-area-context`. This is a drop-in replacement — no structural changes needed.

### 2. Remove `useSafeAreaViewStyle` in Secret screen

The `useSafeAreaViewStyle` hook adds manual `paddingTop: statusBarHeight` on Android. Since `react-native-safe-area-context`'s `SafeAreaView` already handles safe area insets on all platforms, this padding becomes redundant. Removing it simplifies the code and eliminates double-padding on Android.

### 3. No `edges` prop needed

Neither file uses an `edges` prop on their `SafeAreaView` instances. The `react-native-safe-area-context` version defaults to all edges, which matches the existing behavior. No edge configuration changes needed.

### 4. Clean up the hook

After removing the last consumer, `useSafeAreaViewStyle` in `useStatusBarHeight.js` becomes unused. Remove the export. The `useStatusBarHeight` hook itself remains, as it's still used by `useToastTopOffset.js`.

## Migration Map

```
┌─────────────────────────────────────────────────────────────┐
│  File: src/screens/Secret/index.js                           │
├─────────────────────────────────────────────────────────────┤
│  BEFORE:                                                      │
│    import { ..., SafeAreaView, ... } from 'react-native'     │
│    import { useSafeAreaViewStyle } from '../../hooks/...'     │
│    <SafeAreaView style={[styles.container, safeAreaViewStyle]}>│
│  AFTER:                                                       │
│    import { ..., SafeAreaView } from 'react-native-safe-area-context' │
│    (remove useSafeAreaViewStyle import)                       │
│    <SafeAreaView style={styles.container}>                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  File: src/screens/PhotosList/components/PhotosListFooter.js │
├─────────────────────────────────────────────────────────────┤
│  BEFORE:                                                      │
│    import { ..., SafeAreaView, ... } from 'react-native'     │
│    <SafeAreaView style={{ flex: 1 }}>                        │
│  AFTER:                                                       │
│    import { ..., SafeAreaView } from 'react-native-safe-area-context' │
│    <SafeAreaView style={{ flex: 1 }}>                        │
└─────────────────────────────────────────────────────────────┘
```
