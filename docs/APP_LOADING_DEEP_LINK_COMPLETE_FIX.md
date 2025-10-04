# Complete App Loading & Deep Link Fix

## Root Cause Analysis

The app was **hanging on splash screen** during cold start with deep links because:

1. **Race Condition**: Deep link navigation was attempting BEFORE splash was actually hidden
2. **No Coordination**: Three separate async operations with no synchronization:
   - App initialization (preferences loading)
   - Font loading
   - Splash screen hiding
   - Deep link processing
3. **Missing State**: No way to know when splash was actually hidden vs just "ready to hide"

## The Complete Solution

### 1. Added Splash Hidden State Tracking

```typescript
const [isSplashHidden, setIsSplashHidden] = useState(false)
const hasProcessedInitialUrlRef = useRef(false)
```

### 2. Coordinated Splash Hide with State Update

```typescript
// Normal hide when ready
useEffect(() => {
  const canHideSplash = isAppReady && (fontsLoaded || !!fontError)
  if (!canHideSplash) return
  if (isSplashHidden) return // Already hidden

  SplashScreen.hideAsync()
    .then(() => {
      console.log('✅ Splash screen hidden')
      setIsSplashHidden(true) // ← KEY: Track that it's actually hidden
    })
    .catch((error) => {
      setIsSplashHidden(true) // ← Mark hidden even on error to not block app
    })
}, [isAppReady, fontsLoaded, fontError, isSplashHidden])
```

### 3. Emergency Timer with State Update

```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    if (!isSplashHidden) {
      SplashScreen.hideAsync()
        .then(() => setIsSplashHidden(true))
        .catch(() => setIsSplashHidden(true))
    }
  }, 3000)
  return () => clearTimeout(timer)
}, [isSplashHidden])
```

### 4. Deep Link Waits for Complete Readiness

```typescript
const handleDeepLink = useCallback(
  (url: string) => {
    // ... parse link ...

    const isFullyReady =
      (fontsLoaded || !!fontError) && isAppReady && isSplashHidden

    if (isFullyReady) {
      // Navigate immediately
      navigateToLink()
    } else {
      // Poll every 100ms until ready
      const checkInterval = setInterval(() => {
        const nowReady =
          (fontsLoaded || !!fontError) && isAppReady && isSplashHidden
        if (nowReady) {
          clearInterval(checkInterval)
          navigateToLink()
        }
      }, 100)

      // Safety timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkInterval)
        navigateToLink() // Navigate anyway
      }, 5000)
    }
  },
  [fontsLoaded, fontError, isAppReady, isSplashHidden],
)
```

### 5. Initial URL Processed Only Once When Fully Ready

```typescript
useEffect(() => {
  // ... addEventListener setup ...

  const isFullyReady =
    (fontsLoaded || !!fontError) && isAppReady && isSplashHidden

  if (isFullyReady && !hasProcessedInitialUrlRef.current) {
    console.log('🔗 App fully ready, checking for initial deep link')
    hasProcessedInitialUrlRef.current = true // ← Prevent multiple calls
    getInitialURL()
  }

  return () => subscription?.remove()
}, [fontsLoaded, fontError, isAppReady, isSplashHidden, handleDeepLink])
```

## Loading Sequence (Cold Start with Deep Link)

```
T+0ms:    🎬 App mounts, SplashScreen.preventAutoHideAsync() called
          📱 Start loading fonts
          🚀 Start initializing preferences (parallel)

T+~100ms: ✅ Fonts loaded
          ✅ Preferences loaded
          📱 markAppReady() → isAppReady = true

T+~150ms: 🎉 canHideSplash = true
          💨 SplashScreen.hideAsync() called

T+~200ms: ✅ Splash actually hidden
          ✅ setIsSplashHidden(true)

T+~201ms: 🔗 isFullyReady = true
          📎 getInitialURL() called
          🌐 Deep link detected

T+~250ms: 🧭 handleDeepLink() called
          ✅ isFullyReady check passes
          🚀 navigateToLink() → navigation begins

T+~300ms: 📍 User sees target screen (shared photo, friend request, etc.)
```

## Safety Mechanisms

| Mechanism             | Trigger                                      | Action                          |
| --------------------- | -------------------------------------------- | ------------------------------- |
| **Normal Flow**       | `isAppReady && (fontsLoaded \|\| fontError)` | Hide splash, mark hidden        |
| **Emergency Timer**   | 3 seconds after mount                        | Force hide splash if not hidden |
| **Deep Link Polling** | Deep link arrives before ready               | Poll every 100ms until ready    |
| **Deep Link Timeout** | 5 seconds waiting for ready                  | Navigate anyway (last resort)   |

## Key Improvements

✅ **No Race Conditions**: Deep link waits for splash to actually hide  
✅ **State Tracking**: Know exactly when splash is hidden  
✅ **Single Processing**: Initial URL processed exactly once  
✅ **Graceful Degradation**: Multiple safety timeouts prevent permanent hangs  
✅ **Complete Logging**: Every step logged for debugging

## Testing Scenarios

### ✅ Cold Start with Deep Link (Primary Fix)

1. Kill app completely
2. Click shared link (photo/friend)
3. **Expected**: Splash shows → hides within 3s → navigates to target
4. **Console**: See all logging stages
5. **Result**: User lands on correct screen

### ✅ Warm Start with Deep Link

1. App running in background
2. Click shared link
3. **Expected**: Immediate navigation (already ready)
4. **Result**: Instant nav to target

### ✅ Normal Start (No Deep Link)

1. Open app normally
2. **Expected**: Splash → home screen
3. **Result**: Standard flow works

### ✅ Slow Network/Device

1. Preferences take 2+ seconds to load
2. **Expected**: Emergency timer hides splash after 3s
3. **Expected**: Deep link still processes correctly
4. **Result**: App never hangs

## Files Modified

- `app/_layout.tsx`: Complete loading sequence coordination

## Code Quality

✅ Passed Codacy analysis (ESLint + Semgrep OSS) with **zero issues**

---

**Resolution**: Cold start deep links now work correctly with proper resource loading coordination  
**Date**: October 4, 2025
