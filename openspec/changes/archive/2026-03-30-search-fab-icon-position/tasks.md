## 1. Animate FAB position

- [x] 1.1 Add an animated style for the FAB button that interpolates `translateX` from `0` to `expandedWidth - FAB_SIZE` based on `progress`
- [x] 1.2 Apply the animated `translateX` style to the FAB `Pressable`

## 2. Swap bar padding direction

- [x] 2.1 Animate bar `paddingLeft` from `FAB_SIZE + 4` (collapsed) to `16` (expanded) based on `progress`
- [x] 2.2 Animate bar `paddingRight` from `16` (collapsed) to `FAB_SIZE + 4` (expanded) based on `progress`

## 3. Verify icon and clear button behavior

- [x] 3.1 Verify FAB icon shows magnifying glass (`search`) when collapsed and send icon (`send`) when expanded — already implemented, confirm no changes needed
- [x] 3.2 Verify ✕ clear button only appears when `searchTerm.length > 0` — already implemented, confirm no changes needed

## 4. Test

- [x] 4.1 Test expand animation — FAB slides from left to right, input fades in on left
- [x] 4.2 Test collapse animation (✕ tap) — FAB slides back to left, icon changes to magnifying glass
- [x] 4.3 Test submit (send icon tap) — search submits, bar stays expanded, FAB stays on right
- [x] 4.4 Test empty input state — no ✕ button visible, send icon on right
