## 1. Update WavesDrawerIcon badge

- [x] 1.1 In `app/(drawer)/_layout.tsx`, remove the `badgeText` computation from `WavesDrawerIcon`
- [x] 1.2 Replace the numbered badge View+Text with an 8×8 red dot View (matching `IdentityDrawerIcon` dot style: `position: 'absolute', top: 0, right: 0, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF3B30'`)
- [x] 1.3 Remove the `Text` import if it is no longer used elsewhere in the drawer icon components

## 2. Verify

- [x] 2.1 Confirm the badge is hidden when `ungroupedPhotosCount` is 0 or null
- [x] 2.2 Confirm the badge appears as a red dot (no number) when `ungroupedPhotosCount` > 0
