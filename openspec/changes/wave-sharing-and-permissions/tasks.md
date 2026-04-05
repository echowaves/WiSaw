## 1. GraphQL Operations — Fix Breaking Changes & Extend Existing

- [x] 1.1 Update `removePhotoFromWave` mutation in `src/screens/Waves/reducer.js` to include `uuid` parameter (breaking schema change)
- [x] 1.2 Update all call sites of `removePhotoFromWave` to pass `uuid` (usePhotoActions, WaveDetail, QuickActionsModal)
- [x] 1.3 Extend `listWaves` query to request new Wave fields: `open`, `frozen`, `startDate`, `endDate`, `isFrozen`, `isActive`, `myRole`, `joinUrl`, `location`, `radius`
- [x] 1.4 Extend `createWave` mutation to accept optional `lat`, `lon`, `radius` parameters
- [x] 1.5 Extend `updateWave` mutation to accept `open`, `frozen`, `startDate`, `endDate`, `lat`, `lon`, `radius` parameters and return all extended Wave fields
- [x] 1.6 Extend `feedForWave` query response to include waveUuid context if needed for frozen checks

## 2. GraphQL Operations — New Wave Join & Invite

- [x] 2.1 Add `joinOpenWave` mutation (waveUuid, uuid → Wave)
- [x] 2.2 Add `joinWaveByInvite` mutation (inviteToken, uuid → Wave)
- [x] 2.3 Add `createWaveInvite` mutation (waveUuid, uuid, expiresAt?, maxUses? → WaveInvite)
- [x] 2.4 Add `revokeWaveInvite` mutation (inviteToken, uuid → Boolean)
- [x] 2.5 Add `listWaveInvites` query (waveUuid, uuid → [WaveInvite])

## 3. GraphQL Operations — New Member Management

- [x] 3.1 Add `listWaveMembers` query (waveUuid, uuid → [WaveMember])
- [x] 3.2 Add `assignFacilitator` mutation (waveUuid, targetUuid, uuid → Boolean)
- [x] 3.3 Add `removeFacilitator` mutation (waveUuid, targetUuid, uuid → Boolean)
- [x] 3.4 Add `removeUserFromWave` mutation (waveUuid, targetUuid, uuid → Boolean)

## 4. GraphQL Operations — New Moderation

- [x] 4.1 Add `reportWavePhoto` mutation (waveUuid, photoId, uuid → AbuseReport)
- [x] 4.2 Add `dismissWaveReport` mutation (reportId, uuid → Boolean)
- [x] 4.3 Add `banUserFromWave` mutation (waveUuid, targetUuid, uuid, reason? → Boolean)
- [x] 4.4 Add `listWaveAbuseReports` query (waveUuid, uuid → [AbuseReport])
- [x] 4.5 Add `listWaveBans` query (waveUuid, uuid → [WaveBan])

## 5. Deep Linking — Wave URL Routing

- [x] 5.1 Add `wave/join/{waveUuid}` and `wave/invite/{inviteToken}` patterns to `resolveDeepLinkTarget` in `src/utils/linkingHelper.js`
- [x] 5.2 Add wave deep link handling to `handleDeepLink` — navigate to wave join screen with appropriate params
- [x] 5.3 Update Expo Router linking config in `linkingHelper.js` to include wave join route

## 6. Wave Join Confirmation Screen

- [x] 6.1 Create `app/(drawer)/waves/join.tsx` route screen
- [x] 6.2 Implement open wave join flow: fetch wave info, display name + disclosure, call `joinOpenWave` on confirm
- [x] 6.3 Implement invite join flow: validate invite token, display wave name + disclosure, call `joinWaveByInvite` on confirm
- [x] 6.4 Handle error states: expired invite, max uses reached, banned user, wave not found
- [x] 6.5 Handle already-a-member case: skip join, navigate directly to wave detail
- [x] 6.6 Add photo-visibility disclosure text explaining wave/global feed relationship and freeze behavior

