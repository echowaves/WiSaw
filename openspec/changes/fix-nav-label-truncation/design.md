## Context

The `IdentityHeaderIcon` component (`src/components/IdentityHeaderIcon/index.js`) renders a popover when tapped on the home screen header. The popover has `minWidth: 180` and the label uses `numberOfLines={1}`, which causes "Set Up Identity" to truncate to "Set Up Ide..." because the available text space after accounting for padding (32px), icon (24px), margins (18px), and chevron (~12px) leaves only ~94px for text — not enough for the full label at fontSize 15.

The `IdentityDrawerLabel` component in `app/(drawer)/_layout.tsx` also uses `numberOfLines={1}`, which would truncate long nicknames.

## Goals / Non-Goals

**Goals:**
- All navigation labels display in full without ellipsis truncation
- Popover auto-sizes to fit "Set Up Identity" and reasonable nickname lengths
- Drawer label wraps gracefully for long nicknames

**Non-Goals:**
- Changing the label text itself (keeping "Set Up Identity")
- Redesigning the popover or drawer layout
- Handling pathologically long nicknames (server-side validation is the right control)

## Decisions

### Decision 1: Increase popover `minWidth` from 180 to 220

**Choice**: Bump `minWidth` to 220px.

**Rationale**: At 220px, the text budget becomes ~134px, comfortably fitting "Set Up Identity" (~120px at fontSize 15, fontWeight 500). This is a minimal change that solves the immediate problem. The popover is positioned at `left: 16` so 220px fits within even the narrowest supported screens (320px width).

**Alternative considered**: Remove `minWidth` entirely and let content size the popover. Rejected because the popover could look too narrow if the nickname is very short (e.g., "Jo").

### Decision 2: Remove `numberOfLines={1}` from both labels

**Choice**: Remove the `numberOfLines` constraint from the popover label and the drawer label.

**Rationale**: `numberOfLines={1}` is the direct cause of truncation. With the wider popover, single-line display will be the normal case, but removing the constraint ensures graceful wrapping as a safety net for edge cases. In the drawer (280px wide), wrapping is the correct behavior for long nicknames.

## Risks / Trade-offs

- [Popover height increases with wrapping] → Acceptable for edge cases; the popover is a simple single-row dropdown positioned below the header, so a second line doesn't cause layout issues
- [Drawer item height increases with wrapped nickname] → Standard drawer behavior; other apps handle this the same way
