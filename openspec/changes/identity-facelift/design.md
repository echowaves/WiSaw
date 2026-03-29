## Context

The identity screen (`src/screens/Secret/index.js`) currently renders a single monolithic form for both identity creation and identity update. It uses conditional rendering (`nickNameEntered` boolean) to toggle between a "Create" and "Update" mode, but the visual layout is identical either way — a HeaderCard, input fields, a submit button, and warning/reset cards.

The Waves feature, by contrast, uses rich visual patterns: `WaveCard` with thumbnail collages, `EmptyStateCard` for empty states, `ActionMenu` for contextual actions, `LinearProgress` for loading, and a floating search bar. The identity screen uses none of these patterns.

The drawer navigation (`app/(drawer)/_layout.tsx`) lists identity as a menu item but has no awareness of whether an identity is established or what the user's nickname is.

State is managed via Jotai atoms: `uuid` and `nickName` in `src/state.js`. The `nickName` atom is populated at app startup from SecureStore.

## Goals / Non-Goals

**Goals:**
- Visually distinguish "no identity" and "active identity" states on the identity screen
- Show identity status in the drawer navigation header
- Apply the same card-based, themed design language used across Waves and other polished features
- Rebrand the security warning into positive privacy messaging
- Keep the existing identity functionality intact (register, update, reset)

**Non-Goals:**
- Recovery codes, phone number input, or any new backend functionality
- Changes to the GraphQL mutations (`registerSecret`, `updateSecret`)
- Changes to SecureStore persistence logic
- Multi-device identity sync
- Any changes to `src/screens/Secret/reducer.js` business logic

## Decisions

### 1. State-based screen rendering over single-form conditional toggle

**Decision**: Restructure `SecretScreen` to render two distinct top-level views based on `nickNameEntered`:
- **No identity**: EmptyStateCard-style creation flow with inline form
- **Active identity**: Profile card + action rows (change secret, reset)

**Why not keep the current approach**: The current conditional rendering hides/shows individual fields but keeps the same layout. This makes it impossible to create distinct visual experiences for the two states. The Waves pattern already demonstrates this — `WavesHub` has a completely different render for empty vs. populated states.

**Alternative considered**: Using a tab/step wizard for creation. Rejected because identity setup is only 3 fields — a wizard would add unnecessary friction.

### 2. Inline form within EmptyStateCard pattern over modal-based input

**Decision**: When no identity exists, show the creation form inline within the screen using the same visual language as `EmptyStateCard` (centered card, icon circle, title, subtitle) but with form fields embedded inside the card.

**Why not a modal**: The identity screen is already a dedicated screen in the drawer. Adding a modal on top of a dedicated screen is redundant and creates confusing navigation.

### 3. Profile card as new component over reusing HeaderCard

**Decision**: Create a new `IdentityProfileCard` component for the active-identity state, replacing `HeaderCard`. This card shows the nickname, active status indicator, and matches the `WaveCard` styling pattern (themed card background, `borderRadius: 16`, shadows).

**Why not reuse HeaderCard**: HeaderCard's structure is tied to the form layout (title + subtitle text). The profile card needs a different layout — nickname display, status badge, and action triggers.

### 4. Drawer identity badge reads nickName atom directly

**Decision**: The `CustomDrawerContent` component in `app/(drawer)/_layout.tsx` will read the `nickName` Jotai atom. If non-empty, display it with a user icon. If empty, show a "Set up identity" tappable prompt.

**Why not a separate "identity status" atom**: The nickName atom already reflects identity state — empty means no identity, non-empty means identity is established. No need for a redundant state atom.

### 5. WarningCard rebranded as PrivacyNoticeCard with positive framing

**Decision**: Replace the `WarningCard` (red-toned, exclamation triangle) with a `PrivacyNoticeCard` (green/blue-toned, lock/shield icon) that communicates the same information with trust-building language. Show in both states.

**Why**: The current "Important Security Notice" framing with red colors and warning icons creates anxiety. For an anonymous app, privacy should feel like a feature, not a hazard.

### 6. ResetCard becomes a styled action row in the profile view

**Decision**: In the active-identity state, reset becomes one of the action items within the profile view, styled as a card row with a destructive color accent rather than a standalone warning box.

**Why**: The current ResetCard is visually heavy and alarming. As an action row alongside "Change Secret," it's still accessible but doesn't dominate the screen.

## Risks / Trade-offs

- **[Risk] Jotai atom stale in drawer**: The drawer reads `nickName` which is set during app startup and after identity operations. If the identity screen updates the atom but the drawer doesn't re-render, the badge could be stale. → **Mitigation**: Jotai atoms trigger re-renders in all consuming components automatically. No extra work needed.

- **[Risk] Form state reset between states**: Switching from active-identity view to the "Change Secret" expanded form could lose state if not managed carefully. → **Mitigation**: The change-secret form is a separate interaction within the active state, not a state transition. Local `useState` scoping handles this naturally.

- **[Risk] Visual regression on the creation form**: The inline form within the new card layout might have different spacing/alignment on various device sizes. → **Mitigation**: Reuse existing `Input` and `Button` components which are already responsive. Test on small and large screens.
