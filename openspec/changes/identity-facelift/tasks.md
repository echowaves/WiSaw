## 1. New Components

- [x] 1.1 Create `IdentityProfileCard` component at `src/screens/Secret/components/IdentityProfileCard.js` — displays nickname, user-secret icon in a themed circle, and "Identity active" status badge using `CARD_BACKGROUND`, `borderRadius: 16`, `CARD_SHADOW`, `BORDER_LIGHT` theme tokens
- [x] 1.2 Create `PrivacyNoticeCard` component at `src/screens/Secret/components/PrivacyNoticeCard.js` — replaces `WarningCard` with positive green/blue-toned privacy messaging, lock/shield icon, same information but trust-building framing
- [x] 1.3 Create `ActionRow` component at `src/screens/Secret/components/ActionRow.js` — tappable card row with icon, label, and forward chevron, supporting a `destructive` color variant for reset identity

## 2. Identity Screen Restructure

- [x] 2.1 Refactor `src/screens/Secret/index.js` to render two distinct top-level views based on `nickNameEntered`: a creation flow (no identity) and an active-identity profile view
- [x] 2.2 Build the no-identity creation flow using `EmptyStateCard` visual patterns — centered card with icon circle, "Create Your Anonymous Identity" heading, subtitle, and inline form fields (nickname, secret, confirm secret, strength indicator, submit button)
- [x] 2.3 Build the active-identity view using `IdentityProfileCard` at the top, followed by `ActionRow` items for "Change Secret" and "Reset Identity", and `PrivacyNoticeCard` at the bottom
- [x] 2.4 Implement expandable "Change Secret" form — tapping the action row expands an inline form with current secret, new secret, confirm secret fields, strength indicator, and update button
- [x] 2.5 Replace `WarningCard` import/usage with `PrivacyNoticeCard` in both screen states
- [x] 2.6 Replace standalone `ResetCard` with the "Reset Identity" `ActionRow` that triggers the same `Alert.alert` confirmation dialog

## 3. Drawer Identity Badge

- [x] 3.1 Add `nickName` atom import to `app/(drawer)/_layout.tsx` `CustomDrawerContent` component
- [x] 3.2 Add identity badge section above `DrawerItemList` — when `nickName` is non-empty, display a card with user-secret icon, nickname text, and "Identity active" label using `CARD_BACKGROUND` and `MAIN_COLOR`
- [x] 3.3 Add "Set up identity" tappable prompt — when `nickName` is empty, display a prompt with user-plus icon that navigates to the identity screen and closes the drawer

## 4. Cleanup

- [x] 4.1 Remove `WarningCard` component file (`src/screens/Secret/components/WarningCard.js`) and its import from the screen
- [x] 4.2 Remove `HeaderCard` component file (`src/screens/Secret/components/HeaderCard.js`) — replaced by `IdentityProfileCard` and the creation flow header
- [x] 4.3 Remove `ResetCard` component file (`src/screens/Secret/components/ResetCard.js`) — replaced by `ActionRow` with destructive styling
- [x] 4.4 Update `src/screens/Secret/styles.js` to add any new shared styles needed for the creation flow card layout and remove unused styles
