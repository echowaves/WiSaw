## Why

The identity screen currently presents as a monolithic form regardless of whether the user has an established identity or not. Compared to the Waves feature — which uses rich visual cards, empty states, contextual actions, and polished feedback — the identity experience feels dated and utilitarian. Additionally, there is no identity visibility in the drawer navigation, so users can't tell at a glance whether they have an identity set up or what their nickname is.

## What Changes

- **Split identity screen into two visual states**: A creation flow (shown when no identity exists) using the app's `EmptyStateCard` pattern, and an active-identity profile view (shown when identity is established) with a profile card mirroring `WaveCard` styling
- **Add identity badge to drawer**: Display the user's nickname and identity status at the top of the drawer navigation, or a "Set up identity" prompt when no identity exists
- **Elevate visual polish**: Apply the same card-based design language used in Waves — `borderRadius: 16`, `CARD_BACKGROUND`, `CARD_SHADOW`, `BORDER_LIGHT` theme tokens, consistent shadow/elevation patterns
- **Rebrand WarningCard as PrivacyCard**: Transform the scary warning tone into a positive privacy assurance card that communicates the same information with a trust-building framing
- **Restyle ResetCard as action row**: Convert from a standalone warning box to a cleaner action item consistent with the profile view's card-based layout
- **Separate "Update Secret" into its own visual section**: Instead of the form toggling between create/update mode via conditional fields, present the update flow as a distinct expandable section or action within the active-identity state

## Capabilities

### New Capabilities
- `identity-profile-card`: Visual profile card component displayed when an identity is established, showing nickname, active status, and available actions (change secret, reset identity)
- `drawer-identity-badge`: Identity status display at the top of the drawer navigation showing the current nickname or a setup prompt

### Modified Capabilities
- `user-identity`: Updated requirements for the identity screen to support two distinct visual states (no-identity vs. active-identity) and rebranded privacy messaging

## Impact

- **Screens**: `src/screens/Secret/index.js` — major restructure into state-based rendering
- **Components**: `src/screens/Secret/components/HeaderCard.js`, `WarningCard.js`, `ResetCard.js` — restyled or replaced
- **Drawer**: `app/(drawer)/_layout.tsx` — new identity badge in `CustomDrawerContent`
- **State**: `src/state.js` — `nickName` atom already exists; drawer will read it
- **New components**: Identity profile card, drawer identity badge
- **No backend changes**: All changes are UI/UX only
- **No new dependencies**: Uses existing theme tokens, shared UI components (`EmptyStateCard`, `Button`), and icon libraries
