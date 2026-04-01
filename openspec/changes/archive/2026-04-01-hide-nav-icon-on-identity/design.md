## Context

The `IdentityHeaderIcon` component renders a user-secret icon in the top-left of the home photo feed header (`PhotosListHeader`). It serves dual purposes: prompting new users to set up identity and providing quick access to identity settings. Once identity is established, users can access identity settings via the drawer menu's "Identity" item, making the header icon redundant.

Currently, the icon always renders regardless of identity state — changing color from grey to coral when identity is set and hiding the red badge.

## Goals / Non-Goals

**Goals:**
- Hide the `IdentityHeaderIcon` from the photo feed header when the user has an established identity
- Maintain the icon as a visible prompt when identity is not yet set up
- Keep the drawer menu identity item fully functional as the primary access point

**Non-Goals:**
- Changing the drawer menu identity item behavior
- Modifying the `IdentityHeaderIcon` popover/modal behavior (it simply won't render)
- Adding any new identity access points

## Decisions

### Decision 1: Conditional rendering in IdentityHeaderIcon component

**Choice**: Return `null` from `IdentityHeaderIcon` when `hasIdentity` is true.

**Rationale**: This keeps the change self-contained within the component. The `PhotosListHeader` doesn't need to know about identity state — it always renders `<IdentityHeaderIcon />`, and the component itself decides whether to show. This follows the existing pattern where the component already reads `nickName` state.

**Alternative considered**: Conditionally render in `PhotosListHeader` — rejected because it would require importing and reading `nickName` atom in the header, adding identity-awareness to a component that currently delegates it.

### Decision 2: No layout adjustment in PhotosListHeader

**Choice**: Keep the existing `View` wrapper with `position: 'absolute', left: 16` even when the icon is hidden.

**Rationale**: Since the icon container uses absolute positioning, hiding the icon content won't affect the layout of other header elements. The empty wrapper is harmless and avoids unnecessary conditional logic in the parent.

## Risks / Trade-offs

- [Users lose quick identity access] → Mitigated by the drawer menu identity item remaining fully accessible. The trade-off favors cleaner UI for established users.
- [No visual indicator of identity state on home screen] → Acceptable since the identity state is visible in the drawer. Users who have set up identity don't need a persistent reminder.
