## Context

The three segment buttons render a `Text` component for the label below the icon. Currently there is no `numberOfLines` constraint, so React Native's default behavior wraps text onto multiple lines when it doesn't fit.

## Goals / Non-Goals

**Goals:**
- Prevent segment label text from wrapping to a second line
- Truncate with ellipsis when text doesn't fit

**Non-Goals:**
- Changing font size, padding, or segment width
- Adding any new styles or components

## Decisions

**Use `numberOfLines={1}` on Text components**
- React Native's `Text` component with `numberOfLines={1}` automatically truncates with tail ellipsis
- No need for explicit `ellipsizeMode` since `tail` is the default
- Alternative: reduce font size — rejected because truncation is cleaner and the current labels fit at normal widths

## Risks / Trade-offs

- [Labels may show ellipsis on very narrow screens] → Acceptable; better than wrapping to a second line and breaking the button layout
