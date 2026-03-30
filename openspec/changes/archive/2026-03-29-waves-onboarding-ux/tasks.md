## 1. Global State Foundation

- [x] 1.1 Add `wavesCount` and `ungroupedPhotosCount` atoms (default `null`) to `src/state.js`
- [x] 1.2 Add `getWavesCount` query function to `src/screens/Waves/reducer.js`

## 2. WaveHeaderIcon State Awareness

- [x] 2.1 Update WaveHeaderIcon to read `wavesCount`, `ungroupedPhotosCount`, and `uuid` atoms — set icon color to MAIN_COLOR when waves exist or ungrouped > 0, TEXT_SECONDARY otherwise
- [x] 2.2 Add red dot badge to WaveHeaderIcon when `ungroupedPhotosCount > 0`, matching IdentityHeaderIcon badge style
- [x] 2.3 Add eager fetch in WaveHeaderIcon — when `wavesCount` is `null` and `uuid` is non-empty, fetch both counts in parallel and set atoms

## 3. Waves Screen Atom Integration

- [x] 3.1 Replace local `useState(0)` for ungrouped count in `app/(drawer)/waves/index.tsx` with the global `ungroupedPhotosCount` atom — read and write via `useAtom`
- [x] 3.2 Add `getWavesCount` fetch to the `useFocusEffect` in `waves/index.tsx` — write result to `wavesCount` atom alongside existing ungrouped count fetch

## 4. Local Atom Updates at Mutation Sites

- [x] 4.1 WavesHub `handleCreateWave` — increment `wavesCount` atom by 1 after successful wave creation
- [x] 4.2 WavesHub `handleDeleteWave` — decrement `wavesCount` by 1 and increment `ungroupedPhotosCount` by `wave.photosCount` after successful deletion
- [x] 4.3 WavesHub `handleAutoGroup` — set `ungroupedPhotosCount` to 0 and increment `wavesCount` by `totalWavesCreated` after auto-group completes
- [x] 4.4 PhotosList upload subscriber — increment `ungroupedPhotosCount` by 1 when upload completes with no `waveUuid`
- [x] 4.5 `usePhotoActions` — decrement `ungroupedPhotosCount` by 1 (floored at 0) when `addPhotoToWave` succeeds

## 5. Waves Explainer View

- [x] 5.1 Create `src/components/WavesExplainerView/index.js` — multi-card educational component following PrivacyExplainerView pattern, accepting `ungroupedCount`, `onAutoGroup`, and `onNavigateHome` props
- [x] 5.2 Implement two content variants in WavesExplainerView: "has ungrouped photos" (cards + Auto Group CTA) and "no photos" (cards + Take a Photo CTA)
- [x] 5.3 Replace the empty-state `EmptyStateCard` in WavesHub with `WavesExplainerView` when waves list is empty and no search is active
