## 1. Remove Unused Dependency

- [ ] 1.1 Run `npm uninstall expo-image` to remove the unused package from package.json and package-lock.json

## 2. Update Packages

- [ ] 2.1 Run `npm install expo-cached-image@latest --save-exact` to update expo-cached-image
- [ ] 2.2 Run `npm install expo-storage@latest --save-exact` to update expo-storage
- [ ] 2.3 Run `npm install expo-masonry-layout@latest --save-exact` to update expo-masonry-layout

## 3. Verify

- [ ] 3.1 Confirm expo-image is no longer in package.json
- [ ] 3.2 Confirm all three updated packages have new exact versions in package.json (no ^ or ~ prefix)
- [ ] 3.3 Verify the app compiles without errors by running `npx expo start` and checking for import/resolution issues
- [ ] 3.4 Check if any API changes in updated packages require code modifications in consuming files
