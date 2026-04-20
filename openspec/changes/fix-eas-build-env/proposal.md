## Why

EAS Build does not receive the app's environment variables (`API_URI`, `API_KEY`, `REALTIME_API_URI`, `PRIVATE_IMG_HOST`) because `.env` is excluded by `.gitignore`, and EAS Build uses `.gitignore` to decide what to upload. The stale/missing EAS Secrets cause production builds (TestFlight/App Store) to launch with broken or empty API configuration, resulting in a blank photo feed with no error indication. Local builds work fine because `.env` is present on disk.

## What Changes

- Add a `scripts/sync-eas-env.js` script that reads `.env` and syncs each variable to EAS Environment Variables via the `eas env:create` CLI, so secrets stay encrypted on Expo's servers and are injected securely at build time — without shipping `.env` in the build archive
- Update the `build` npm script to run the sync script before `eas build`
- Add a startup diagnostic that detects missing/empty API configuration and surfaces a visible error instead of silently showing an empty feed

## Capabilities

### New Capabilities

- `eas-build-env`: Automated sync of `.env` variables to EAS Environment Variables before each build, keeping `.env` as the single source of truth without shipping secrets in the source archive
- `api-config-diagnostic`: Startup check that detects missing API configuration (`API_URI`, `API_KEY`) and shows a visible alert instead of silently failing

### Modified Capabilities

## Impact

- New file: `scripts/sync-eas-env.js`
- Modified: `package.json` — update `build` script to run sync before `eas build`
- Modified: `src/consts.js` — add diagnostic check for undefined/empty API config values
- No API changes, no new runtime dependencies, no breaking changes
