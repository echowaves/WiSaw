## 1. Add Badge to Kebab Icon

- [x] 1.1 In `app/(drawer)/waves/index.tsx`, re-add `View`, `Text`, `StyleSheet` imports and badge styles. Add inline badge rendering next to the `dots-vertical` icon inside the `TouchableOpacity` (using `flexDirection: 'row'`, `alignItems: 'center'`). Show badge only when `ungroupedCount > 0`. Pass `ungroupedCount` as a prop to `<WavesHub ungroupedCount={ungroupedCount} />`.

## 2. Extend EmptyStateCard with Secondary Action

- [x] 2.1 In `src/components/EmptyStateCard/index.js`, add optional `secondaryActionText` and `onSecondaryActionPress` props. Render a secondary button below the primary action when both are provided. Style it with an outlined appearance (border, transparent background) to differentiate from the primary filled button.

## 3. Empty State Improvements in WavesHub

- [x] 3.1 In `src/screens/WavesHub/index.js`, accept `ungroupedCount` prop. Conditionally hide the search bar when `waves.length === 0`. Add `secondaryActionText` and `onSecondaryActionPress` to the `EmptyStateCard` to show "Auto Group N photos" when `ungroupedCount > 0`, wired to `emitAutoGroup(ungroupedCount)`.
