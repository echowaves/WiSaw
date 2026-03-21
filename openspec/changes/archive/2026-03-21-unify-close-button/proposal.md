## Why

The QuickActionsModal (long-press on photo) and the expanded photo view both have close buttons that float over photo content, but they use completely different designs. The modal's close button is smaller (28×28), uses theme-colored text, and lacks contrast features — making it hard to see over certain photo backgrounds. The expanded view's close button is larger (40×40), uses white-on-dark with text shadow, border, and drop shadow for reliable visibility over any content. Both serve the same purpose in the same visual context and should look identical.

## What Changes

- Create a shared `CloseButton` component in `src/components/ui/CloseButton.js` that matches the expanded photo view's close button design (40×40, white icon, dark background, border, shadow)
- Replace the QuickActionsModal's inline close button with the shared `CloseButton` component
- Replace the expanded photo view's inline close button with the shared `CloseButton` component

## Capabilities

### New Capabilities
- `close-button-component`: Reusable close button UI component with consistent styling for overlay contexts

### Modified Capabilities

## Impact

- `src/components/ui/CloseButton.js` — new shared component
- `src/components/QuickActionsModal/index.js` — replace inline close button with `CloseButton`, remove unused `Ionicons` import and `closeButton` style
- `src/components/Photo/index.js` — replace inline `renderCloseButton` implementation with `CloseButton`
