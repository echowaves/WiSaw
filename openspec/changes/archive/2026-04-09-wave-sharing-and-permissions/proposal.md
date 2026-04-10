## Why

WiSaw waves currently have no sharing, invitation, or permission model on the frontend. The backend (`wave-invite` branch) has fully implemented wave roles (owner/facilitator/contributor), invite tokens, open/closed wave joining, geo-bounded contributions, freeze logic, and content moderation — but none of this is surfaced in the mobile app. Users cannot share waves via QR codes or links, cannot join waves via deep links, and have no UI for managing wave members, reporting content, or controlling wave settings like freeze dates and geo boundaries.

## What Changes

- Add wave deep link routes (`/wave/join/{waveUuid}` for open waves, `/wave/invite/{token}` for invite-only waves) to the linking helper and Expo Router config
- Create a wave join confirmation screen that explains the wave photo-visibility contract before users join
- Build wave sharing UI (QR code + shareable link) reusing the existing `ShareOptionsModal` pattern, with different flows for open vs invite-only waves
- Add all missing GraphQL operations to the frontend: `createWaveInvite`, `revokeWaveInvite`, `joinWaveByInvite`, `joinOpenWave`, `assignFacilitator`, `removeFacilitator`, `removeUserFromWave`, `reportWavePhoto`, `dismissWaveReport`, `banUserFromWave`, `listWaveMembers`, `listWaveInvites`, `listWaveAbuseReports`, `listWaveBans`
- Extend `updateWave` mutation to include all new fields: `open`, `frozen`, `startDate`, `endDate`, `lat`, `lon`, `radius`
- Extend `createWave` mutation to include geo fields: `lat`, `lon`, `radius`
- Update `removePhotoFromWave` mutation to pass `uuid` (backend now requires it)
- Extend `listWaves` and wave detail queries to include new Wave fields: `open`, `frozen`, `startDate`, `endDate`, `isFrozen`, `isActive`, `myRole`, `joinUrl`, `location`, `radius`
- Build wave settings UI for owners: toggle open/closed, set start/end dates, set geo boundaries (map picker + radius), freeze/unfreeze
- Build wave member management UI: list members with roles, assign/remove facilitators, remove users
- Build wave moderation UI for facilitators: view reported photos, dismiss reports, ban users
- Enforce frozen-state restrictions in the UI: disable photo removal, photo deletion, comment add/delete when wave is frozen
- Guide facilitators to create an identity (secret) before performing moderation duties, with an explanation of why it's needed
- Show `myRole` context throughout wave screens (badge/label indicating owner/facilitator/contributor)

## Capabilities

### New Capabilities
- `wave-deep-linking`: Deep link routing for wave join and invite URLs, with join confirmation screen
- `wave-sharing`: QR code generation and shareable link creation for open and invite-only waves
- `wave-roles-ui`: Role-aware UI throughout wave screens — showing `myRole`, gating actions by permission level
- `wave-settings`: Owner-only wave configuration: open/closed toggle, start/end dates, geo boundaries (map picker + radius), freeze/unfreeze
- `wave-member-management`: List wave members, assign/remove facilitators, remove users from wave
- `wave-moderation`: Facilitator/owner content moderation — report queue, dismiss reports, delete reported photos, ban users
- `wave-frozen-enforcement`: Frontend enforcement of frozen-wave restrictions on photos, comments, and wave modifications
- `wave-graphql-operations`: All new and updated GraphQL mutations/queries to match the `wave-invite` backend schema
- `wave-facilitator-identity-gate`: Guide facilitators to create identity before performing moderation, with contextual explanation

### Modified Capabilities
- `deep-linking`: Add wave join and invite URL patterns to existing deep link routing
- `wave-detail`: Extend wave detail screen with role-based action visibility and frozen-state indicators
- `wave-edit-menu`: Extend edit menu with new settings (open/closed, dates, geo, freeze) for owners

## Impact

- **Routing**: `src/utils/linkingHelper.js` — new URL patterns; Expo Router linking config update
- **New screens**: Wave join confirmation, wave settings, wave members, wave moderation
- **GraphQL layer**: `src/screens/Waves/reducer.js` — 14+ new operations, 3 updated operations
- **State**: New Jotai atoms or local state for wave membership, role context
- **Components**: `ShareOptionsModal` pattern extended for waves; new `WaveShareModal`
- **Existing screens**: Wave detail and wave hub need role-aware rendering, frozen-state indicators
- **Dependencies**: `react-qr-code` (already installed), potentially `react-native-maps` for geo picker
- **Backend**: All changes already implemented on `echowaves/WiSaw.cdk` branch `wave-invite`
