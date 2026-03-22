## 1. Create shared InteractionHintBanner component

- [x] 1.1 Create `src/components/ui/InteractionHintBanner.js` — self-contained component with internal `useState` for visibility, `useEffect` that checks three SecureStore keys (`interactionHintShown`, `photoActionsHintShown`, `waveContextMenuTooltipShown`) via Promise.all, `useCallback` dismiss handler that hides banner and writes `interactionHintShown`, JSX with bulb icon + text + ✕ close button, and embedded StyleSheet. Accepts `hasContent` boolean prop.

## 2. Replace inline hint in PhotosList

- [x] 2.1 In `src/screens/PhotosList/index.js` — remove `showPhotoHint` state, `checkHint` useEffect, `dismissPhotoHint` callback, inline banner JSX, and `photoHintBanner`/`photoHintContent`/`photoHintText` styles. Import `InteractionHintBanner` and render `<InteractionHintBanner hasContent={photosList?.length > 0} />` in the same position. Remove the Ionicons import if no longer used elsewhere in the file.

## 3. Replace inline tooltip in WavesHub

- [x] 3.1 In `src/screens/WavesHub/index.js` — remove `showTooltip` state, `checkTooltip` useEffect, `dismissTooltip` callback, inline tooltip JSX, and `tooltipContainer`/`tooltipText` styles. Import `InteractionHintBanner` and render `<InteractionHintBanner hasContent={waves.length > 0} />` in the same position. Remove the Ionicons import if no longer used elsewhere in the file.

## 4. Add hint banner to WaveDetail

- [x] 4.1 In `src/screens/WaveDetail/index.js` — import `InteractionHintBanner` and render `<InteractionHintBanner hasContent={photos?.length > 0} />` above the photo masonry grid.
