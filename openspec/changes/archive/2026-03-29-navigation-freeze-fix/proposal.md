## Why

Rapidly switching PhotosList segments (0→1→2) then immediately navigating to the Waves screen can freeze the entire app, requiring a restart. The freeze happens because multiple concurrent `reload()` chains fire without cancellation — each triggers network requests, setState calls, and pending queue processing on a screen that's no longer visible. Additionally, navigation buttons like the WaveHeaderIcon use `router.push()` which stacks duplicate screens on double-tap, compounding the problem.

## What Changes

- Add cancellation to PhotosList's `reload()`/`load()` chains so in-flight work is aborted on segment switch or screen blur
- Fix the `pageNumber` useEffect which captures a stale `load()` closure (missing dependency), causing duplicate concurrent `load()` calls per segment switch
- Replace `router.push()` with `router.navigate()` on drawer-sibling navigation icons (WaveHeaderIcon, IdentityHeaderIcon popover, PhotosListFooter friends button) to prevent duplicate screen pushes on double-tap

## Capabilities

### New Capabilities

_None_

### Modified Capabilities

- `photo-feed`: Add requirement that segment-switch and screen-blur cancel in-flight feed loads; fix stale pageNumber effect
- `wave-header-icon`: Require idempotent navigation (no duplicate pushes)

## Impact

- `src/screens/PhotosList/index.js` — reload/load cancellation, pageNumber effect fix
- `src/components/WaveHeaderIcon/index.js` — router.push → router.navigate
- `src/components/IdentityHeaderIcon/index.js` — router.push → router.navigate
- `src/screens/PhotosList/components/PhotosListFooter.js` — router.push → router.navigate
