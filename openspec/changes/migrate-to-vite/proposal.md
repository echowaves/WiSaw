## Why

Expo SDK 55 introduced experimental support for Vite as an alternative web bundler to Metro. Metro is optimized for native mobile builds but produces slower web dev server startup, slower HMR, and larger unoptimized web bundles compared to Vite. Migrating the web build pipeline to Vite will significantly improve web development speed, reduce web bundle sizes through better tree-shaking, and leverage Vite's mature web ecosystem (plugins, optimized dependency pre-bundling). Native iOS and Android builds will continue using Metro — this change only affects the web platform.

## What Changes

- Add `@expo/vite-plugin` and `vite` as dev dependencies to enable Expo's Vite integration
- Create a `vite.config.js` with Expo plugin configuration, replacing Metro for web builds
- Update `package.json` scripts to use Vite for web dev server (`expo start --web` will use Vite automatically when configured)
- Remove or scope `metro.config.js` web-specific settings (Metro remains for iOS/Android)
- Update `app.config.js` web bundler configuration to declare Vite as the web bundler
- Ensure all `react-native-web` polyfills and aliases resolve correctly under Vite
- Verify existing web-dependent features (deep linking, sharing URLs, web favicon) work under Vite

## Capabilities

### New Capabilities

- `vite-web-bundling`: Configuration and integration of Vite as the web platform bundler, including dev server, production builds, and compatibility with Expo Router file-based routing

### Modified Capabilities

_None — this is a build tooling change. No user-facing feature requirements change. Deep linking, content sharing, and all other capabilities retain their existing behavior._

## Impact

- **Build tooling**: Metro continues for iOS/Android; Vite replaces Metro for web only
- **Dependencies**: New dev deps `vite` and `@expo/vite-plugin`; `@expo/metro-runtime` may need web-specific exclusion
- **Configuration files**: `vite.config.js` (new), `app.config.js` (web bundler setting), `metro.config.js` (scoped to native), `package.json` (scripts)
- **CI/CD**: Web build commands may change from `npx expo export --platform web` to Vite-based export
- **No code changes**: Application source code (components, screens, hooks, state) should not require changes
- **Risk**: Expo's Vite support is experimental in SDK 55 — may encounter edge cases with certain Expo modules or React Native Web compatibility
