## 1. Pass upload target status to footer

- [x] 1.1 Add `hasUploadTarget` prop to `PhotosListFooter` component signature
- [x] 1.2 Pass `!!uploadTargetWave` as `hasUploadTarget` to all `PhotosListFooter` usages in `PhotosList/index.js`

## 2. Add badge to menu button

- [x] 2.1 Wrap the navicon `FontAwesome` icon in a `View` and add a conditional red dot badge when `hasUploadTarget` is true
