## Context

The drawer layout in `app/(drawer)/_layout.tsx` has a `CustomDrawerContent` component that renders a custom identity badge above the `DrawerItemList`. This badge was added during the identity-facelift change and shows either a tappable "Set up identity" prompt or a passive nickname display. With the new `IdentityHeaderIcon` in the photo feed header, this badge is redundant.

The `Drawer.Screen` for identity currently uses static options: `drawerIcon` renders `user-secret` with the drawer's `color` prop, and `drawerLabel` is the string `'Identity'`. Both `drawerIcon` and `drawerLabel` accept render functions, which can contain hooks — this is how we'll make them reactive to identity state.

## Goals / Non-Goals

**Goals:**
- Remove the redundant identity badge from the drawer
- Make the "Identity" drawer item show identity status at a glance (matching header icon cues)
- Clean up unused styles from `createStyles`

**Non-Goals:**
- Changing the header icon behavior
- Adding new navigation paths
- Modifying the identity screen itself

## Decisions

### 1. Inline wrapper components over extracting to separate files

**Decision**: Define small `IdentityDrawerIcon` and `IdentityDrawerLabel` components directly in `_layout.tsx` and use them in the `Drawer.Screen` options.

**Why not separate files**: These are 5-10 line components specific to the drawer layout. Extracting them to files would add overhead for trivial components. They're analogous to the inline icon functions already used by every other `Drawer.Screen`.

**Why not keep the render functions inline**: The `drawerIcon` and `drawerLabel` functions need to call `useAtom`, which requires them to be proper component functions (hooks rules). Named components are clearer than anonymous functions with hooks.

### 2. Red dot via View over Badge component

**Decision**: Render a small `View` dot (same as the header icon's approach) positioned absolutely on the icon when no identity is set.

**Why not the Badge component**: The custom `Badge` component always renders text. A dot-only indicator is simpler as a styled `View`, matching the header icon pattern exactly.

### 3. Override icon color via props over custom active style

**Decision**: When identity is active, pass `MAIN_COLOR` to the icon regardless of the drawer's active/inactive state. When no identity, use the drawer's default `color` prop.

**Why**: This mirrors the header icon's behavior (orange when active, secondary when not) and creates a visual connection between the two. The drawer's own active highlight (orange background) still applies when the identity screen is focused.

## Risks / Trade-offs

- **[Trade-off] Icon color override on active screen**: When the identity screen is active, the drawer highlights the row with an orange background and white text/icon. Overriding the icon to `MAIN_COLOR` (also orange) when identity is active means it would be orange-on-orange-background. → **Mitigation**: The drawer's `drawerActiveTintColor` is `'white'`, so the active state passes `white` as `color`. We should use `color` when the item is active (respecting the drawer's own highlighting) and only override to `MAIN_COLOR` when inactive and identity is set. We can detect this by checking if `color === 'white'` (active) vs the inactive tint.
