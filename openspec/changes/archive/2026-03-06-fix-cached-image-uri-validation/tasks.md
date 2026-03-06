## 1. Create Utility

- [x] 1.1 Create `src/utils/isValidImageUri.js` with a function that returns `true` only if the value is a non-empty string starting with `http://` or `https://`

## 2. Guard CachedImage Usages

- [x] 2.1 Guard `CachedImage` in `src/components/Photo/ImageView.js` — skip rendering when URI is invalid
- [x] 2.2 Guard `CachedImage` in `src/components/Photo/PinchableView.js` — skip rendering when URI is invalid
- [x] 2.3 Guard `CachedImage` in `src/components/ExpandableThumb/index.js` — skip rendering when URI is invalid
- [x] 2.4 Guard `CachedImage` in `src/screens/Chat/ChatPhoto.js` — skip rendering when URI is invalid
- [x] 2.5 Guard `CachedImage` in `src/screens/ModalInputText/index.js` — skip rendering when URI is invalid

## 3. Verify

- [x] 3.1 Run Metro bundler to confirm JS bundle compiles without errors
