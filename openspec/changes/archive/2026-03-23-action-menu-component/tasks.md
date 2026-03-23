## 1. ActionMenu Component

- [x] 1.1 Create `src/components/ActionMenu/index.js` — implement the reusable ActionMenu component with Modal, overlay dismiss, themed center card, item rows (icon + label), separator, checked state, destructive styling, and disabled support

## 2. Migrate Waves Header Kebab Menu

- [x] 2.1 Replace `ActionSheetIOS` / `Alert.alert` / `Platform` branching in `app/(drawer)/waves/index.tsx` with `ActionMenu` — add `menuVisible` state, build items array with icons for Create New Wave (`plus-circle-outline`), Auto Group (`view-grid-plus-outline`), separator, and four sort options (`sort-descending`/`sort-ascending`) with `checked` on the active one

## 3. Migrate Wave Detail Header Menu

- [x] 3.1 Replace `ActionSheetIOS` / `Alert.alert` / `Platform` branching in `src/screens/WaveDetail/index.js` with `ActionMenu` — add `menuVisible` state, build items array with icons for Rename (`pencil-outline`), Edit Description (`text-box-edit-outline`), Merge (`call-merge`), separator, Delete Wave (`trash-can-outline`, destructive)

## 4. Migrate Wave Card Long-Press Menu

- [x] 4.1 Replace `ActionSheetIOS` / `Alert.alert` / `Platform` branching in `src/screens/WavesHub/index.js` with `ActionMenu` — add `contextMenuWave` state to track which wave's menu is open, build items array conditionally based on ownership with icons for Rename, Edit Description, Merge, separator, Delete Wave (destructive)
