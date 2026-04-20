## Purpose
Automate syncing `.env` variables to EAS Environment Variables before each build, keeping secrets encrypted at rest on Expo's servers without shipping `.env` in the source archive.

## Requirements

### Requirement: Sync script pushes .env to EAS Environment Variables
The project SHALL include a `scripts/sync-eas-env.js` script that reads the `.env` file, parses each `export KEY=VALUE` or `KEY=VALUE` line (skipping comments and blank lines), and runs `eas env:create --name <KEY> --value <VALUE> --environment production --visibility plain-text --force` for each variable.

#### Scenario: .env has four API variables
- **WHEN** `.env` contains `API_URI`, `API_KEY`, `REALTIME_API_URI`, and `PRIVATE_IMG_HOST`
- **THEN** the sync script SHALL run `eas env:create` four times, once per variable
- **THEN** each EAS environment variable SHALL match the value in `.env`

#### Scenario: .env has comments and blank lines
- **WHEN** `.env` contains lines starting with `#` or blank lines
- **THEN** the sync script SHALL skip those lines
- **THEN** only uncommented `export KEY=VALUE` or `KEY=VALUE` lines SHALL be synced

#### Scenario: EAS env var already exists with different value
- **WHEN** an EAS environment variable exists with a stale value
- **THEN** the sync script SHALL overwrite it using the `--force` flag
- **THEN** the EAS environment variable SHALL reflect the current `.env` value

### Requirement: Build script runs sync before eas build
The `build` npm script SHALL run `node scripts/sync-eas-env.js` after sourcing `.env` and before running `eas build`, so that EAS Environment Variables are always up to date when a build starts.

#### Scenario: Developer runs npm run build
- **WHEN** `npm run build` is executed
- **THEN** `.env` SHALL be sourced
- **THEN** `scripts/sync-eas-env.js` SHALL execute and sync all variables to EAS
- **THEN** `eas build` SHALL start with up-to-date environment variables

### Requirement: .env never shipped in build archive
The `.env` file SHALL remain listed in `.gitignore` and SHALL NOT be included in any `.easignore` override. Secrets SHALL only reach EAS Build via encrypted EAS Environment Variables, not as plaintext files in the source archive.

#### Scenario: EAS Build uploads source
- **WHEN** `eas build` uploads the project source
- **THEN** `.env` SHALL NOT be present in the uploaded archive
- **THEN** `app.config.js` SHALL read `process.env` values injected by EAS from encrypted storage
