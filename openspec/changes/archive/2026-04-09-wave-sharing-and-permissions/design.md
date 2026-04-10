## Context

WiSaw is a location-based anonymous social photo sharing app built with React Native / Expo Router. The backend (AWS AppSync + PostgreSQL via CDK) has a fully implemented wave permissions and sharing system on the `wave-invite` branch, including: role-based access (owner/facilitator/contributor), invite tokens for private waves, open wave joining, geo-bounded contributions, freeze/unfreeze logic, and content moderation (report, dismiss, ban). The frontend currently has basic wave CRUD, photo assignment, and masonry display — but zero awareness of roles, invitations, sharing, or frozen state enforcement.

The existing deep linking system handles `photos/:id` and `friends/:friendshipUuid` routes. The existing `ShareOptionsModal` component provides QR code + share-link UI for friendship invitations. Both serve as proven patterns to extend.

All users are anonymous — identified by a device UUID stored in `expo-secure-store`. Identity (nickname + secret) is optional and managed via the existing Identity screen.

## Goals / Non-Goals

**Goals:**
- Surface all backend wave capabilities in the frontend
- Enable wave sharing via QR codes and shareable deep links (email, SMS, messaging apps)
- Allow users to join waves by scanning QR or tapping a deep link, with a confirmation screen explaining the photo-visibility contract
- Show role-aware UI throughout wave screens (what you can do depends on owner/facilitator/contributor)
- Enforce frozen-state restrictions in the UI so users get clear feedback before hitting backend errors
- Guide facilitators to create an identity before performing moderation duties
- Extend the existing deep linking system with wave-specific URL patterns

**Non-Goals:**
- Backend changes — everything is already implemented on `wave-invite` branch
- Push notification integration for wave events (future work)
- Real-time wave membership updates via subscriptions (future work)
- Map-based wave discovery / browsing (future work)
- Wave search by location (future work)

## Decisions

### Decision 1: Deep link URL pattern handling

**Choice**: Extend `resolveDeepLinkTarget` in `linkingHelper.js` with two new route patterns:
- `/wave/join/{waveUuid}` → `{ type: 'wave-join', waveUuid }`
- `/wave/invite/{inviteToken}` → `{ type: 'wave-invite', inviteToken }`

**Rationale**: Follows the existing pattern for `photos/:id` and `friends/:friendshipUuid`. The linking helper already handles both custom scheme (`wisaw://`) and universal link (`https://link.wisaw.com/`) URLs with the same `resolveDeepLinkTarget` function.

**Alternative considered**: Using Expo Router's built-in linking config to auto-map URLs to file-based routes. Rejected because the current codebase uses manual deep link parsing for reliability and has established patterns for cold/warm start handling.

### Decision 2: Wave join confirmation as a new Expo Router screen

**Choice**: Create a new screen at `app/(drawer)/waves/join.tsx` that receives `waveUuid` or `inviteToken` as search params. This screen fetches wave details (or validates the invite), displays the photo-visibility contract, and calls `joinOpenWave` or `joinWaveByInvite` on confirmation.

**Rationale**: Keeps navigation within the Expo Router file-based system. The join screen needs to be accessible via deep link navigation (from `handleDeepLink`) and can also be pushed programmatically from within the app.

**Alternative considered**: Modal overlay instead of a full screen. Rejected because the join confirmation includes important legal/behavioral disclaimers that deserve a full screen treatment, and the flow needs to handle error states (banned, expired invite, etc.).

### Decision 3: Wave sharing modal — single component, two modes

**Choice**: Create a `WaveShareModal` component that adapts based on wave type:
- **Open wave**: Displays the `joinUrl` from the Wave object directly. QR encodes it. Share button sends it.
- **Invite-only wave**: Calls `createWaveInvite` mutation to generate a token, then displays the returned `deepLink`. Optionally allows setting `expiresAt` and `maxUses`.

**Rationale**: The UX is identical from the user's perspective — scan QR or share link. The only difference is where the URL comes from. A single component keeps the codebase clean.

**Alternative considered**: Separate components for open/invite sharing. Rejected — too much duplication for the same UX.

### Decision 4: GraphQL operations — centralize in Waves reducer

