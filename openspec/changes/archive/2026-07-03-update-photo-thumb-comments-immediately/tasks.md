## 1. Update useFeedLoader to handle photo refresh events

- [x] 1.1 Import `subscribeToPhotoRefresh` from `../events/photoRefreshBus`
- [x] 1.2 Add useEffect subscription to fetch updated photo data when photo refresh event is received
- [x] 1.3 Update photosList with fresh comment data (commentsCount, watchersCount, lastComment)
- [x] 1.4 Ensure subscription is cleaned up on unmount (return cleanup function)

## 2. Update reducer emitPhotoComment calls

- [x] 2.1 Remove emitPhotoComment calls from submitComment and deleteComment
- [x] 2.2 Use existing emitPhotoRefresh already called in Photo component
- [x] 2.3 Verify no duplicate emit calls

## 3. Verify Photo component already emits refresh events

- [x] 3.1 Check `src/components/Photo/index.js` for emitPhotoRefresh calls
- [x] 3.2 Verify emitPhotoRefresh is called after comment submission and deletion
- [x] 3.3 Confirm both onSubmitEditing and onBlur submit paths trigger the event

## 6. Testing and verification

- [x] 6.1 Test adding a comment in main feed - verify thumb updates immediately
- [x] 6.2 Test deleting a comment in main feed - verify thumb updates immediately
- [x] 6.3 Test in Wave Detail screen - verify thumb updates
- [x] 6.4 Test in Friend Detail screen - verify thumb updates
- [x] 6.5 Test in Bookmarks screen - verify thumb updates
- [x] 6.6 Test pull-to-refresh still works (backward compatibility)
- [x] 6.7 Verify no console errors when comments are added/deleted
- [x] 6.8 Verify watcher count updates when comment is added (via auto-watch)

## 7. Code quality

- [ ] 7.1 Run `npm run lint` - verify no new errors
- [ ] 7.2 Run `npm test` - verify existing tests still pass
- [ ] 7.3 Check for memory leaks (subscription cleanup verified)
- [x] 7.4 Verify max cyclomatic complexity is 8 or less (refactor if needed)"}