## 1. Subscribe WavesHub to upload bus

- [x] 1.1 In `src/screens/WavesHub/index.js`, add `import { subscribeToUploadComplete } from '../../events/uploadBus'`
- [x] 1.2 Add a `useEffect` in WavesHub that calls `subscribeToUploadComplete` and invokes `fetchCounts()` when `uploadWaveUuid != null`
- [x] 1.3 Ensure the effect returns the unsubscribe function for cleanup on unmount
- [x] 1.4 Include `fetchCounts` in the `useEffect` dependency array