**Choice**: Add all new GraphQL operations to `src/screens/Waves/reducer.js` (and re-export from wave detail/hub reducers as needed). Group them logically:
- Wave join: `joinOpenWave`, `joinWaveByInvite`
- Invites: `createWaveInvite`, `revokeWaveInvite`, `listWaveInvites`
- Members: `listWaveMembers`, `assignFacilitator`, `removeFacilitator`, `removeUserFromWave`
- Moderation: `reportWavePhoto`, `dismissWaveReport`, `banUserFromWave`, `listWaveAbuseReports`, `listWaveBans`

**Rationale**: Follows existing convention — all wave GraphQL operations live in the Waves reducer. The re-export pattern from wave detail/hub reducers is already established.

### Decision 5: Role-aware UI — use `myRole` from Wave object

**Choice**: The backend already returns `myRole` on every wave in `listWaves`. Use this field to conditionally render UI elements:
- Owner sees: settings, share, member management, all photo actions (even on frozen)
- Facilitator sees: share (invite-only), moderation, photo actions (unfrozen only)
- Contributor sees: add photos, remove own photos (unfrozen only), report content

Store `myRole` as part of wave state. No separate role-fetching query needed.

**Rationale**: `listWaves` already JOINs `WaveUsers` to return `myRole`. Avoids extra network calls.

### Decision 6: Wave settings — extend existing edit modal

**Choice**: Extend the existing wave edit modal/flow (currently just name + description) to include toggle for open/closed, date pickers for start/end dates, freeze/unfreeze toggle, and a map picker for geo boundaries. All changes go through the existing `updateWave` mutation with additional parameters.

**Rationale**: Reuses the existing UI pattern. The `updateWave` backend mutation already accepts all these fields.

### Decision 7: Frozen state UI enforcement — optimistic blocking

**Choice**: Check `isFrozen` (returned by backend) on the Wave object before allowing:
- Photo removal from wave
- Photo deletion (if photo belongs to frozen wave)
- Comment creation/deletion on photos in frozen waves
- Any wave setting changes (except freeze toggle + endDate, owner only)

Show toast or disabled state to explain why the action is blocked.

**Rationale**: Prevents unnecessary backend round-trips and confusing error messages. The backend enforces these rules as well, providing defense in depth.

### Decision 8: Facilitator identity gate — inline prompt

**Choice**: When a facilitator without an identity attempts a moderation action (dismiss report, ban user, delete reported photo), show an inline card explaining that identity is required for accountability, with a button to navigate to the Identity screen. After identity creation, return to the wave screen.

**Rationale**: Non-blocking for the facilitator role assignment itself (the owner assigns facilitator freely). Only blocks moderation *actions* until identity is established. This matches the user's requirement that "the facilitator should not be able to perform duties until creating an identity."

### Decision 9: `removePhotoFromWave` — add uuid parameter

**Choice**: Update the frontend `removePhotoFromWave` mutation to include `uuid` in both the GraphQL query and the function call. The backend now requires it for permission checking (contributor can only remove own photos).

**Rationale**: Direct schema alignment. Breaking change on backend that frontend must match.

### Decision 10: Non-member wave deep link — join-first flow

**Choice**: When a non-member accesses a wave deep link, navigate to the join confirmation screen. Do NOT show wave photos until the user has joined. After successful join, navigate to the wave detail screen.

**Rationale**: Per user requirement. Photos are globally visible in the feed anyway, but the wave view is a membership gate.

## Risks / Trade-offs

**[Risk] Large scope in a single change** → Mitigated by clear capability boundaries in specs and a well-ordered task list. GraphQL operations can be added incrementally, with each UI feature building on them.

**[Risk] `removePhotoFromWave` breaking change** → The mutation signature changed (added `uuid`). This will break immediately when the backend `wave-invite` branch is deployed. Mitigation: prioritize this fix in task ordering.

**[Risk] Geo boundary map picker complexity** → `react-native-maps` adds native dependencies and build complexity. Mitigation: If map picker proves too complex, fall back to manual lat/lon/radius input fields as a first pass, with map UI as a follow-up.

**[Risk] Deep link cold start race condition** → The existing deep linking code already handles this with router-ready checks. New wave routes use the same mechanism, so no additional risk.

**[Risk] Facilitator identity check timing** → The backend enforces `_assertHasSecret` at the resolver level. If the frontend gate is bypassed, the backend still blocks. Defense in depth.

**[Trade-off] No real-time membership sync** → Wave member list won't auto-update when new members join. Users must pull-to-refresh. Acceptable for initial release; subscriptions can be added later.
