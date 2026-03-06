## 1. Downgrade Incompatible Packages

- [ ] 1.1 Downgrade @react-native-async-storage/async-storage from 3.0.1 to 2.2.0
- [ ] 1.2 Downgrade @react-native-community/netinfo from 12.0.1 to 11.5.2
- [ ] 1.3 Downgrade react-native-get-random-values from 2.0.0 to 1.11.0

## 2. Verify Compatibility

- [ ] 2.1 Run `npx expo install --check` and confirm no version mismatch warnings for downgraded packages
- [ ] 2.2 Verify package.json uses exact versions (no ^ or ~ prefixes) for all three packages

## 3. Build Verification

- [ ] 3.1 Run Metro bundler to confirm JS bundle compiles without errors
- [ ] 3.2 Run EAS Android build and confirm Gradle resolves all Maven dependencies
