## Why

The WaveSettings screen loads its initial data by calling the `updateWave` mutation with `name: waveName` as a side-effect-free read. When the backend enforces freeze guards, this call is rejected for frozen waves with "This wave is frozen. Only freeze date can be changed." — making the settings screen completely inaccessible for frozen waves. The backend now provides a dedicated `getWave` query that should be used instead.

## What Changes

- Add a `getWave` GraphQL query function to the waves reducer that calls the new backend `getWave(waveUuid, uuid): Wave` query
- Replace the `updateWave` hack in WaveSettings `loadSettings` with the new `getWave` query
- WaveSettings becomes accessible for frozen waves (read-only load no longer triggers freeze guard)

## Capabilities

### New Capabilities

- `wave-settings-load`: Load wave settings via a read-only `getWave` query instead of abusing the `updateWave` mutation

### Modified Capabilities

(none)

## Impact

- **GraphQL operations** (`src/screens/Waves/reducer.js`): New `getWave` query export
- **WaveSettings** (`src/screens/WaveSettings/index.js`): `loadSettings` switches from `updateWave` to `getWave`
- **No backend changes**: `getWave` query already deployed on `wave-invite` branch
- **No dependency changes**
