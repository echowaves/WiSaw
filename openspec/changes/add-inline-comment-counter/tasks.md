## 1. Add constant and update TextInput

- [x] 1.1 Add `maxStringLength = 140` constant at the top of `src/components/Photo/index.js` (matching ModalInputText)
- [x] 1.2 Add `maxLength={maxStringLength}` prop to the TextInput in renderAddCommentsRow
- [x] 1.3 Update the `onChangeText` handler to slice input to `value.slice(0, maxStringLength)`

## 2. Add character counter UI

- [x] 2.1 Add a `<Text>` element showing `maxStringLength - commentInputText.length` between the TextInput and send button in the inline input row
- [x] 2.2 Add `commentCount` style to the styles object: absolute or inline positioning with `fontSize: 12`, `fontWeight: '500'`, and `color: theme.TEXT_SECONDARY`
- [x] 2.3 Verify the counter displays "140" when input is empty and decrements as user types

## 3. Verify and test

- [x] 3.1 Verify the inline input row layout remains correct on small screens (iPhone SE / 320px width)
- [x] 3.2 Verify the counter matches the modal input behavior (same 140 limit, same remaining-count format)
- [x] 3.3 Verify send button disabled state still works (opacity 0.4 when text is empty)
- [x] 3.4 Verify the onBlur and onSubmitEditing handlers still submit correctly with the new maxLength constraint
