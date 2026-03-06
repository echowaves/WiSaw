## Context

WiSaw is a React Native Expo app (SDK 55.0.5, React 19.2.0, RN 0.83.2) targeting iOS, Android, and Web. The web platform currently uses Metro as its bundler via `@expo/metro-runtime` (55.0.6). Metro is primarily a React Native bundler — it works for web but lacks the optimizations that web-native bundlers provide (fast HMR, dependency pre-bundling, efficient tree-shaking).

Expo SDK 55 introduced experimental support for Vite as an alternative web bundler through `@expo/vite-plugin`. This allows using Vite for web while keeping Metro for native platforms, giving the best of both worlds.

Current build configuration:
- `metro.config.js` — CSS support, minifier config, CJS source ext, platform resolver
- `babel.config.js` — babel-preset-expo + reanimated plugin
- `app.config.js` — standard Expo config with no web bundler override (defaults to Metro)
- Entry point: `expo-router/entry` (declared in package.json `"main"`)

## Goals / Non-Goals

**Goals:**
- Replace Metro with Vite as the web platform bundler for both dev server and production builds
- Achieve faster web dev server startup and HMR via Vite's native ESM dev server
- Produce smaller, better tree-shaken web production bundles
- Maintain identical behavior for iOS and Android builds (Metro unchanged)
- Ensure all existing web features work under Vite: Expo Router file-based routing, deep linking, content sharing URLs, web favicon/metadata

**Non-Goals:**
- Modifying any application source code (components, screens, hooks, state management)
- Changing the native build pipeline or Metro configuration for iOS/Android
- Migrating away from Babel (Vite plugin handles Babel integration via `@expo/vite-plugin`)
- Optimizing native bundle sizes or native build performance
- Adding new web-specific features beyond what already exists

## Decisions

### Decision 1: Use `@expo/vite-plugin` as the integration layer

**Choice:** Use Expo's official `@expo/vite-plugin` rather than a manual Vite + React Native Web setup.

**Rationale:** The plugin handles React Native Web module aliasing, Expo module resolution, Expo Router integration, and platform-specific file resolution (`.web.js` extensions) automatically. A manual setup would require replicating all of this and would break on Expo SDK upgrades.

**Alternatives considered:**
- Manual Vite config with `vite-plugin-react` + custom aliases: Too fragile, doesn't handle Expo-specific transforms
- `@vxrn/vite-native-swc`: Third-party, not designed for Expo ecosystem

### Decision 2: Set `web.bundler: "metro"` in app.config.js initially, add Vite alongside

**Choice:** Add `web.bundler` configuration in `app.config.js` and create `vite.config.js`. Expo's tooling will detect the Vite config and use it for web when configured.

**Rationale:** Expo SDK 55 supports declaring the web bundler in the config. Setting it to use Vite tells `expo start --web` and `expo export --platform web` to use Vite instead of Metro.

### Decision 3: Keep `metro.config.js` unchanged

**Choice:** Do not modify `metro.config.js` at all.

**Rationale:** Metro is still used for iOS and Android builds. The current config has CSS support, minifier settings, and CJS source extensions that are needed for native builds. Vite ignores `metro.config.js` entirely — there is no conflict.

### Decision 4: Keep `@expo/metro-runtime` as a dependency

**Choice:** Do not remove `@expo/metro-runtime` from dependencies.

**Rationale:** Some Expo modules may still import from `@expo/metro-runtime` internally. Removing it could break native builds. It has no cost when Vite is the web bundler since Vite won't bundle it for web.

### Decision 5: Vite config structure

**Choice:** Create a minimal `vite.config.js` at project root using `@expo/vite-plugin`'s `expoVitePlugin()` with default settings.

**Rationale:** The plugin handles all Expo-specific configuration. Starting minimal and adding customization only if needed follows the principle of least complexity. The plugin automatically handles:
- React Native Web aliases
- Expo Router file-based routing
- Platform-specific file resolution
- Babel transforms via babel-preset-expo

## Risks / Trade-offs

- **[Experimental API]** `@expo/vite-plugin` is experimental in SDK 55 → Mitigation: Pin exact versions, test thoroughly before deploying, keep Metro as a fallback by simply removing `web.bundler` config
- **[Module compatibility]** Some React Native libraries may not work correctly under Vite's ESM resolution → Mitigation: Test all existing features on web after migration; use Vite's `optimizeDeps` config to pre-bundle problematic CJS dependencies
- **[Build output differences]** Vite's output structure differs from Metro's web export → Mitigation: Verify static hosting deployment still works, check `dist/` output structure vs previous `dist/` output
- **[Reanimated plugin]** react-native-reanimated Babel plugin must work under Vite → Mitigation: `@expo/vite-plugin` uses babel-preset-expo which includes reanimated support; verify animations work on web

## Migration Plan

1. Install `vite` and `@expo/vite-plugin` as dev dependencies (exact versions)
2. Create `vite.config.js` at project root
3. Update `app.config.js` to set `web.bundler: "vite"` (or let Expo auto-detect from vite.config.js presence)
4. Test web dev server: `npx expo start --web`
5. Test web production build: `npx expo export --platform web`
6. Verify all web features: routing, deep links, sharing URLs
7. **Rollback:** Delete `vite.config.js`, remove `web.bundler` from app.config.js, uninstall vite deps → Metro resumes as web bundler immediately

## Open Questions

- What is the latest stable version of `@expo/vite-plugin` compatible with Expo SDK 55.0.5? Need to check npm registry before installing.
- Does `expo export --platform web` with Vite produce output in `dist/` (Vite default) or `web-build/` (Metro default)? This affects deployment scripts.
