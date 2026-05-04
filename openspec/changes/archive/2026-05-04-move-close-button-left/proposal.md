## Why

The close button (X) in the inline comment input is positioned on the right side, next to the send button. This layout makes it easy to fat-finger when the keyboard is up, accidentally closing the input instead of submitting the comment.

## What Changes

- Move the close button (X) from the right side to the left side of the comment input field
- The close button will now be positioned before the text input, with the send button remaining on the far right
- No functional changes - only visual reordering of UI elements

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `inline-comment-input`: The layout and positioning of the close button in the inline comment input row

## Impact

- **Affected File**: `src/components/Photo/index.js`
- **Lines**: ~897-964 (renderAddCommentsRow function, inlineCommentInputRow section)
- **Changes**: Reorder JSX elements to place close button before TextInput instead of after
- **Breaking Changes**: None
