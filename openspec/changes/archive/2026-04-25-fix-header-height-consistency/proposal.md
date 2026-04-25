## Why

AppHeader applies safe area insets to all edges (including bottom ~34px on modern iPhones), creating a visible gap between the header and content on every screen that uses it. The landing page (PhotosListHeader) correctly uses `SafeAreaView edges={['top']}` and looks right. All other screens use AppHeader with full-edge SafeAreaView, producing an inconsistent, oversized header. The content height also differs (60px on landing vs ~80px effective on AppHeader).

## What Changes

- Fix AppHeader to use `SafeAreaView edges={['top']}` instead of unrestricted SafeAreaView, eliminating the bottom safe area padding that causes the gap
- Standardize the content area height to match the landing page header (60px)
- Remove the `safeTopOnly` prop from AppHeader since it becomes unnecessary when edges are always `['top']`
- Clean up the NamePicker call site that was the sole consumer of `safeTopOnly`

## Capabilities

### New Capabilities

_None — this is a fix to existing behavior._

### Modified Capabilities

- `safeareaview-migration`: The requirement for AppHeader SafeAreaView behavior changes from "all-edge insets" to "top-only insets" to match the landing page header

## Impact

- `src/components/AppHeader/index.tsx` — SafeAreaView edges, content height, remove safeTopOnly prop
- `src/components/NamePicker/index.js` — remove safeTopOnly usage
- All screens using AppHeader get consistent header height automatically (Identity, Friends, Waves, Bookmarks, Feedback, Shared Photo, etc.)
- `src/theme/sharedStyles.js` — HEADER_HEIGHTS constants may need alignment
- `src/utils/navigationStyles.js` — getDefaultScreenOptions may need height alignment
