## 1. WavePhotoStrip — Add onPhotoPress support

- [x] 1.1 In `src/components/WavePhotoStrip/index.js`, add `onPhotoPress` to the component's props
- [x] 1.2 Update the `Pressable` wrapping condition to render when either `onPhotoPress` or `onPhotoLongPress` is provided
- [x] 1.3 Wire `onPress={() => onPhotoPress(item)}` on the `Pressable` (when `onPhotoPress` is provided)

## 2. WaveCard — Pass onPhotoPress to WavePhotoStrip

- [x] 2.1 In `src/components/WaveCard/index.js`, pass `onPhotoPress={() => onPress(wave)}` to `WavePhotoStrip`
