## 1. Move Route File

- [x] 1.1 Move `app/(drawer)/(tabs)/modal-input.tsx` to `app/modal-input.tsx`

## 2. Update Layouts

- [x] 2.1 Register `modal-input` screen in root `app/_layout.tsx` Stack with `presentation: 'modal'` and `headerShown: false`
- [x] 2.2 Remove `<Stack.Screen name='modal-input' />` from `app/(drawer)/(tabs)/_layout.tsx`

## 3. Verification

- [x] 3.1 Verify `router.push` call in Photo component resolves to the new route (no pathname change needed)
- [x] 3.2 Run Codacy analysis on modified files
