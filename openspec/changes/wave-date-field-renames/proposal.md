## Why

The backend (`wave-invite` branch) has been deployed to production with renamed wave scheduling fields: `startDate` → `splashDate`, `endDate` → `freezeDate`. The explicit `frozen` toggle has been removed — freezing is now controlled solely by `freezeDate`. The `isActive` computed field is gone, replaced by `isFrozen` as the sole state indicator. The client still sends/reads the old field names, causing mutations to fail with NOT NULL constraint violations and freeze-related errors in production.

## What Changes

- **BREAKING**: Rename `startDate` → `splashDate` across all GraphQL operations and UI
- **BREAKING**: Rename `endDate` → `freezeDate` across all GraphQL operations and UI
- **BREAKING**: Remove explicit `frozen` toggle from `updateWave` mutation and WaveSettings UI
- **BREAKING**: Remove `isActive` field from all GraphQL queries; use `isFrozen` instead
- Replace "Pending" badge logic: was `wave.isActive === false`, now checks if `splashDate` is in the future
- WaveSettings: remove freeze/unfreeze switch; keep splash date and freeze date pickers
- WaveSettings: allow changing `freezeDate` even when frozen (setting a future date unfreezes the wave)
- Keep frozen banner display when `isFrozen === true`

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `wave-detail`: Update GraphQL response fields to use `splashDate`/`freezeDate` instead of `startDate`/`endDate`, remove `isActive`
- `wave-hub`: Update WaveCard's "Pending" badge to derive from `splashDate > now` instead of `isActive === false`

## Impact

- **GraphQL operations** (`src/screens/Waves/reducer.js`): `listWaves`, `createWave`, `updateWave` queries/mutations — field renames and removals
- **WaveSettings** (`src/screens/WaveSettings/index.js`): Remove freeze toggle, rename date state/handlers/labels
- **WaveCard** (`src/components/WaveCard/index.js`): Replace `isActive` badge with splashDate-based pending check
- **WavesHub** (`src/screens/WavesHub/index.js`): Verify no stale `isActive` references
- No backend changes (backend is already deployed with these field names)
- No dependency changes
