## Context

The identity screen (`src/screens/Secret/`) currently uses signup-style language ("Create Your Anonymous Identity", "Create Identity", "Reset Identity"), but the backend `registerSecret` mutation is idempotent on `(nickName, secret)` — entering an existing nickname/secret on a new device simply re-attaches the existing identity. The UI hides this fact, causing returning users on a new device to hesitate or feel they're creating a duplicate account.

Separately, three of the four identity-dependent screens (`PhotosList`, `FriendsList`, `WavesHub`) already subscribe to `identityChangeBus` and reload after attach/detach. `BookmarksList` (a.k.a. the Starred screen) was missed and stays empty until the app is restarted.

## Goals / Non-Goals

**Goals:**
- Make the identity screen self-explanatory for both first-time users and returning users on a new device, using one consistent verb: "attach".
- Make the destructive action's effect crystal clear: it removes identity from this device only, it does not delete the identity server-side or affect other devices.
- Bring `BookmarksList` to parity with the other identity-dependent feeds for refresh-on-identity-change.
- Strengthen the no-recovery messaging by consistently mentioning that **both** nickname and secret are required to reconnect.

**Non-Goals:**
- Changing the identity model, backend mutations, or storage.
- Removing the "Confirm secret" field — explicitly kept for typo safety in all flows.
- Adding alternative identity flows (passkeys, QR transfer, recovery phrase, etc.).
- Redesigning the screen layout, colors, or component structure — copy and labels only (plus icons that match the new labels).
- Localizing copy — English only, matching current state.

## Decisions

### Decision 1: Use the verb "attach" instead of "create" / "sign in"
**Choice:** Rename the primary action and screen title to use "Attach Identity to This Device". The submit button reads "Attach Identity" / "Attaching..."; the success toast says "Identity attached to this device."

**Alternatives considered:**
- *Add a "Sign in vs Create" toggle.* Rejected — adds friction, and the backend already handles both cases. A toggle would force users to declare which case they're in when the system doesn't need to know.
- *Keep "Create" and just add subtitle text.* Rejected — doesn't fix the active misconception; users skim the title.

**Rationale:** "Attach" honestly describes what the device is doing (binding to a server-side identity) without prejudging whether that identity already exists. It is the only verb that is correct for both cases.

### Decision 2: Rename "Reset Identity" → "Detach from This Device"
**Choice:** Rename the destructive action and its confirmation alert to use the verb "detach". Confirmation copy explicitly states the nickname and secret continue to work elsewhere.

**Alternatives considered:**
- *Keep "Reset" with better explainer text.* Rejected — "reset" implies destruction; users who hesitate to lose data avoid the button even when they just want to switch devices.
- *Use "Sign out".* Rejected — implies a session that can be re-established with a token; here the user must re-enter the nickname + secret, which "detach"/"attach" describes more accurately.

**Rationale:** Symmetry with "attach" makes the model coherent: attach to bind a device, detach to unbind. The word also conveys that the identity itself is not destroyed.

### Decision 3: Keep "Confirm secret" field in all flows
**Choice:** Retain the confirm field even when re-attaching an existing identity.

**Alternatives considered:**
- *Drop confirm field for re-attach.* Rejected — the screen can't tell new vs. existing until submit; one mistyped char on re-attach already locks the user out (since recovery is impossible), so the typo guard is more valuable here than on signup.

**Rationale:** Cost is one extra field; benefit is preventing the worst possible outcome (typo → unrecoverable identity).

### Decision 4: Always include "nickname or secret" in recovery wording
**Choice:** Every place that previously said "if you lose your secret" or "your secret is the only key" is updated to say "if you forget your nickname or secret" / "only your nickname and secret unlock your identity".

**Rationale:** The backend keys the identity on the (nickname, secret) tuple. Forgetting either one is unrecoverable. Previous copy was technically incorrect and could mislead users into thinking the nickname was just a display label.

### Decision 5: Subscribe `BookmarksList` to `identityChangeBus`
**Choice:** Add a `useEffect` in `src/screens/BookmarksList/index.js` that calls `subscribeToIdentityChange(reload)` and returns the unsubscribe function — exactly the pattern used in `PhotosList`, `FriendsList`, and `WavesHub`.

**Alternatives considered:**
- *Reload on `uuid` atom change.* Rejected — the existing `useEffect([netAvailable, uuid])` doesn't fire on attach because `uuid` is generated locally up-front and may be the same value before and after attach (only the server-side binding changes).
- *Force a navigation reset on attach.* Rejected — heavyweight and would interrupt other in-progress UI.

**Rationale:** Use the established event bus pattern to stay consistent with the other three feeds. This is a minimal, well-understood fix.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Existing users may briefly be confused by the new "attach" terminology on the first launch after update. | Wording is descriptive enough to be self-explanatory ("Attach Identity to This Device" + subtitle). No data loss possible — purely cosmetic on the established-identity path. |
| Slight risk of regression in the success-toast logic (now branches on `nickNameEntered`). | Single-line ternary; covered by manual smoke test (attach + change-secret). |
| The `BookmarksList` reload on identity change could double-fire with the existing `[netAvailable, uuid]` effect on first attach. | `reload` is idempotent and gracefully cancels in-flight requests via the existing `useFeedLoader` hook. Worst case is one redundant network call on attach — acceptable. |
| Any other identity-dependent screen we forgot? | Audited: only `PhotosList`, `FriendsList`, `WavesHub`, `BookmarksList` consume identity-keyed feeds. Other screens that read `STATE.uuid` (e.g. `WaveDetail`, `WaveSettings`) either remount on navigation or don't display identity-keyed lists. |

## Migration Plan

No migration. Pure UI/copy change plus one event subscription. Ship in a single PR. No feature flag needed.
