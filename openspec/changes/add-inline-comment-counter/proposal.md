## Why

The inline comment input (used in embedded/expanded photo mode) is missing a character counter that existed when comment input was a separate screen (ModalInputText). Users have no visual feedback about remaining character budget (140 chars), making the experience inconsistent and less intuitive.

## What Changes

- Add character counter display (remaining characters, e.g. "140", "99") inside the inline comment input row
- Enforce 140-character max on the TextInput via `maxLength` prop
- Truncate input text in `onChangeText` handler to match the ModalInputText behavior
- Style the counter to match existing design patterns (small font, secondary text color, positioned between input and send button)

## Capabilities

### New Capabilities
- `inline-comment-counter`: Visual character counter in the inline comment input row showing remaining characters up to the 140-character limit

### Modified Capabilities
- `inline-comment-input`: Added character counting requirement — users should see remaining character count while typing a comment inline

## Impact

- **Affected file**: `src/components/Photo/index.js` (renderAddCommentsRow function, inlineCommentInputRow section, styles)
- **No new dependencies**
- **No API changes**
- **Non-breaking**: Purely additive UI change; existing functionality is preserved
