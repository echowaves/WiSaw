## Context

The move-friends-to-header change relocated the Friends button from the 4-button footer to the header's right side alongside the Waves icon. Three polish issues emerged: icon order, coloring logic mismatch, and footer centering after losing its fourth button.

Current state:
- Header right side: `[WaveHeaderIcon] [FriendsHeaderIcon]` (Waves first)
- `FriendsHeaderIcon` colors based on unread count only — no "has friends" highlight
- Footer uses `space-around` with 3 unequal buttons (50px menu, 60px video, 70px camera), pulling the visual center left

## Goals / Non-Goals

**Goals:**
- Friends icon appears before (left of) Waves icon in header
- Friends icon coloring mirrors Waves: `MAIN_COLOR` when "has friends", `TEXT_SECONDARY` when none; red dot badge for unread
- Footer camera buttons are visually centered regardless of menu button

**Non-Goals:**
- Changing icon sizes, badge styling, or navigation targets
- Modifying the Waves icon behavior
- Changing footer button count or functionality

## Decisions

### 1. FriendsHeaderIcon reads `STATE.friendsList` for color, keeps `STATE.friendsUnreadCount` for badge

**Rationale**: Mirrors the WaveHeaderIcon pattern exactly — `wavesCount > 0` drives color, `ungroupedPhotosCount > 0` drives badge. The `friendsList` atom is already populated during `PhotosList.reload()`, so no new data fetching is needed.

**Alternative**: Introduce a separate `friendsCount` numeric atom. Rejected — `friendsList` already exists and `.length` is trivially cheap.

### 2. Footer menu button uses absolute positioning

**Rationale**: Pulling the menu button out of flex flow means the remaining video + camera buttons center naturally within the full footer width. This matches the header pattern where `IdentityHeaderIcon` is absolutely positioned left.

**Alternative**: Invisible spacer on the right to balance. Rejected — fragile if button sizes change; absolute positioning is the established pattern.

### 3. Footer inner content uses `justifyContent: 'center'` with explicit gap

**Rationale**: With only two buttons in flex flow, `center` + `gap: 24` gives precise control over spacing without depending on element count.

## Risks / Trade-offs

- [Menu button overlap] → The absolutely positioned menu button could overlap centered buttons on very narrow screens. Mitigation: the menu button (50px) at `left: 20` only extends to 70px — the centered pair starts well past that on any supported device width (≥320px).
