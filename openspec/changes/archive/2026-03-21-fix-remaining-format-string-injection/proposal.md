## Why

Codacy/Opengrep continues to flag non-literal format strings across the codebase (`javascript.lang.security.audit.unsafe-formatstring`). The initial fix addressed `photoListHelpers.js`; 12 instances remain in 5 other files. Completing this eliminates the finding project-wide.

## What Changes

- Replace all 12 remaining template-literal-based `console.log`, `console.warn`, and `console.error` calls with parameterized format strings using `%s` / `%d` substitution tokens
- Files affected:
  - `src/screens/PhotosList/upload/photoUploadService.js` — 5 instances
  - `src/screens/Chat/useChatSubscription.js` — 3 instances
  - `src/screens/FriendsList/index.js` — 1 instance
  - `src/screens/FriendsList/friends_helper.js` — 2 instances
  - `src/components/ExpandableThumb/index.js` — 1 instance

## Capabilities

### New Capabilities

### Modified Capabilities

- `secure-logging`: Extending the parameterized format string requirement to cover all remaining files beyond `photoListHelpers.js`

## Impact

- 5 source files updated — all changes are to diagnostic console output only
- No production behavior, API, or dependency changes
