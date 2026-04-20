## Context

EAS Build uploads the project source to a remote build server, using `.gitignore` (or `.easignore` if present) to determine which files to include. The app's API configuration (`API_URI`, `API_KEY`, `REALTIME_API_URI`, `PRIVATE_IMG_HOST`) is read from `process.env` inside `app.config.js` and baked into `Constants.expoConfig.extra` at build time.

Currently `.env` is listed in `.gitignore`, so it is never uploaded to EAS Build. The build server falls back to EAS Secrets (the older `eas secret:` system), which are stale (last updated Dec 2025 / Jan 2026) and incomplete (`PRIVATE_IMG_HOST` is missing entirely). Local builds (`npx expo run:ios --device`) work because `.env` is present on disk.

When API configuration is missing or wrong, `requestGeoPhotos` in the PhotosList reducer catches the GraphQL error silently and returns `{ photos: [], noMoreData: true }`, causing the app to show an empty state with no error indication.

## Goals / Non-Goals

**Goals:**
- Automate syncing `.env` variables to EAS Environment Variables before each build so secrets are encrypted at rest and injected securely — without shipping `.env` in the source archive
- Keep `.env` as the single source of truth for all environments
- Add a visible diagnostic when API configuration is missing so the problem is immediately obvious instead of silently showing an empty feed

**Non-Goals:**
- Shipping `.env` in the build archive (less secure — secrets travel as plaintext in the source upload)
- Requiring developers to manually run `eas env:create` commands (the sync script automates this)
- Changing the GraphQL error handling pattern across the whole app (the diagnostic is a targeted safety net, not a refactor)

## Decisions

### 1. Automated sync script that pushes `.env` to EAS Environment Variables

**Decision**: Create `scripts/sync-eas-env.js` — a Node.js script that parses `.env`, extracts exported variable assignments, and runs `eas env:create --name <KEY> --value <VALUE> --environment production --visibility plain-text --force` for each one. Update the `build` npm script to `source .env && node scripts/sync-eas-env.js && eas build`.

**Rationale**: EAS Environment Variables (the `eas env:` system) stores secrets encrypted at rest on Expo's servers and injects them as `process.env` at build time — the `.env` file never leaves the developer's machine. The sync script eliminates the manual step that caused secrets to go stale for 4+ months. Using `--force` overwrites existing values so the script is idempotent.

**Alternatives considered**:
- **`.easignore` to ship `.env` in the archive**: Simpler, but sends plaintext secrets to the build server in the source upload. Less secure — the secrets exist as a file on disk during the entire build.
- **Update EAS Secrets manually each time**: Error-prone and requires remembering to sync two sources of truth. Already failed once.
- **Use `eas.json` `env` block**: Requires hardcoding secrets in a committed file, which is worse for security.

### 2. Parse `.env` format with `export` prefix support

**Decision**: The sync script parses lines matching `export KEY=VALUE` or `KEY=VALUE`, skipping comments (`#`) and blank lines. It handles quoted values (single and double quotes). It does not use `dotenv` or any runtime dependency — just plain Node.js `fs` and `child_process`.

**Rationale**: The project's `.env` uses `export KEY=VALUE` format (for `source .env` compatibility). A lightweight parser avoids adding a dev dependency. The format is simple enough that a regex-based parser covers all cases in the file.

### 3. Use `--visibility plain-text` for EAS env vars

**Decision**: Set visibility to `plain-text` so values are readable via `eas env:list` for debugging. These are API gateway keys (AppSync API key), not user credentials.

**Rationale**: The API key is a rate-limiting mechanism baked into the client-side JS bundle regardless. Making it `secret` (write-only) would make debugging harder with no meaningful security improvement. If credentials with higher sensitivity are added in the future, the script can be extended to support a visibility flag per variable.

### 4. Add startup diagnostic for missing API configuration

**Decision**: In `src/consts.js`, immediately after reading `API_URI` and `API_KEY` from `Constants.expoConfig.extra`, check if they are undefined or empty. If so, log a prominent console error and show a user-visible `Alert` explaining the configuration is missing.

**Rationale**: The current failure mode is completely silent — the GraphQL query fails, the catch block returns empty data, and the user sees "No Photos in Your Area" with no clue the API is broken. A startup diagnostic makes this failure immediately diagnosable. The check runs once at module load time and has zero runtime cost for correctly configured builds.

**Alternatives considered**:
- **Add error surfacing to every GraphQL call**: Much larger change, not needed to fix this specific bug. Could be done separately.
- **Check at query time in `requestGeoPhotos`**: Too late — by then the user has already waited for location, and the error is mixed in with legitimate "no photos" responses.

## Risks / Trade-offs

- [Sync script depends on `eas` CLI being installed and authenticated] → The `build` script already requires `eas` CLI. If the developer isn't logged in, `eas env:create` will fail with a clear error before the build starts.
- [`--force` overwrites existing EAS env vars on every build] → This is intentional — `.env` is the source of truth. If someone manually edits an EAS env var, the next build will overwrite it. This is the desired behavior.
- [Alert on startup may confuse end users] → The alert only fires when `API_URI` or `API_KEY` is undefined/empty, which should never happen in a correctly built app. It's a developer-facing safety net.
- [No `dotenv` dependency] → The custom parser handles the project's simple `.env` format. If the format grows more complex (multiline values, variable interpolation), consider switching to `dotenv`.
