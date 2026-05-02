## 1. Fix Outer Container Styling for Embedded Mode

- [ ] 1.1 In `src/components/Photo/index.js`, modify the outer container `View`'s inline style to conditionally set `backgroundColor: 'transparent'` when `embedded === true` (instead of inheriting `theme.BACKGROUND` from `styles.container`)
- [ ] 1.2 Remove `overflow: 'hidden'` from the outer container's inline style when `embedded === true`, so the card's shadow and rounded corners are not clipped

## 2. Match Expanded Card to Collapsed Thumb

- [ ] 2.1 In `expandedCardContainer` style, change shadow to match thumb: `shadowColor: '#000'`, `shadowOpacity: 0.4`, `shadowRadius: 6` (keep `shadowOffset: { 0, 4 }` and `elevation: 8`)
- [ ] 2.2 Remove border: set `borderWidth: 0`, `borderColor: 'transparent'`
- [ ] 2.3 Remove margins: set `marginVertical: 0`, `marginHorizontal: 0`

## 3. Update Height Estimation

- [ ] 3.1 In `src/utils/photoListHelpers.js`, set `CARD_CHROME_HEIGHT` to `0` (was 18) since expanded card no longer adds margins or border
