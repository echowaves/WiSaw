## ADDED Requirements

### Requirement: Vite configuration file exists
The project SHALL have a `vite.config.js` at the project root that configures `@expo/vite-plugin` as the Vite plugin for Expo web builds.

#### Scenario: Vite config uses Expo plugin
- **WHEN** the `vite.config.js` file is read
- **THEN** it SHALL import and use `expoVitePlugin` from `@expo/vite-plugin` in the plugins array

### Requirement: Vite dev dependencies installed
The project SHALL include `vite` and `@expo/vite-plugin` as dev dependencies in `package.json` with exact version numbers (no ^ or ~ prefixes).

#### Scenario: Dependencies present in package.json
- **WHEN** `package.json` devDependencies are inspected
- **THEN** `vite` and `@expo/vite-plugin` SHALL be listed with exact version numbers

### Requirement: Web dev server uses Vite
The web development server SHALL use Vite instead of Metro when running `npx expo start --web`.

#### Scenario: Starting web dev server
- **WHEN** a developer runs `npx expo start --web`
- **THEN** the Vite dev server SHALL start and serve the web application

#### Scenario: Hot Module Replacement works
- **WHEN** a developer modifies a source file while the Vite web dev server is running
- **THEN** the change SHALL be reflected in the browser without a full page reload

### Requirement: Web production build uses Vite
The web production build SHALL use Vite instead of Metro when exporting for the web platform.

#### Scenario: Exporting web build
- **WHEN** a developer runs the web export command
- **THEN** Vite SHALL produce the production web bundle in the output directory

#### Scenario: Production bundle is optimized
- **WHEN** the web production build completes
- **THEN** the output SHALL be tree-shaken and minified

### Requirement: Expo Router file-based routing works under Vite
Expo Router's file-based routing SHALL function correctly when bundled by Vite, including all existing routes.

#### Scenario: App routes resolve correctly
- **WHEN** the web application is loaded in a browser
- **THEN** all file-based routes defined in the `app/` directory SHALL be navigable

#### Scenario: Deep link URLs resolve to correct routes
- **WHEN** a user navigates to a deep link URL (e.g., `/photos/:id`)
- **THEN** the Vite-bundled web app SHALL render the correct screen

### Requirement: Native builds remain on Metro
iOS and Android builds SHALL continue to use Metro as their bundler, unaffected by the Vite web configuration.

#### Scenario: iOS build uses Metro
- **WHEN** a developer runs `expo run:ios`
- **THEN** Metro SHALL bundle the iOS application (Vite is not involved)

#### Scenario: Android build uses Metro
- **WHEN** a developer runs `expo run:android`
- **THEN** Metro SHALL bundle the Android application (Vite is not involved)

### Requirement: React Native Web compatibility
All `react-native` imports SHALL resolve to `react-native-web` equivalents in the Vite web build, maintaining existing component behavior.

#### Scenario: React Native components render on web
- **WHEN** the web application renders components using React Native APIs (View, Text, Image, etc.)
- **THEN** they SHALL render correctly using react-native-web implementations
