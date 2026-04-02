## 1. Data Layer

- [x] 1.1 Create `src/screens/FriendDetail/reducer.js` with `fetchFriendPhotos` function calling `feedForFriend` GraphQL query (same photo fields as `feedForWave`)

## 2. Friend Detail Screen

- [x] 2.1 Create `src/screens/FriendDetail/index.js` following the `WaveDetail` pattern: paginated fetch, `PhotosListMasonry` rendering, `usePhotoExpansion`, empty state — without camera footer, wave modals, or bus listeners
- [x] 2.2 Add kebab menu via `useImperativeHandle` exposing `showHeaderMenu` with Edit Name and Remove Friend actions using `ActionMenu`

## 3. Route

- [x] 3.1 Create `app/friendships/_layout.tsx` with a Stack navigator for friendship routes
- [x] 3.2 Create `app/friendships/[friendUuid].tsx` route screen with `AppHeader` showing friend name and kebab menu button, rendering `FriendDetail`
