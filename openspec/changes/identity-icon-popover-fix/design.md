## Context

The `IdentityHeaderIcon` component renders a popover menu using an absolutely-positioned `View` inside a 40x40 container within the `PhotosListHeader`. The header (`SafeAreaView` with `elevation: 3`) is a sibling of the masonry photo grid, which renders after it in the component tree. The popover drops below the header bounds but is clipped by parent overflow and painted over by the masonry sibling. The backdrop uses `position: 'fixed'`, which is not supported in React Native (only `absolute` and `relative` work).

## Goals / Non-Goals

**Goals:**
- Make the popover render above all screen content on iOS, Android, and Web
- Fix the backdrop to properly capture outside taps for dismissal
- Maintain the same visual appearance and interaction (icon tap → popover → row tap → navigate)

**Non-Goals:**
- Changing the popover content, styling, or navigation behavior
- Lifting state out of the component
- Adding animations beyond the basic Modal fade

## Decisions

### 1. React Native `Modal` over portal pattern or state lifting

**Decision**: Wrap the popover and backdrop in `<Modal visible={isOpen} transparent animationType="fade">`.

**Why not portal pattern**: Requires setting up a portal context/provider at a root level — more plumbing for a single use case. `Modal` solves it natively with zero setup.

**Why not lifting state to PhotosList**: Would break the self-contained pattern that mirrors `WaveHeaderIcon`. The component would need props and callbacks from the parent, creating coupling.

### 2. Position popover using `useSafeAreaInsets` + known header height

**Decision**: Inside the Modal's full-screen View, position the popover at `top: insets.top + 60` (SafeArea inset + header height) and `left: 16` (matching the icon's position in the header).

**Why**: The header height is a constant 60px and the icon is at `left: 16`. These values are stable and match the parent layout. No need for `onLayout` measurement — deterministic positioning is simpler and more reliable.

### 3. Remove `zIndex`/`elevation` from icon container in header

**Decision**: Remove the `zIndex: 100` from the icon's wrapper `View` in `PhotosListHeader` since the popover no longer renders there.

**Why**: The z-index was a workaround for the now-replaced approach. With Modal, it's unnecessary and could cause unintended stacking issues.

## Risks / Trade-offs

- **[Risk] Modal animation on low-end Android**: `animationType="fade"` adds a brief fade. → **Mitigation**: The fade is subtle (default OS timing) and matches native popup behavior. Can be set to `"none"` if performance is an issue.

- **[Trade-off] Modal creates a new native layer**: Slightly heavier than a plain View, but this is the designed-for use case of Modal in React Native — temporary overlay content that must appear above everything.
