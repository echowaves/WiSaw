## 1. Add Upload Progress to WavesHub

- [x] 1.1 In `src/screens/WavesHub/index.js`, add `useContext` to React imports
- [x] 1.2 Add `UploadContext` import from `../../contexts/UploadContext`
- [x] 1.3 Add `usePendingAnimation` import from `../PhotosList/hooks/usePendingAnimation`
- [x] 1.4 Add `PendingPhotosBanner` import from `../PhotosList/components/PendingPhotosBanner`
- [x] 1.5 After existing state/hooks declarations, add `UploadContext` consumption: `const { pendingPhotos, isUploading, clearPendingQueue } = useContext(UploadContext)`
- [x] 1.6 Add netAvailable and toastTopOffset: `const [netAvailable] = useAtom(STATE.netAvailable)`, `const toastTopOffset = insets.top + 10`
- [x] 1.7 Add animation hook call: `const { pendingPhotosAnimation, uploadIconAnimation } = usePendingAnimation({ pendingPhotosCount: pendingPhotos.length, netAvailable })`
- [x] 1.8 In JSX, add `<PendingPhotosBanner>` between `AppHeader` and `InteractionHintBanner`, passing all required props (theme, pendingPhotos, netAvailable, isUploading, clearPendingQueue, toastTopOffset, pendingPhotosAnimation, uploadIconAnimation)

## 2. Standardize WaveDetail Animation Hook Usage

- [x] 2.1 In `src/screens/WaveDetail/index.js`, locate inline animation refs: `const pendingPhotosAnimation = useRef(new Animated.Value(0)).current` and `const uploadIconAnimation = useRef(new Animated.Value(1)).current`
- [x] 2.2 Add `usePendingAnimation` import from `../PhotosList/hooks/usePendingAnimation`
- [x] 2.3 Replace inline refs with hook call: `const { pendingPhotosAnimation, uploadIconAnimation } = usePendingAnimation({ pendingPhotosCount: pendingPhotos.length, netAvailable })`
- [x] 2.4 Add `netAvailable` variable: `const [netAvailable] = useAtom(STATE.netAvailable)` (verify it's already available via UploadContext usage)
- [x] 2.5 Verify the existing `<PendingPhotosBanner>` JSX in JSX still receives `pendingPhotosAnimation` and `uploadIconAnimation` props (no changes needed to the banner JSX itself)

## 3. Verification

- [x] 3.1 Run Codacy CLI analysis on modified files to check for lint/syntax errors
- [x] 3.2 Test WavesHub: take photos from WavesHub, verify banner appears with count and progress bar
- [x] 3.3 Test WaveDetail: verify animations work identically to PhotosList (spring in, timing out)
- [x] 3.4 Verify banner dismisses automatically when pendingPhotos.length === 0
- [x] 3.5 Verify long-press clear action works in WavesHub and WaveDetail
