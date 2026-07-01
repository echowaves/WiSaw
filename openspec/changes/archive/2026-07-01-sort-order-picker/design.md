## Context

Both FriendsList and WavesHub screens currently use an `ActionMenu` (a modal with a vertical list of items) for sort/order selection. The ActionMenu renders items with icons, labels, and a checkmark for the active option. Users must scan the entire list to understand available options.

The desired UX is an iOS-style segmented pill toggle in a bottom sheet — options are visible side-by-side with clear mutual exclusivity.

## Goals / Non-Goals

**Goals:**
- Replace ActionMenu-based sort pickers with a reusable `SortOrderPicker` component
- Support two layout modes: segmented pill (Friends, 3 options) and 2×2 grid (Waves, 4 options)
- Preserve all existing sort logic, state management (Jotai atoms), and persistence behavior
- Support dark mode matching the existing theme system

**Non-Goals:**
- Animations for the bottom sheet slide-up (static render for now)
- Adding new sort options to either screen
- Persisting Friends sort selection (spec says reset on restart)
- Replacing ActionMenu for other uses (context menus, wave actions, etc.)

## Decisions

### Decision 1: Single component with `mode` prop vs. two separate components

**Choice:** Single `SortOrderPicker` component with `mode="segmented" | "grid"`.

**Rationale:** Both modes share the same structure (bottom sheet, header, Done button, option data format, callback contracts). Duplicating would create maintenance burden. The `mode` prop controls layout only.

```
SortOrderPicker
  ├── visible: boolean
  ├── onClose: () => void
  ├── title: string
  ├── mode: "segmented" | "grid"
  ├── sortBy: string
  ├── sortDirection: string
  ├── options: Option[]
  ├── onSortChange: ({ sortBy, sortDirection }) => void
  └── isDarkMode: boolean
```

### Decision 2: Segmented layout uses iOS-style pill track

**Choice:** Gray track (`#E5E5EA` light / `#2C2C2E` dark) with white active segment (`#FFFFFF` / `#3C3C3E`).

**Rationale:** Matches the screenshot provided by the user and iOS HIG conventions. Alternatives considered:
- Flat buttons with border: Less visually cohesive, more visual noise
- Tab bar style: Too heavy for a sort picker

### Decision 3: Grid layout uses bordered cards

**Choice:** 2×2 grid where each option is a card with label text. Active card gets a blue border (`#007AFF`) and slightly lighter background.

**Rationale:** Waves has 4 verbose options ("Updated Newest First", etc.) that don't fit well in horizontal segments on 320px-wide screens. A grid gives each option breathing room.

**Alternatives considered:**
- 4-segment horizontal control: Cramped on small screens, text wraps
- Nested two-level control (field → direction): Requires two taps, more complex

### Decision 4: Menu stays open after selection

**Choice:** Tapping an option calls `onSortChange` but does NOT auto-close. User must tap "Done" or the overlay.

**Rationale:** Matches the screenshot behavior where "Done" is explicitly required. Also matches the current ActionMenu behavior. This gives users confidence they can change their mind.

### Decision 5: No animation library dependency

**Choice:** No `react-native-reanimated` or `moti` dependency. The bottom sheet renders as a static overlay.

**Rationale:** Minimizes new dependencies. The existing codebase doesn't use an animation library for modals. If animations are desired later, they can be added without architectural changes.

## Risks / Trade-offs

| Risk | Severity | Mitigation |
|------|----------|------------|
| 4 grid cells too tall on small screens | Medium | Use compact padding (8-12px vertical), test on 568px height |
| Breaking existing user muscle memory | Low | Same options, same Jotai atoms — only visual change |
| SortOrderPicker not imported correctly in both screens | Low | Use relative imports or verify in tasks checklist |
| Dark mode colors don't match system HIG precisely | Low | Use standard iOS palette values, iterate if needed |

## Migration Plan

1. Create `src/components/SortOrderPicker/index.js`
2. Update `FriendsList/index.js`:
   - Import `SortOrderPicker`
   - Replace `sortMenuVisible` / `sortMenuItems` state + `ActionMenu` with `SortOrderPicker`
   - Keep `sortBy` / `sortDirection` Jotai atoms unchanged
   - Keep `sortedAndFilteredFriends` useMemo unchanged
3. Update `WavesHub/index.js`:
   - Import `SortOrderPicker`
   - Replace `headerMenuVisible` / `headerMenuItems` state + `ActionMenu` with `SortOrderPicker`
   - Keep `saveWaveSortPreferences` call on sort change
   - Keep `sortBy` / `sortDirection` Jotai atoms unchanged
4. No backend changes, no API changes

## Open Questions

- Should the "Done" button auto-dismiss on selection? (Decided: No, user must tap Done)
- Should we add a subtle haptic feedback on segment tap? (Out of scope for v1)