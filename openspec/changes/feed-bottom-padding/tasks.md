## 1. PhotosListMasonry — add contentPaddingBottom prop

- [x] 1.1 Add `contentPaddingBottom` to component props with default fallback to `FOOTER_HEIGHT + 20`
- [x] 1.2 Use `contentPaddingBottom` in `contentContainerStyle` instead of hardcoded `FOOTER_HEIGHT + 20`

## 2. PhotosList — pass FAB-aware padding

- [x] 2.1 Compute `contentPaddingBottom` as `FOOTER_HEIGHT + 56 + 32` (footer + FAB size + breathing room) in PhotosList
- [x] 2.2 Pass `contentPaddingBottom` to `PhotosListMasonry`

## 3. Verify no regression

- [x] 3.1 Confirm WaveDetail and FriendDetail still render with default padding (no prop passed)
- [x] 3.2 Test feed scroll-to-bottom shows last photos clear of both FABs
