## Context

Friend names are stored locally via `expo-storage` (key `FRIENDSHIP-{uuid}`) and never sent to the server. The `Friendship` backend type has no name field. Despite this privacy-first design, the app has a "Share Name" action that leaks the user-assigned name via deep links (`wisaw://?type=friendship&data=...`). Additionally, the UX never explains why friends appear as "Unnamed Friend" or what to do about it.

Current components involved: `ShareFriendNameModal`, `PendingFriendsCard`, `FriendsExplainerView`, `FriendCard`, and deep link handlers in `app/_layout.tsx`, `app/friendships/name.tsx`, `src/utils/qrCodeHelper.js`, `src/utils/linkingHelper.js`.

## Goals / Non-Goals

**Goals:**
- Remove the "Share Name" action and all associated dead code (modal, deep link handlers, QR name helpers)
- Add privacy explanations at three touchpoints: empty-state tutorial, pending friends card, and unnamed friend cards
- Fix misleading pending friend messaging

**Non-Goals:**
- No changes to friendship invitation sharing flow (Share Link for pending friends stays)
- No backend changes
- No changes to how names are stored locally
- No changes to the name picker / edit name flow

## Decisions

### Decision 1: Remove ShareFriendNameModal and all deep link handling for friendship names

**Choice**: Delete `ShareFriendNameModal.js`, remove `friendshipName` case from `app/_layout.tsx`, remove `app/friendships/name.tsx`, remove QR name functions from `qrCodeHelper.js`, remove friendship name parsing from `linkingHelper.js`.

**Rationale**: The "Share Name" flow contradicts the privacy model. Names should never leave the device. Removing the entire flow eliminates dead code and prevents accidental name leakage. The invitation sharing flow (Share Link) uses a separate mechanism (`simpleSharingHelper`) and is unaffected.

### Decision 2: Unnamed friend subtitle on FriendCard (Option C)

**Choice**: Add a conditional subtitle line "Long-press to assign a name" on `FriendCard` only when `friend.contact` is null/undefined.

**Alternatives considered**: (A) inline explanation on every unnamed card — too verbose; (B) banner above the list — could be scrolled past and missed. Option C is minimal, actionable, and only appears when relevant.

### Decision 3: Privacy card in FriendsExplainerView using existing CARDS pattern

**Choice**: Add a fourth card to the existing `CARDS` array with icon `lock`, title "Private by Design", and the privacy explanation text.

**Rationale**: Reuses the existing card array pattern — no new component or layout needed.

## Risks / Trade-offs

- **[Low risk]** Users who previously used "Share Name" will no longer find it → This was a rarely-used feature and contradicts the privacy model
- **[Low risk]** Old deep links with `type=friendship&action=friendshipName` will silently fail → Acceptable since the feature is being removed. No crash — the link handler simply won't match.