## 7. Wave Share Modal

- [x] 7.1 Create `src/components/WaveShareModal.js` component with QR code and share button
- [x] 7.2 Implement open wave mode: use `joinUrl` directly for QR and share
- [x] 7.3 Implement invite-only wave mode: call `createWaveInvite`, display deepLink QR and share
- [x] 7.4 Add optional expiration and max-uses controls for invite-only waves
- [x] 7.5 Integrate share modal trigger into wave detail header menu and wave hub context menu (owner + facilitator only)

## 8. Wave Roles UI

- [x] 8.1 Add role badge component for wave cards (Owner/Facilitator/Contributor)
- [x] 8.2 Display role badge on wave cards in Waves Hub
- [x] 8.3 Display role in wave detail header (subtitle or badge)
- [x] 8.4 Add frozen state indicator (icon/label) on wave cards and detail header
- [x] 8.5 Add active/inactive state indicator on wave cards
- [x] 8.6 Add frozen wave banner in wave detail screen when `isFrozen` is true

## 9. Role-Gated Menus

- [x] 9.1 Refactor wave detail header menu to conditionally show items based on `myRole`
- [x] 9.2 Add "Share Wave" menu item (owner + facilitator)
- [x] 9.3 Add "Manage Members" menu item (owner only)
- [x] 9.4 Add "Wave Settings" menu item (owner only)
- [x] 9.5 Add "Moderation" menu item (owner + facilitator)
- [x] 9.6 Add "Report Content" menu item (contributor)
- [x] 9.7 Refactor wave hub context menu to conditionally show items based on `myRole`
- [x] 9.8 Gate "Edit Wave" and "Delete Wave" menu items to owner only

## 10. Wave Settings Screen

- [x] 10.1 Create wave settings screen/modal accessible from wave detail menu
- [x] 10.2 Implement open/closed wave toggle calling `updateWave` with `open` param
- [x] 10.3 Implement start/end date pickers calling `updateWave` with `startDate`/`endDate` params
- [x] 10.4 Implement freeze/unfreeze toggle calling `updateWave` with `frozen` param, with confirmation dialog
- [x] 10.5 Implement geo boundary configuration: center point input + radius, calling `updateWave` with `lat`/`lon`/`radius`
- [x] 10.6 Disable non-freeze settings when wave is frozen, with explanatory notice

## 11. Wave Member Management Screen

- [x] 11.1 Create wave members screen showing member list grouped by role
- [x] 11.2 Implement "Make Facilitator" action for owner (calls `assignFacilitator`)
- [x] 11.3 Implement "Remove Facilitator" action for owner (calls `removeFacilitator`)
- [x] 11.4 Implement "Remove from Wave" action for owner/facilitator (calls `removeUserFromWave`)
- [x] 11.5 Implement invite management section for invite-only waves: list invites, revoke invites
- [x] 11.6 Implement banned users list section (calls `listWaveBans`)

## 12. Wave Moderation Screen

- [x] 12.1 Create moderation screen showing reported photos queue
- [x] 12.2 Implement "Dismiss" report action (calls `dismissWaveReport`)
- [x] 12.3 Implement "Delete from Wave" action on reported photo (calls `removePhotoFromWave`)
- [x] 12.4 Implement "Ban User" action from report or member list (calls `banUserFromWave`)
- [x] 12.5 Implement facilitator identity gate: check for stored nickname, show identity-required card if missing

## 13. Frozen State Enforcement

- [x] 13.1 In wave detail photo actions, hide/disable remove-from-wave for non-owners when wave is frozen
- [x] 13.2 In photo actions (all screens), hide/disable delete for photos in frozen waves (except owner)
- [x] 13.3 In photo detail/comments, disable comment add/delete for photos in frozen waves
- [x] 13.4 In global feed, check if viewed photo belongs to a frozen wave and apply restrictions
- [x] 13.5 Show explanatory toasts/notices when frozen-state actions are blocked
