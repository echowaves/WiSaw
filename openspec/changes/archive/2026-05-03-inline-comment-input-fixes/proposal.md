## Why

The inline comment input added in the `expanded-photo-height-recalc-inline-comments` change has four bugs that make it unusable: the keyboard obscures the input, the send button dismisses instead of submitting, there's no explicit cancel affordance, and optimistic comments render without author/date.

## What Changes

- **Fix send button vs. blur race condition**: The `onBlur` handler fires before `onPress` on the send button, destroying the input before submission runs. Introduce a submission guard so blur doesn't dismiss when a send is in progress.
- **Add explicit cancel button**: Add a visible cancel/close button next to the input so users have a clear way to dismiss without relying on blur behavior.
- **Scroll input above keyboard**: When the inline input appears and the keyboard rises, scroll the masonry list so the input row is visible above the keyboard.
- **Include author and timestamp in optimistic comment**: Add `uuid` and `updatedAt` fields to the optimistic comment object so it renders with the current user's name and a proper timestamp.

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `inline-comment-input`: Fix blur/send race condition, add cancel button, enrich optimistic comment with author identity and timestamp. Update keyboard scroll-to-input requirement.

## Impact

- **Modified files**: `src/components/Photo/index.js` (renderAddCommentsRow, optimistic comment creation, styles)
- **No new dependencies**
- **No API changes**
