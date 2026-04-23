## REMOVED Requirements

### Requirement: Photo detail modal route
**Reason**: Replaced by inline expansion using masonry layout's native expand API. The `/photo-detail` fullScreenModal route and `photoDetailAtom` are no longer needed.
**Migration**: Photo detail viewing is handled inline in the masonry grid. Remove `app/photo-detail.tsx`, `photoDetailAtom` from `src/state.js`, and the Stack.Screen entry from `app/_layout.tsx`.
