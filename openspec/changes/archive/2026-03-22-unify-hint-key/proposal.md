## Why

The `InteractionHintBanner` component currently checks three separate SecureStore keys (`interactionHintShown`, `photoActionsHintShown`, `waveContextMenuTooltipShown`) on mount for backward compatibility with legacy per-screen hint implementations. This is unnecessary complexity — the component should use a single key so that dismissing the hint on any screen prevents it from appearing on all other screens, without maintaining awareness of legacy keys.

## What Changes

- Simplify `InteractionHintBanner` to use only one SecureStore key (`interactionHintShown`) for both reading and writing
- Remove the `HINT_KEYS` array and the `Promise.all` multi-key check
- Single `SecureStore.getItemAsync('interactionHintShown')` on mount, single `SecureStore.setItemAsync('interactionHintShown', 'true')` on dismiss

## Capabilities

### New Capabilities

(none)

### Modified Capabilities
- `interaction-hint-banner`: Simplify SecureStore persistence from checking three keys to using a single `interactionHintShown` key for both read and write

## Impact

- Modified: `src/components/ui/InteractionHintBanner.js` — remove `HINT_KEYS` array, replace `Promise.all` check with single key read
