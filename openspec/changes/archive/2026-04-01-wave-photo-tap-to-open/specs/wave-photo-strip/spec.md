## MODIFIED Requirements

### Requirement: Wave photo strip supports photo long press
The `WavePhotoStrip` component SHALL accept an optional `onPhotoLongPress` callback prop and an optional `onPhotoPress` callback prop. When either is provided, each thumbnail SHALL be wrapped in a `Pressable`. The `Pressable` SHALL wire `onPress` to `onPhotoPress(item)` (if provided) and `onLongPress` to `onPhotoLongPress(item)` (if provided), where `item` is the photo object. When neither callback is provided, thumbnails SHALL render without a `Pressable` wrapper.

#### Scenario: Tap on thumbnail with press handler
- **WHEN** `onPhotoPress` is provided and the user taps a thumbnail
- **THEN** `onPhotoPress` SHALL be called with the photo object

#### Scenario: Long press on thumbnail with handler
- **WHEN** `onPhotoLongPress` is provided and the user long-presses a thumbnail
- **THEN** `onPhotoLongPress` SHALL be called with the photo object

#### Scenario: Both handlers provided
- **WHEN** both `onPhotoPress` and `onPhotoLongPress` are provided
- **THEN** tap SHALL call `onPhotoPress` and long press SHALL call `onPhotoLongPress`

#### Scenario: No handlers means no Pressable wrapper
- **WHEN** neither `onPhotoPress` nor `onPhotoLongPress` is provided
- **THEN** thumbnails SHALL render as plain `CachedImage` elements without `Pressable` wrapping
