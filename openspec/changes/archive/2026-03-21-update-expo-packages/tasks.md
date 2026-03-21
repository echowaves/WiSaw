## 1. Update package versions

- [x] 1.1 Update all 21 Expo package versions in `package.json` to their SDK 55-compatible exact versions:
  - expo-audio: 55.0.9
  - expo-background-task: 55.0.10
  - expo-build-properties: 55.0.10
  - expo-constants: 55.0.9
  - expo-crypto: 55.0.10
  - expo-file-system: 55.0.11
  - expo-haptics: 55.0.9
  - expo-image-manipulator: 55.0.11
  - expo-image-picker: 55.0.13
  - expo-linking: 55.0.8
  - expo-location: 55.1.4
  - expo-media-library: 55.0.10
  - expo-notifications: 55.0.13
  - expo-router: 55.0.7
  - expo-screen-orientation: 55.0.9
  - expo-secure-store: 55.0.9
  - expo-splash-screen: 55.0.12
  - expo-task-manager: 55.0.10
  - expo-updates: 55.0.15
  - expo-video: 55.0.11
  - expo-video-thumbnails: 55.0.11

## 2. Install and verify

- [x] 2.1 Run `npm install` to regenerate `package-lock.json`
- [x] 2.2 Run Codacy trivy security scan on updated dependencies
- [x] 2.3 Verify zero lint/compile errors
