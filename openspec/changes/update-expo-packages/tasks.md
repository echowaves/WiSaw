## 1. Remove Unused Dependency

- [x] 1.1 Run `npm uninstall expo-image` to remove the unused package from package.json and package-lock.json

## 2. Update Packages

- [x] 2.1 Run `npm install expo-cached-image@latest --save-exact` to update expo-cached-image
- [x] 2.2 Run `npm install expo-storage@latest --save-exact` to update expo-storage
- [x] 2.3 Run `npm install expo-masonry-layout@latest --save-exact` to update expo-masonry-layout

## 3. Verify

- [x] 3.1 Confirm expo-image is no longer in package.json
- [x] 3.2 Confirm all three updated packages have new exact versions in package.json (no ^ or ~ prefix)
- [x] 3.3 Verify the app compiles without errors by running `npx expo start` and checking for import/resolution issues
- [x] 3.4 Check if any API changes in updated packages require code modifications in consuming files
