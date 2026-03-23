## Why

The Waves screen header currently exposes only a single auto-group action button. The "Create New Wave" action is buried in the empty-state card, making it undiscoverable once the user has any waves. Replacing the single button with a kebab (three-dot) menu consolidates both actions into a standard, always-visible entry point.

## What Changes

- Replace the auto-group `TouchableOpacity` button (with icon + badge) in the Waves header `rightSlot` with a vertical three-dot (kebab) icon
- Tapping the kebab opens a platform-native context menu (ActionSheetIOS on iOS, Alert on Android) with two items:
  - **Create New Wave** — signals WavesHub to open its existing create-wave modal
  - **Auto Group (N ungrouped)** — triggers the existing auto-group flow, showing the ungrouped count inline in the menu item text
- Revive the existing but unused `waveAddBus` event system (`emitAddWave` / `subscribeToAddWave`) to communicate the "create wave" action from the header to WavesHub
- The ungrouped count badge is removed from the header icon; the count now appears in the Auto Group menu item text instead

## Capabilities

### New Capabilities

_None_

### Modified Capabilities

- `waves-auto-group-header`: The auto-group button is replaced by a kebab menu; the badge moves into the menu item text; a "Create New Wave" option is added
- `wave-hub`: WavesHub subscribes to the `addWave` event to open the create-wave modal from the header menu

## Impact

- **Files**: `app/(drawer)/waves/index.tsx`, `src/screens/WavesHub/index.js`
- **Events**: `src/events/waveAddBus.js` (already exists, currently unused — will be imported)
- **No new dependencies or API changes**
