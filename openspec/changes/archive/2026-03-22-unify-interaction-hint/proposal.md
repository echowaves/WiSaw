## Why

Three screens support long-press menus (PhotosList, WavesHub, WaveDetail) but their hint banners are implemented inconsistently: PhotosList has a dark banner with a bulb icon and ✕ close button, WavesHub has a theme-colored tooltip that auto-dismisses on tap, and WaveDetail has no hint at all. Each uses a different SecureStore key and different text. This makes the UX inconsistent and the code duplicated.

## What Changes

- Create a shared `InteractionHintBanner` component that encapsulates the hint banner UI, SecureStore persistence logic, and dismiss behavior
- The component manages its own visibility state — screens just render it unconditionally
- All screens use a single unified SecureStore key (`interactionHintShown`) with backward compatibility for legacy keys (`photoActionsHintShown`, `waveContextMenuTooltipShown`)
- Unified banner text: "Tap and hold for options or tap ⋮"
- Consistent visual style across all screens: dark semi-transparent background, bulb icon, ✕ close button
- Add the hint banner to WaveDetail (currently missing)
- Remove inline hint implementations from PhotosList and WavesHub, replace with the shared component
- Clean up orphaned inline hint code: remove `showPhotoHint` state / `checkHint` effect / `dismissPhotoHint` handler / banner JSX / `photoHintBanner`·`photoHintContent`·`photoHintText` styles from PhotosList, and `showTooltip` state / `checkTooltip` effect / `dismissTooltip` handler / tooltip JSX / `tooltipContainer`·`tooltipText` styles from WavesHub

## Capabilities

### New Capabilities
- `interaction-hint-banner`: Shared reusable hint banner component with self-contained SecureStore persistence, one-time display logic, and consistent visual styling

### Modified Capabilities
- `photo-thumb-context-hint`: The hint banner requirement changes from screen-specific inline implementation to using the shared `InteractionHintBanner` component. SecureStore key changes from `photoActionsHintShown` to `interactionHintShown` (with backward compat). Text changes. Banner no longer restricted to main feed only — WaveDetail gets one too.
- `wave-card-context-hint`: The tooltip requirement changes from a theme-colored auto-dismiss tooltip to using the shared `InteractionHintBanner` component with the unified design. SecureStore key changes from `waveContextMenuTooltipShown` to `interactionHintShown` (with backward compat).
- `wave-detail`: Add interaction hint banner display using the shared component when photos are present.

## Impact

- New file: `src/components/ui/InteractionHintBanner.js`
- Modified: `src/screens/PhotosList/index.js` — remove inline hint state, effect, handler, JSX, styles; add shared component
- Modified: `src/screens/WavesHub/index.js` — remove inline tooltip state, effect, handler, JSX, styles; add shared component
- Modified: `src/screens/WaveDetail/index.js` — add shared component
- Dependencies: `expo-secure-store` (already used), `@expo/vector-icons` Ionicons (already used)
