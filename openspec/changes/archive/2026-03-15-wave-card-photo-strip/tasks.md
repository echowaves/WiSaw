## 1. Switch WavesHub to single-column layout

- [x] 1.1 Remove `numColumns={2}` from the FlatList in `src/screens/WavesHub/index.js`

## 2. Rework WaveCard to horizontal photo strip

- [x] 2.1 Change `collageContainer` style: remove `flexWrap: 'wrap'`, change `aspectRatio` from `1` to `5`
- [x] 2.2 Change `collageImage` style from `width: '50%', height: '50%'` to `flex: 1, height: '100%'`
- [x] 2.3 Change `placeholder` style `aspectRatio` from `1` to `5`
