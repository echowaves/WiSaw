## Why

The identity screen currently uses "create" framing throughout, even though the same backend endpoint (`registerSecret`) handles both first-time identity creation and re-attaching an existing identity on a new device. This confuses returning users on a new device — they see "Create Your Anonymous Identity" and worry they will overwrite or duplicate their account, when in fact entering their existing nickname + secret simply reconnects them.

A second usability gap: after a successful attach, the `BookmarksList` screen does not refresh and shows an empty state until the app is restarted. The other identity-dependent feeds (`PhotosList`, `FriendsList`, `WavesHub`) already subscribe to `identityChangeBus`; bookmarks was missed.

## What Changes

- Reframe the identity screen copy from "create" to "attach", making it explicit that the same form handles both new identities and reconnecting on a new device.
- Rename the destructive action from "Reset Identity" to "Detach from This Device", with revised confirmation copy that clarifies it only removes the identity from the current device (the nickname/secret still work elsewhere).
- Update the active-identity status badge from "Identity active" to "Attached to this device".
- Update the success toast after a successful attach/update to be context-aware ("Identity attached to this device." vs "Your secret has been updated.").
- Update the `PrivacyNoticeCard` bullet list and the `PrivacyExplainerView` cards to use the new framing and to consistently mention that **both** nickname and secret are required for recovery (not just secret).
- Subscribe `BookmarksList` to `identityChangeBus` so it reloads automatically after attach/detach.
- Keep the "Confirm secret" field for all flows (including re-attach) as a typo-prevention safeguard.

No backend, schema, validation, or storage changes. No behavioral changes — only copy, labels, icons, and one missing event subscription.

## Capabilities

### New Capabilities
*(none)*

### Modified Capabilities
- `user-identity`: Identity-screen copy reframed from "create" to "attach"; reset action renamed to "detach"; success toast made context-aware.
- `privacy-explainer`: Card titles and bodies updated; subtitle updated; recovery wording explicitly mentions nickname + secret.
- `identity-profile-card`: Status badge label changed to "Attached to this device"; reset action row renamed to "Detach from This Device"; privacy-notice bullets reworded.
- `starred-screen`: Bookmarks/starred feed reloads on identity change events (parity with `PhotosList`, `FriendsList`, `WavesHub`).

## Impact

- **Code touched:**
  - `src/screens/Secret/index.js` — title, subtitle, button labels, submit toast, reset alert and toast, action row label/icon
  - `src/screens/Secret/components/PrivacyExplainerView.js` — three card titles/bodies and the subtitle
  - `src/screens/Secret/components/PrivacyNoticeCard.js` — bullet list copy
  - `src/screens/Secret/components/IdentityProfileCard.js` — status badge text
  - `src/screens/BookmarksList/index.js` — add `subscribeToIdentityChange` listener that calls `reload()`
- **APIs/dependencies:** none
- **Risk:** very low — no behavior change; pure copy + one event subscription that follows the established pattern in `PhotosList`, `FriendsList`, `WavesHub`.
- **Out of scope:** changing validation rules, changing the underlying identity model, removing the confirm-secret field, adding device-transfer or QR-based identity migration.
