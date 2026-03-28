## Why

Multiple screens crash or show raw network errors when the app starts in airplane mode or loses connectivity. Network state is tracked independently in 3 places (PhotosList, WaveDetail, UploadContext) via separate `NetInfo.addEventListener` calls. Most screens (Chat, WavesHub, FriendsList, Secret, Feedback, PhotosDetailsShared, PhotoSelectionMode, ConfirmFriendship) have zero offline protection — they fire API calls that fail with unhandled `TypeError: Network request failed`. `getZeroMoment()` also fires a GraphQL call unconditionally, producing console errors on startup.

## What Changes

- Add a global `STATE.netAvailable` Jotai atom with a single `NetInfo` listener in the root layout
- Remove local `NetInfo` listeners from PhotosList, WaveDetail, and UploadContext — all read the atom instead
- Guard `getZeroMoment()` to skip the GraphQL call when offline (return `0`)
- Add in-place offline cards to all screens that make network calls: Chat, WavesHub, FriendsList, Secret, Feedback, PhotosDetailsShared, PhotoSelectionMode, ConfirmFriendship
- Disable drawer navigation items (Identity, Friends, Waves, Feedback) when offline
- PhotosList already has an offline card — migrate it to use the atom

## Capabilities

### New Capabilities
- `offline-guard`: Global network state management and offline UI policy. Defines the Jotai atom, the single-listener pattern, and the requirement that every screen with network calls SHALL show an offline card when disconnected.

### Modified Capabilities
- `photo-feed`: PhotosList SHALL read `STATE.netAvailable` atom instead of using a local `useNetworkStatus` hook. `getZeroMoment()` SHALL skip the GraphQL call when offline.
- `wave-detail`: WaveDetail SHALL read `STATE.netAvailable` atom instead of its own `NetInfo` listener.
- `wave-hub`: WavesHub SHALL show an offline card when `netAvailable` is `false`.
- `chat-messaging`: Chat SHALL show an offline card when `netAvailable` is `false`.
- `friendships`: FriendsList SHALL show an offline card when `netAvailable` is `false`.
- `user-identity`: Secret SHALL show an offline card when `netAvailable` is `false`.
- `user-feedback`: Feedback SHALL show an offline card and disable submission when `netAvailable` is `false`.
- `upload-orchestration`: UploadContext SHALL read `STATE.netAvailable` atom instead of its own `NetInfo` listener.

## Impact

- `src/state.js` — new `netAvailable` atom
- `app/_layout.tsx` — single NetInfo listener setting the atom
- `src/screens/PhotosList/index.js` — remove `useNetworkStatus` import, read atom
- `src/screens/PhotosList/hooks/useNetworkStatus.js` — delete file (no longer needed)
- `src/screens/PhotosList/reducer.js` — guard `getZeroMoment()`
- `src/screens/WaveDetail/index.js` — remove local NetInfo, read atom
- `src/contexts/UploadContext.js` — remove local NetInfo, read atom
- `src/screens/Chat/index.js` — add offline guard
- `src/screens/WavesHub/index.js` — add offline guard
- `src/screens/FriendsList/index.js` — add offline guard
- `src/screens/Secret/index.js` — add offline guard
- `src/screens/Feedback/index.js` — add offline guard
- `src/screens/PhotosDetailsShared/index.js` — add offline guard
- `src/screens/PhotoSelectionMode/index.js` — add offline guard
- `app/(drawer)/(tabs)/confirm-friendship/[friendshipUuid].tsx` — add offline guard
- `app/(drawer)/_layout.tsx` — disable drawer items when offline
