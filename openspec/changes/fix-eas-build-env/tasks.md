## 1. Create sync script

- [x] 1.1 Create `scripts/sync-eas-env.js` that reads `.env`, parses `export KEY=VALUE` and `KEY=VALUE` lines (skipping comments and blanks), and runs `eas env:create --name <KEY> --value <VALUE> --environment production --visibility plain-text --force` for each variable
- [x] 1.2 Handle quoted values (single and double quotes) in the parser
- [x] 1.3 Log each synced variable name (not value) to stdout for confirmation

## 2. Update build script

- [x] 2.1 Update the `build` script in `package.json` from `source .env && eas build` to `source .env && node scripts/sync-eas-env.js && eas build`

## 3. API configuration diagnostic

- [x] 3.1 Import `Alert` from `react-native` in `src/consts.js`
- [x] 3.2 After the `API_URI` and `API_KEY` destructuring from `Constants.expoConfig.extra`, add a check: if either is `undefined` or empty, log `console.error('API configuration missing', { API_URI, API_KEY })` and call `Alert.alert` with an informative message

## 4. Verification

- [x] 4.1 Run `npm run build` and confirm the sync script outputs each variable name, then `eas build` starts
- [x] 4.2 Verify via `eas env:list` that all four variables (`API_URI`, `API_KEY`, `REALTIME_API_URI`, `PRIVATE_IMG_HOST`) are present and current
