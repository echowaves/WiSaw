## 1. State Module Changes

- [x] 1.1 Import `useAtom`, `useEffect` from 'jotai' in src/state.js
- [x] 1.2 Import `NetInfo` from '@react-native-community/netinfo' in src/state.js
- [x] 1.3 Create `useNetInfoSubscription()` hook that subscribes to NetInfo changes and updates the `netAvailable` atom
- [x] 1.4 Verify no syntax errors in src/state.js after changes

## 2. Upload Context Changes

- [x] 2.1 Import `useNetInfoSubscription` from '../state' in src/contexts/UploadContext.js
- [x] 2.2 Call `useNetInfoSubscription()` inside `UploadProvider` component
- [x] 2.3 Verify no syntax errors in src/contexts/UploadContext.js after changes

## 3. Testing

- [ ] 3.1 Test: Photo upload starts automatically when network becomes available after being unavailable
- [ ] 3.2 Test: `netAvailable` atom updates within milliseconds of network change
- [ ] 3.3 Test: No duplicate subscriptions when UploadContext re-renders
- [ ] 3.4 Test: Pull-to-refresh still works correctly with the fix
- [ ] 3.5 Test: Upload queue clears properly on app restart

## 4. Documentation

- [ ] 4.1 Update CHANGELOG.md if applicable
- [ ] 4.2 Verify no breaking changes introduced
