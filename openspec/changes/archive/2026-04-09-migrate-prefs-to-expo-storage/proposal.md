## Why

On fresh app installs (especially iOS simulator), all `SecureStore.getItemAsync()` calls timeout during startup because the iOS Keychain cold-starts slowly. This causes 5+ error toasts to flood the screen on first launch. SecureStore (iOS Keychain) is overkill for non-sensitive preferences like theme, sort order, and UI flags. Additionally, a missing `Platform` import in PhotosList causes background task registration to fail silently, and dead `activeWave` storage code remains after a prior refactor.

## What Changes

- Migrate non-sensitive preferences from `expo-secure-store` to `expo-storage` (filesystem-based, no Keychain dependency):
  - Theme preference and follow-system-theme flag (`themeStorage.js`)
  - Wave sort, wave feed sort, and friend feed sort preferences (`waveStorage.js`)
  - Interaction hint shown flag (`InteractionHintBanner.js`)
  - Identity privacy explainer seen flag (`Secret/index.js`)
  - Terms & conditions accepted flag (`PhotosList/reducer.js`)
- Remove all `Promise.race` timeout wrappers from migrated storage reads (no longer needed with filesystem storage)
- Remove dead `activeWave` storage functions (`saveActiveWave`, `loadActiveWave`, `clearActiveWave`) and the deprecated `ActiveWaveIndicator` component
- Add missing `Platform` import to `PhotosList/index.js` to fix background task registration
- Keep NickName and UUID in `expo-secure-store` (sensitive identity data) but remove timeout on NickName read

## Capabilities

### New Capabilities

- `preference-storage-migration`: Migration of non-sensitive preferences from SecureStore (Keychain) to expo-storage (filesystem) to eliminate cold-start timeouts

### Modified Capabilities

- `theming`: Storage backend changes from SecureStore to expo-storage; timeout wrappers removed
- `wave-sort-persistence`: Storage backend changes from SecureStore to expo-storage; timeout wrappers removed; dead activeWave functions removed
- `interaction-hint-banner`: Storage backend changes from SecureStore to expo-storage
- `terms-and-conditions`: Storage backend changes from SecureStore to expo-storage

## Impact

- **Files modified**: `src/utils/themeStorage.js`, `src/utils/waveStorage.js`, `src/components/ui/InteractionHintBanner.js`, `src/screens/Secret/index.js`, `src/screens/Secret/reducer.js`, `src/screens/PhotosList/index.js`, `src/screens/PhotosList/reducer.js`
- **Files deleted**: `src/components/ActiveWaveIndicator/index.js` (dead code)
- **Dependencies**: No new dependencies; `expo-storage` already in `package.json`
- **User impact**: Clean break — existing users' preferences stored in SecureStore will reset to defaults on first launch after update. This is acceptable since all affected values are lightweight UI preferences easily re-set by the user.
- **No API or backend changes**
