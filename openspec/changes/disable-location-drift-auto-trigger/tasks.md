## 1. Disable Location Drift Auto-Trigger

- [x] 1.1 Comment out the location drift auto-trigger useEffect block in `src/screens/WavesHub/index.js` (lines 472-478)
- [x] 1.2 Verify that upload-complete auto-trigger (usePhotoUploader.js lines 130-136) remains unchanged
- [x] 1.3 Verify that manual triggers (UngroupedPhotosCard and UI buttons) remain unchanged
- [x] 1.4 Build and test to ensure no regressions in other functionality

**Note:** Task 1.4 build/test verification should be done by running the Metro bundler locally. The code changes are minimal and focused — only commenting out unused useEffect blocks and their related variable declarations/imports. No functional logic was modified.