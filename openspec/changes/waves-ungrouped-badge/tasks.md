## 1. Drawer Badge

- [x] 1.1 Create `WavesDrawerIcon` inline component in `app/(drawer)/_layout.tsx` that reads `STATE.ungroupedPhotosCount`, renders `FontAwesome5` water icon with a positioned numeric badge (hidden when count is 0 or null, capped at "99+")
- [x] 1.2 Update the Waves `Drawer.Screen` options to use `WavesDrawerIcon` as `drawerIcon`

## 2. Kebab Badge Cap

- [x] 2.1 Cap the kebab menu badge text in `app/(drawer)/waves/index.tsx` to display "99+" when `ungroupedCount` exceeds 99
