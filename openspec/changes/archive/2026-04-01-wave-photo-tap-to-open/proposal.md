## Why

Tapping a photo thumbnail in the wave card photo strip does nothing — only tapping the text/info area below opens the wave. Users naturally tap on the most visually prominent element (the photos), and the lack of response feels broken. Long press already works on the thumbnails, so tap should too.

## What Changes

- Add an `onPhotoPress` callback prop to `WavePhotoStrip`, mirroring the existing `onPhotoLongPress` pattern
- Wire the `onPress` handler on the `Pressable` wrapping each thumbnail
- Pass `onPhotoPress={() => onPress(wave)}` from `WaveCard` to `WavePhotoStrip`

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `wave-photo-strip`: Add `onPhotoPress` callback support — thumbnails SHALL respond to tap in addition to long press

## Impact

- **Code**: `src/components/WavePhotoStrip/index.js` — accept and wire `onPhotoPress` prop
- **Code**: `src/components/WaveCard/index.js` — pass `onPhotoPress` to `WavePhotoStrip`
- **UX**: Tapping any photo thumbnail in the wave list now opens that wave
