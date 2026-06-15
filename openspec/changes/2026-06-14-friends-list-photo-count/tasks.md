## Tasks

### 1. Update GraphQL Query
- [x] 1.1 Add `photosCount` field to `getFriendshipsList` query in `src/screens/FriendsList/friends_helper.js`
- [x] 1.2 Verify query returns `photosCount` for each friendship

### 2. Update FriendCard Component
- [x] 2.1 Extract `photoCount` from friend prop (`const photoCount = friend.photosCount ?? 0`)
- [x] 2.2 Wrap friend name in `nameRow` View container
- [x] 2.3 Add `metaRow` View below name with photo count Text
- [x] 2.4 Add new styles: `nameRow`, `metaRow`, `photoCount`

### 3. Testing
- [x] 3.1 Test with friend having 0 photos (display "0 photos")
- [x] 3.2 Test with friend having 1 photo (display "1 photo")
- [x] 3.3 Test with friend having multiple photos (display "N photos")
- [x] 3.4 Test with pending friendship (uuid2 === null) - verify count displays
- [x] 3.5 Compare visual design to WaveCard - ensure identical layout

### 4. Validation
- [x] 4.1 Run `npm run lint` - no errors
- [x] 4.2 Test on iOS simulator - verify layout
- [x] 4.3 Test on Android emulator - verify layout
- [x] 4.4 Verify no console errors when `photosCount` is null/undefined
