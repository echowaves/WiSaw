## 1. Fix usePhotoActions imports

- [x] 1.1 In `src/hooks/usePhotoActions.js`, replace the two `showToast.js` import lines with a single `import showToast, { showInfoToast, showSuccessToast, showErrorToast } from '../utils/showToast'`
- [x] 1.2 Remove the unused `Alert` import from `react-native` and fix the two indentation errors flagged by ts-standard (~lines 97/99)

## 2. Verification

- [x] 2.1 Run `npx ts-standard src/hooks/usePhotoActions.js` — confirm zero errors
- [x] 2.2 Verify in the expanded photo view: tap Wave on a non-own photo → info toast "Only your own photos can be added to waves", no crash, no wave selector
- [x] 2.3 Verify in the preview overlay (long-press a non-own photo): same toast, no crash
- [x] 2.4 Verify add-to-wave and remove-from-wave success toasts render on own photos
- [x] 2.5 Run `npm run lint` project-wide to surface any other files with the same missing-import pattern (report if found; do not fix out-of-scope files without approval)
  - Found: `src/components/ShareOptionsModal.js:47` and `src/components/WaveShareModal.js:90` — same missing `showToast` default import (latent crashes)
