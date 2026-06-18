## 1. Implementation

- [x] 1.1 Verify waves navigation - found that `waveUuid` was NOT passed in params (added fix)
- [x] 1.2 In `src/screens/WavesHub/index.js`, add `waveUuid` to the params object in `handleWavePress` function
- [x] 1.3 Verify friends navigation - found that `friendUuid` was NOT passed in params (added fix)
- [x] 1.4 In `src/screens/FriendsList/index.js`, add `friendUuid: friendUserUuid` to the params object in `handleFriendPress` function
- [x] 1.5 Added debugging to `WavesHub`, `FriendDetail`, `WaveDetail`, `fetchFriendPhotos`, `fetchWavePhotos`, and `useFeedLoader`
- [x] 1.6 Added debugging to verify params are passed correctly
- [x] 1.7 Backend: Fixed `feedForFriend` resolver in `Wisaw.cdk/lambda-fns/controllers/friendships/feedForFriend.ts` to JOIN with Watchers table
- [x] 1.8 Frontend: Added `useEffect` to trigger initial reload on mount in `FriendDetail` and `WaveDetail`
- [x] 1.9 Test: Click on a photo in a friend card's photo strip
- [x] 1.9 Verify: FriendDetail screen loads and shows photos from that friend
- [x] 1.9 Test: Click on a photo in a wave card's photo strip
- [x] 1.10 Verify: WaveDetail screen loads and shows photos from that wave
- [x] 1.11 Test: Click on a friend card (not photo strip) to verify info area navigation still works
- [x] 1.12 Test: Friend with no photos shows correct empty state with "No Photos Yet"
