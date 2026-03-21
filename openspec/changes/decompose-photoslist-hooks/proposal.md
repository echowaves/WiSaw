## Why

`src/screens/PhotosList/index.js` is a 1802-line God Component flagged by Codacy/Lizard for having 1393 non-comment lines of code. It manages ~7 distinct concerns (photo expansion, camera/permissions, location, keyboard tracking, network status, animations, search) in a single file. This makes it hard to reason about, test, and maintain. Extracting custom hooks (Strategy A) reduces the main file to ~650 lines while keeping each concern independently testable.

## What Changes

- Extract photo expansion/scroll logic into a `usePhotoExpansion` hook (~250 lines)
- Extract camera permissions and capture into a `useCameraCapture` hook (~100 lines)
- Extract location initialization into a `useLocationInit` hook (~50 lines)
- Extract keyboard visibility and offset tracking into a `useKeyboardTracking` hook (~40 lines)
- Extract network status monitoring into a `useNetworkStatus` hook (~25 lines)
- Extract pending-photo animation logic into a `usePendingAnimation` hook (~50 lines)
- Extract `renderCustomHeader` into a standalone `PhotosListHeader` component (~200 lines)
- Slim `PhotosList/index.js` down to an orchestrator that composes these hooks and renders JSX

## Capabilities

### New Capabilities
- `photo-expansion-hook`: Encapsulates expandedPhotoIds, measuredHeights, scroll-to-visible, toggle, and anchor logic into `usePhotoExpansion`
- `camera-capture-hook`: Encapsulates permission checks, camera/video launch, and double-click prevention into `useCameraCapture`
- `location-init-hook`: Encapsulates foreground location permission request and location retrieval into `useLocationInit`
- `keyboard-tracking-hook`: Encapsulates keyboard show/hide listeners and offset tracking into `useKeyboardTracking`
- `network-status-hook`: Encapsulates NetInfo subscription and network availability state into `useNetworkStatus`
- `pending-animation-hook`: Encapsulates pending-photos banner animation and upload-icon pulse into `usePendingAnimation`
- `photoslist-header-component`: Extracts the 3-tab segmented control header into a standalone `PhotosListHeader` component

### Modified Capabilities

(none — this is a pure refactor with no requirement-level behavior changes)

## Impact

- **Code**: `src/screens/PhotosList/index.js` shrinks from ~1800 to ~650 lines
- **New files**: 6 hook files in `src/screens/PhotosList/hooks/`, 1 component file in `src/screens/PhotosList/components/`
- **Dependencies**: No new packages — all hooks use existing React/RN/Expo APIs
- **Risk**: Pure refactor — no behavioral changes, but requires careful verification that all state interactions are preserved
- **Testing**: Each extracted hook becomes independently unit-testable
