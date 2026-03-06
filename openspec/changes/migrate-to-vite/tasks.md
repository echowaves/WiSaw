> **BLOCKED (2026-03-05):** `@expo/vite-plugin` does not exist on npm. Expo SDK 55's `web.bundler` config only accepts `'webpack' | 'metro'` — no Vite option. Waiting for a future Expo SDK release with Vite support.

## 1. Install Dependencies

- [ ] 1.1 Check npm registry for latest `@expo/vite-plugin` version compatible with Expo SDK 55
- [ ] 1.2 Install `vite` as a dev dependency with exact version (`npm install --save-exact --save-dev vite`)
- [ ] 1.3 Install `@expo/vite-plugin` as a dev dependency with exact version (`npm install --save-exact --save-dev @expo/vite-plugin`)
- [ ] 1.4 Verify both dependencies appear in `package.json` devDependencies with exact versions (no ^ or ~)

## 2. Create Vite Configuration

- [ ] 2.1 Create `vite.config.js` at project root with `@expo/vite-plugin` configured
- [ ] 2.2 Verify the config imports and uses `expoVitePlugin` in the plugins array

## 3. Update App Configuration

- [ ] 3.1 Update `app.config.js` to add `web.bundler: "vite"` in the expo web config section

## 4. Verify Web Dev Server

- [ ] 4.1 Run `npx expo start --web` and verify Vite dev server starts successfully
- [ ] 4.2 Verify the web app loads in the browser with Vite serving it
- [ ] 4.3 Test HMR by editing a source file and confirming changes appear without full reload

## 5. Verify Web Production Build

- [ ] 5.1 Run the web export command and verify Vite produces the production bundle
- [ ] 5.2 Verify the output is tree-shaken and minified
- [ ] 5.3 Check the output directory structure for correct static assets

## 6. Verify Existing Web Features

- [ ] 6.1 Verify Expo Router file-based routing works (navigate between screens)
- [ ] 6.2 Verify deep link URLs resolve to correct routes (e.g., `/photos/:id`)
- [ ] 6.3 Verify React Native Web components render correctly (View, Text, Image, etc.)
- [ ] 6.4 Verify content sharing URLs work on web

## 7. Verify Native Builds Unaffected

- [ ] 7.1 Run `expo run:ios` and verify Metro bundles the iOS app normally
- [ ] 7.2 Run `expo run:android` and verify Metro bundles the Android app normally

## 8. Lint and Static Analysis

- [ ] 8.1 Run `npx ts-standard` and verify no new lint errors from config changes
- [ ] 8.2 Run Codacy analysis on new/modified files
