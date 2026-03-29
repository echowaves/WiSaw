## Why

The identity screen tells users "we cannot recover lost secrets" but never explains *why* — that WiSaw never stores any personal information on its servers. This "why" is the app's strongest trust signal and the key fact users need to understand before creating an identity. Without it, the unrecoverability feels like a limitation rather than a deliberate privacy guarantee. A one-time full-screen educational moment before identity creation will ensure every user understands the privacy model and the permanence of secret loss.

## What Changes

- **Add a full-screen privacy explainer**: Show a one-time educational screen before the identity creation form, explaining the zero-PII architecture: no phone, no email, no personal data stored; your secret is the only key; lost secrets cannot be recovered because we don't know who you are
- **Gate on SecureStore flag**: Use the existing `InteractionHintBanner` pattern — check a SecureStore key on mount, show the explainer once, write the flag on dismiss, never show again
- **Update PrivacyNoticeCard copy**: Sharpen the existing compact privacy card to explicitly state "no personal information stored on our servers" and frame unrecoverability as a consequence of the privacy model
- **Update reset confirmation dialog copy**: Make the Alert.alert text explicit about *why* recovery is impossible — because no PII is stored, not just "we can't help you"
- **Update creation flow subtitle**: Replace the current generic subtitle with copy that foregrounds the zero-PII guarantee

## Capabilities

### New Capabilities
- `privacy-explainer`: One-time full-screen educational view shown before identity creation, explaining the zero-PII architecture and unrecoverability of lost secrets, dismissed via SecureStore flag

### Modified Capabilities
- `user-identity`: Updated copy on the creation subtitle, PrivacyNoticeCard, and reset confirmation dialog to explicitly communicate that no personal information is ever stored on the server

## Impact

- **New component**: `PrivacyExplainerView` in `src/screens/Secret/components/`
- **Modified**: `src/screens/Secret/index.js` — conditional rendering of explainer before creation flow
- **Modified**: `src/screens/Secret/components/PrivacyNoticeCard.js` — updated copy
- **Storage**: New SecureStore key `identityPrivacyExplainerSeen`
- **No backend changes**: All changes are UI copy and flow
- **No new dependencies**: Uses existing `expo-secure-store` and shared UI components
