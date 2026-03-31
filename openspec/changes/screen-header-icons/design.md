## Context

The four primary drawer screens (Identity, Friends, Waves, Feedback) each use `AppHeader` with a plain string `title` prop. The drawer layout defines icons inline for each screen. There is no shared mapping between the drawer icons and screen headers.

`AppHeader` already accepts `title: string | React.ReactNode`, so no interface change is needed to support icon+text titles.

The Identity screen has special icon behavior in the drawer: the icon turns `MAIN_COLOR` (green) when identity is set, and shows a red badge dot when not set. This behavior needs to carry over to the header.

## Goals / Non-Goals

**Goals:**
- Single source of truth (`SCREEN_HEADER_ICONS`) for icon library, icon name, and display title of the four primary drawer screens.
- Reusable `ScreenIconTitle` component that renders icon + title for use in `AppHeader`.
- Identity-aware icon styling in the header (green when identity set, red badge dot when not).
- Drawer layout refactored to consume the same icon map.

**Non-Goals:**
- Adding icons to non-primary screens (Bookmarks, wave detail, photo detail, etc.).
- Changing drawer label behavior (Identity still shows `nickName` in drawer, not in header title).
- Changing `AppHeader` component interface.
- Waves badge count in the header (badge is a drawer-only affordance).

## Decisions

### 1. New file: `src/theme/screenIcons.tsx`

Contains `SCREEN_HEADER_ICONS` map and `ScreenIconTitle` component. Placed in `src/theme/` because it bridges icon config with theme-aware rendering.

**Alternatives considered:**
- `src/consts.js` — too generic, mixes concerns. The map includes React components (icon libraries).
- `src/components/ScreenIconTitle/index.tsx` — separates the map from the component that consumes it. Keeping them together is simpler.

### 2. `SCREEN_HEADER_ICONS` structure

```ts
export const SCREEN_HEADER_ICONS = {
  identity: { library: FontAwesome, name: 'user-secret', title: 'Identity' },
  friends:  { library: FontAwesome5, name: 'user-friends', title: 'Friends' },
  waves:    { library: FontAwesome5, name: 'water', title: 'Waves' },
  feedback: { library: MaterialIcons, name: 'feedback', title: 'Feedback' },
}
```

Each entry stores the icon component constructor, icon name, and display title. The drawer layout reads `library` and `name`; the header component reads all three.

### 3. `ScreenIconTitle` component

A small component accepting `screenKey` plus optional `size` (default 18). Renders `<View flexDirection='row'> <Icon /> <Text>title</Text> </View>`.

For `screenKey === 'identity'`, it reads the `nickName` Jotai atom and applies:
- `MAIN_COLOR` icon color when identity is set
- `theme.TEXT_PRIMARY` + red badge dot when not set

For all other keys, icon color is `theme.TEXT_PRIMARY`.

**Why not a generic "identity-aware" wrapper?** Only Identity has this behavior. A conditional branch inside `ScreenIconTitle` is simpler than an abstraction layer.

### 4. Drawer icon refactoring

The `IdentityDrawerIcon` and `WavesDrawerIcon` inline components in `_layout.tsx` remain as-is for now. They have drawer-specific behavior (focused state, badge count) that doesn't belong in the shared map. The drawer will reference `SCREEN_HEADER_ICONS` only for icon `library` and `name` for the simple cases (Friends, Feedback). Identity and Waves drawer icons keep their custom components because they have drawer-specific logic (focused color, ungrouped count badge).

**Alternative considered:** Fully unifying drawer and header icon rendering. Rejected—the drawer's `focused` state and Waves badge are drawer-only concerns. Forcing them into a shared abstraction adds complexity without benefit.

## Risks / Trade-offs

- [Two rendering paths for Identity icon] → Acceptable. The header and drawer have legitimately different contexts (focused state, layout constraints). The shared `SCREEN_HEADER_ICONS` map ensures the icon name/library stays in sync. The color/badge logic differs by design.
- [New file in src/theme/] → Minimal risk. Small, focused file. No new dependencies.
