## 1. Identity screen copy & labels (`src/screens/Secret/index.js`)

- [x] 1.1 Change attach-flow header title from "Create Your Anonymous Identity" to "Attach Identity to This Device"
- [x] 1.2 Replace attach-flow subtitle with text explaining the form handles both new identities and reconnecting on a new device (same nickname + secret work anywhere)
- [x] 1.3 Change submit button label from "Create Identity" / "Creating..." to "Attach Identity" / "Attaching..." and update the icon from `user-shield` to `link`
- [x] 1.4 Make the post-submit success toast subtitle context-aware: "Identity attached to this device." when `nickNameEntered` was false, "Your secret has been updated." when true
- [x] 1.5 Rename the destructive action row from "Reset Identity" to "Detach from This Device" and change the icon from `redo` to `unlink`
- [x] 1.6 Update the destructive confirmation alert: title "Detach Identity from This Device?", body explaining device-only effect plus nickname-or-secret recovery wording, button label "Detach"
- [x] 1.7 Update the post-detach toast: title "Identity detached", subtitle prompts user to enter nickname and secret to re-attach

## 2. Privacy explainer (`src/screens/Secret/components/PrivacyExplainerView.js`)

- [x] 2.1 Update header subtitle to "Before you attach your identity, here is how we protect your privacy."
- [x] 2.2 Update Card 1 body to mention the identity exists "as a nickname-and-secret pair you control" instead of "only on your device"
- [x] 2.3 Rename Card 2 to "Your Secret Travels With You" and rewrite body to describe re-attach on any device using the same nickname and secret
- [x] 2.4 Rename Card 3 to "Only You Can Restore It" and rewrite body to mention "only your nickname and secret unlock your identity" and "if either is lost, the identity is unreachable forever"

## 3. Privacy notice card (`src/screens/Secret/components/PrivacyNoticeCard.js`)

- [x] 3.1 Replace the bullet list with the four bullets specified in `specs/identity-profile-card/spec.md` (nickname+secret are the identity; same pair works anywhere; forget nickname OR secret → unrecoverable; detach is non-destructive)

## 4. Identity profile card (`src/screens/Secret/components/IdentityProfileCard.js`)

- [x] 4.1 Change the status badge text from "Identity active" to "Attached to this device"

## 5. Bookmarks reload on identity change (`src/screens/BookmarksList/index.js`)

- [x] 5.1 Import `subscribeToIdentityChange` from `../../events/identityChangeBus`
- [x] 5.2 Add a `useEffect` after the initial-load effect that subscribes `reload` and returns the unsubscribe function (mirror the pattern in `src/screens/PhotosList/index.js`)

## 6. Verification

- [x] 6.1 Run `get_errors` on the five touched files; confirm no new compile/lint errors are introduced
- [ ] 6.2 Manual smoke test on a development build: attach a new identity → verify Bookmarks, Friends, Photos, Waves all populate without app restart
- [ ] 6.3 Manual smoke test: attach an *existing* identity (re-enter known nickname + secret) → verify identity is restored and feeds populate
- [ ] 6.4 Manual smoke test: tap "Detach from This Device", confirm alert copy matches spec, complete detach → verify all identity-keyed feeds clear
- [ ] 6.5 Manual smoke test: change secret on the active-identity view → verify success toast reads "Your secret has been updated."
- [x] 6.6 Run `openspec validate improve-identity-screen-ux --strict` and confirm it passes
