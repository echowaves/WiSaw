# Cold Start Deep Link & Splash Screen Fix

## Problem Summary

1. **"Unmatched Root" Error**: Deep links on warm start were failing with routing errors
2. **Splash Screen Hang**: Cold start with deep links would get stuck on splash screen indefinitely

## Root Causes

### 1. Incorrect Route Paths

The deep link navigation was using absolute paths with group prefixes like `/(drawer)/(tabs)/shared/[photoId]`, which Expo Router doesn't recognize. Expo Router needs relative paths or href-style navigation objects.

### 2. Splash Screen Timing

The splash screen hiding logic was waiting for both `isAppReady` AND navigation readiness, but on cold starts, there could be delays that prevented proper initialization.

## Solutions Implemented

### 1. Fixed Deep Link Navigation (app/\_layout.tsx)

**Changed from absolute paths to href-style navigation:**

```typescript
// ❌ BEFORE - Incorrect absolute paths
router.push(`/(drawer)/(tabs)/shared/${linkData.photoId}`)
router.push(`/(drawer)/(tabs)/confirm-friendship/${linkData.friendshipUuid}`)
router.push('/(drawer)/friends')

// ✅ AFTER - Correct href-style navigation
router.push({
  pathname: '/shared/[photoId]',
  params: { photoId: linkData.photoId },
})
router.push({
  pathname: '/confirm-friendship/[friendshipUuid]',
  params: { friendshipUuid: linkData.friendshipUuid },
})
router.push('/friends')
```

### 2. Improved Splash Screen Management

**Three-tier safety system:**

1. **Normal hide**: When `isAppReady && (fontsLoaded || fontError)` → Hide splash
2. **Initialization timeout**: After 2.5s → Force `isAppReady = true`
3. **Emergency splash hide**: After 3s total → Force splash hide regardless of state

**Key changes:**

```typescript
// Reduced initialization timeout from 5s to 2.5s
const safetyTimeout = setTimeout(() => {
  if (isCancelled || hasMarkedReadyRef.current) return
  console.warn(
    '⏰ App initialization exceeded timeout (2.5s), forcing ready state',
  )
  markAppReady()
}, 2500)

// Emergency splash hide after 3s with state logging
const emergencyTimer = setTimeout(() => {
  console.warn('⚠️ Emergency splash hide triggered after 3 seconds')
  console.warn('Current state:', {
    isAppReady,
    fontsLoaded,
    fontError: !!fontError,
    canHideSplash,
  })
  SplashScreen.hideAsync().catch((error) => {
    console.error('❌ Emergency splash hide failed:', error)
  })
}, 3000)
```

### 3. Enhanced Deep Link Processing Logging

Added detailed logging to track deep link processing:

```typescript
console.log('🔄 Deep link processing check:', {
  hasLink: !!pendingDeepLinkRef.current,
  isNavigationReady,
  isAppReady,
})

if (!isNavigationReady) {
  console.log('⏳ Waiting for navigation to be ready...')
  return
}

if (!isAppReady) {
  console.log('⏳ Waiting for app to be ready...')
  return
}
```

## Testing Scenarios

### ✅ Cold Start with Deep Link

1. App opens from deep link (e.g., shared photo)
2. Splash screen shows
3. App initializes (loads preferences in parallel)
4. Splash hides within 3 seconds maximum
5. Navigation becomes ready
6. Deep link processed and user sees target screen

### ✅ Warm Start with Deep Link

1. App already running
2. Deep link received
3. Navigation immediately ready
4. Deep link processed instantly
5. User navigates to target screen

### ✅ Normal App Start (No Deep Link)

1. App opens normally
2. Splash screen shows
3. App initializes
4. Splash hides when ready
5. User sees home screen

## Performance Improvements

- **Parallel loading**: UUID, nickname, and theme preferences load concurrently using `Promise.allSettled()`
- **Faster timeouts**: Reduced from 5-6 seconds to 2.5-3 seconds
- **Graceful degradation**: Emergency timers ensure splash never hangs indefinitely

## Files Modified

- `app/_layout.tsx`: Main layout with deep link handling and splash management

## Code Quality

✅ Passed Codacy analysis (ESLint + Semgrep) with no issues

## Future Considerations

If the 3-second emergency timer still causes issues on slower devices:

- Consider device-specific timeouts based on platform
- Add telemetry to track actual initialization times
- Implement progressive loading UI instead of splash screen

---

**Last Updated**: October 4, 2025
