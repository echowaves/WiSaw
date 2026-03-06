## Why

After upgrading `expo-cached-image` from 54.x to 55.0.0, Android crashes with `java.lang.IllegalArgumentException: URI is not absolute` when loading images. The new version uses `File.downloadFileAsync` (expo-file-system new API) which strictly validates URIs. When `photo.imgUrl` or `photo.thumbUrl` is `undefined`/`null`, template literals coerce them to the string `"undefined"` or `"null"`, which fails the absolute URI check.

## What Changes

- Add a URI validation utility that checks URIs are valid absolute URLs before passing to `CachedImage`
- Guard all `CachedImage` usages in `ImageView`, `PinchableView`, `ExpandableThumb`, `ChatPhoto`, and `ModalInputText` to skip rendering (show placeholder) when URIs are invalid
- Fix template literal coercion of `undefined`/`null` URIs to invalid strings

## Capabilities

### New Capabilities
- `image-uri-validation`: Validate image URIs before passing to CachedImage to prevent crashes from non-absolute URIs

### Modified Capabilities

## Impact

- `src/components/Photo/ImageView.js` — guard CachedImage source URIs
- `src/components/Photo/PinchableView.js` — guard CachedImage source URIs
- `src/components/ExpandableThumb/index.js` — guard CachedImage source URI
- `src/screens/Chat/ChatPhoto.js` — guard CachedImage source URIs
- `src/screens/ModalInputText/index.js` — guard CachedImage source URI
- New utility function for URI validation
