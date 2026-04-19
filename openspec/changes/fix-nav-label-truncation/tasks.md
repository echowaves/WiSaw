## 1. Fix popover label truncation

- [ ] 1.1 In `src/components/IdentityHeaderIcon/index.js`, increase the popover `minWidth` from 180 to 220 in the `popover` style
- [ ] 1.2 In `src/components/IdentityHeaderIcon/index.js`, remove `numberOfLines={1}` from the popover label `<Text>` component

## 2. Fix drawer label truncation

- [ ] 2.1 In `app/(drawer)/_layout.tsx`, remove `numberOfLines={1}` from the `<Text>` component in `IdentityDrawerLabel`
