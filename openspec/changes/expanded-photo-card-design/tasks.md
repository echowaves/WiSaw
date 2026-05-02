## 1. Outer Card Wrapper & Render Order

- [x] 1.1 In `src/components/Photo/index.js`, add an `expandedCardContainer` style to `createStyles` with `borderRadius: 20`, `overflow: 'hidden'`, themed `CARD_BACKGROUND`, `CARD_BORDER`, shadow, and `marginVertical: 8`, `marginHorizontal: 8`
- [x] 1.2 Wrap the return JSX in a conditional outer card `View` when `embedded === true` using the new `expandedCardContainer` style
- [x] 1.3 Move `{renderActionCard()}` from above `{renderPhotoRow()}` to below it (new order: close button → loading → photo → actions → info → comments → add comment → AI)

## 2. Flatten Inner Sections for Embedded Mode

- [x] 2.1 Create embedded-mode style variants for `photoInfoCard` that remove `marginHorizontal`, `borderRadius`, `borderWidth`, and `shadow` — use `paddingHorizontal` and optional top border divider instead
- [x] 2.2 Create embedded-mode style variants for `commentsCard` that remove card chrome — flat section with padding
- [x] 2.3 Create embedded-mode style variants for `actionCard` that remove card chrome — flat section with padding
- [x] 2.4 Create embedded-mode style variants for `aiRecognitionCard` that remove `marginHorizontal`, `borderRadius`, `borderWidth` — flat inline sections
- [x] 2.5 Apply the embedded-mode style variants conditionally based on `embedded` prop in each render function

## 3. Height Estimation Update

- [x] 3.1 In `src/utils/photoListHelpers.js`, add a `CARD_CHROME_HEIGHT` constant (~18px) accounting for outer card `marginVertical` (8+8) and `borderWidth` (1+1)
- [x] 3.2 Add `CARD_CHROME_HEIGHT` to the return value of `estimateExpandedHeight`

## 4. Close Button Positioning

- [x] 4.1 Verify the close button in `PhotosListMasonry.js` `renderMasonryItem` renders as a sibling overlay outside the `Photo` component (not clipped by `overflow: 'hidden'`) — adjust `zIndex` or DOM order if needed
