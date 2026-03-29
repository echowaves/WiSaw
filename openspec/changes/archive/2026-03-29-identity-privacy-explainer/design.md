## Context

The identity screen (`src/screens/Secret/index.js`) was recently refactored (identity-facelift change) into two visual states: a creation flow for new users and an active-identity profile view for existing users. The creation flow includes a `PrivacyNoticeCard` component that mentions unrecoverability as a bullet point, but the messaging is passive and doesn't explain the architectural reason — that WiSaw never stores PII on its servers.

The codebase already has a proven pattern for one-time dismissible UI in `InteractionHintBanner`, which uses `expo-secure-store` to check a flag on mount and persist dismissal. This same pattern will be used for the privacy explainer.

## Goals / Non-Goals

**Goals:**
- Ensure every user understands the zero-PII privacy model before creating an identity
- Communicate that secret unrecoverability is a consequence of privacy-by-design, not a limitation
- Update all identity-related copy to consistently reference the no-PII guarantee
- Use the existing SecureStore one-time-flag pattern

**Non-Goals:**
- Recovery codes, phone number input, or any new recovery mechanism (separate future change)
- Backend changes
- Changes to the active-identity profile view (only the creation path is affected)
- Internationalization of copy

## Decisions

### 1. Full-screen explainer view inside SecretScreen over a separate route

**Decision**: Implement the privacy explainer as a conditional view within `SecretScreen` (similar to how the offline `EmptyStateCard` already gates the screen), not as a separate Expo Router screen.

**Why not a separate route**: Adding a route would complicate navigation (back button behavior, deep linking, drawer state). The explainer is a one-time gate within the existing identity screen — it's a screen *state*, not a screen *destination*. The pattern matches how the offline guard already works: check a condition, render alternative content.

**Alternative considered**: Modal overlay. Rejected because modals feel dismissible/optional — this message is mandatory before proceeding.

### 2. SecureStore flag check with local state over Jotai atom

**Decision**: Use a local `useState` + `useEffect` pattern to check `SecureStore.getItemAsync('identityPrivacyExplainerSeen')` on mount, matching the `InteractionHintBanner` pattern exactly. No Jotai atom needed.

**Why not a Jotai atom**: This flag is only relevant to the identity screen. It doesn't need to be shared across components. Adding a global atom for a one-time local UI state adds unnecessary complexity.

### 3. Show explainer only before creation, not on every visit

**Decision**: The explainer shows only when `!nickNameEntered && !hasSeenExplainer`. Users who already have an identity, or who have dismissed the explainer before, go straight to the normal screen.

**Why**: An established user visiting the identity screen to change their secret doesn't need the privacy education again. And if they reset their identity, the creation flow still shows the compact `PrivacyNoticeCard` as a reminder.

### 4. Three-card content structure with explicit CTA

**Decision**: The explainer view uses three themed info cards (Zero Personal Data, Your Secret = Your Key, No Recovery Possible) followed by an "I Understand" button. The cards use the existing `CARD_BACKGROUND` / `BORDER_LIGHT` theme tokens for consistency.

**Why three cards**: Maps to the three concepts users must understand: (1) what we don't store, (2) what the secret is, (3) what happens if they lose it. Each is a self-contained point. The CTA text "I Understand" creates an acknowledgment moment.

## Risks / Trade-offs

- **[Risk] Users might dismiss without reading**: The explainer is a gate (must tap "I Understand"), but users can still skip reading. → **Mitigation**: Keep the compact `PrivacyNoticeCard` visible on every subsequent visit as a persistent reminder. The three-card format is scannable even for fast readers.

- **[Risk] Explainer blocks returning users after app data clear**: If SecureStore is wiped (reinstall, clear data), users with existing identities would see the explainer. → **Mitigation**: The explainer only shows when `!nickNameEntered`, so users who still have their identity stored won't see it. If both are wiped, they're effectively new users anyway.

- **[Trade-off] Single dismiss, no re-access**: Once dismissed, users can't revisit the full explainer. → **Acceptable**: The compact `PrivacyNoticeCard` always remains. A "Learn more" option could be added later if needed.
