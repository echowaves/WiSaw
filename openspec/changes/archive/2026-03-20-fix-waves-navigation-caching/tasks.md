## 1. Route Structure Setup

- [x] 1.1 Create `app/(drawer)/waves/_layout.tsx` with a Stack navigator (mirroring the `(tabs)/_layout.tsx` pattern) containing screen entries for `index`, `[waveUuid]`, and `photo-selection`
- [x] 1.2 Move `app/(drawer)/waves.tsx` to `app/(drawer)/waves/index.tsx`, changing the back button from `router.replace('/')` to `router.back()`
- [x] 1.3 Move `app/(drawer)/wave-detail.tsx` to `app/(drawer)/waves/[waveUuid].tsx`, updating the `useLocalSearchParams` to extract `waveUuid` from the dynamic route segment
- [x] 1.4 Move `app/(drawer)/photo-selection.tsx` to `app/(drawer)/waves/photo-selection.tsx` (no logic changes needed)
- [x] 1.5 Delete `app/(drawer)/waves-hub.tsx` (dead code)

## 2. Drawer Layout Cleanup

- [x] 2.1 Remove the hidden `Drawer.Screen` entries for `waves-hub`, `wave-detail`, and `photo-selection` from `app/(drawer)/_layout.tsx`
- [x] 2.2 Verify the existing `waves` `Drawer.Screen` entry correctly points to the new `waves/` directory group (Expo Router should handle this automatically)

## 3. Navigation Call Updates

- [x] 3.1 Update `handleWavePress` in `src/screens/WavesHub/index.js` to navigate to `/waves/${wave.waveUuid}` with `waveName` as a search param instead of `/wave-detail`
- [x] 3.2 Update the photo-selection navigation in `src/screens/WaveDetail/index.js` to push to `/waves/photo-selection` instead of `/photo-selection`

## 4. WaveDetail Data Loading Fix

- [x] 4.1 In `src/screens/WaveDetail/index.js`, add `waveUuid` to the dependency array of the initial `useEffect` that calls `loadPhotos` (defensive correctness even though dynamic routes create fresh instances)

## 5. Verification

- [x] 5.1 Test navigation: Drawer → Waves list → Wave A detail → back returns to Waves list
- [x] 5.2 Test caching: Open Wave A → back → open Wave B → verify Wave B's photos are shown
- [x] 5.3 Test photo selection flow: Wave detail → Add photos → back returns to Wave detail
- [x] 5.4 Test system gesture back (swipe) behaves the same as header back button
