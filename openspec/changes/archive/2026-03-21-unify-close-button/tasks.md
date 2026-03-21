## 1. Create shared CloseButton component

- [x] 1.1 Create `src/components/ui/CloseButton.js` with `onPress` and optional `style` props, matching the expanded photo view's visual spec (40×40, Ionicons close 24px, rgba(0,0,0,0.6) background, white border, drop shadow, text shadow)

## 2. Integrate into QuickActionsModal

- [x] 2.1 Replace the inline close button in `src/components/QuickActionsModal/index.js` with `CloseButton`, remove the `closeButton` style and unused `Ionicons` import

## 3. Integrate into expanded photo view

- [x] 3.1 Replace the inline `renderCloseButton` implementation in `src/components/Photo/index.js` with `CloseButton` using `style={{ right: 20 }}`

## 4. Verify

- [x] 4.1 Confirm zero lint/compile errors across all three files
- [x] 4.2 Run Codacy analysis on all modified files
