# Deep Link & Splash Screen Fix - Final Solution

## Problem Summary

1. **"Unmatched Root" Error**: Deep links failed with routing errors
2. **Splash Screen Hang**: Cold start with deep links got stuck on splash screen

## Root Cause

The implementation was trying to use:

- Reactive URL hook (`Linking.useURL()`)
- Complex navigation readiness checks
- Wrong path formats (href-style objects or absolute paths with groups)

This created a **deadlock** where:

- Splash waited for navigation to be ready
- Navigation couldn't initialize properly
- Deep links couldn't be processed

## Solution (Based on Working Commit db5fa1b)

Reverted to the proven pattern that works:

### 1. Separate Cold vs Warm Start Handling

```typescript
useEffect(() => {
  // COLD START: Use getInitialURL()
  const getInitialURL = async () => {
    const initialUrl = await Linking.getInitialURL()
    if (initialUrl) {
      handleDeepLink(initialUrl)
    }
  }

  // WARM START: Use addEventListener()
  const subscription = Linking.addEventListener('url', (event) => {
    // Parse and navigate immediately
    const linkData = parseDeepLink(event.url)
    if (linkData) {
      router.dismissAll()
      router.replace('/')
      setTimeout(() => {
        router.push(`/shared/${linkData.photoId}`)
      }, 50)
    }
  })

  // Only get initial URL after app is ready
  if ((fontsLoaded || !!fontError) && isAppReady) {
    getInitialURL()
  }

  return () => subscription?.remove()
}, [fontsLoaded, fontError, isAppReady, handleDeepLink])
```

### 2. Navigation Pattern That Works

```typescript
// ✅ CORRECT - Simple string paths
router.dismissAll() // Reset navigation stack
router.replace('/') // Go to home
setTimeout(() => {
  // Brief delay for stack to settle
  router.push(`/shared/${id}`)
}, 50)

// ❌ WRONG - These don't work
router.push({ pathname: '/shared/[photoId]', params: { photoId: id } })
router.push('/(drawer)/(tabs)/shared/123')
router.push('/shared/[photoId]')
```

### 3. Timing Strategy

```typescript
const navigateToLink = () => {
  // Navigation logic here
}

if ((fontsLoaded || !!fontError) && isAppReady) {
  // App ready - navigate immediately
  navigateToLink()
} else {
  // App not ready - wait briefly
  setTimeout(navigateToLink, 200)
}
```

### 4. Aggressive Splash Hiding

```typescript
// Normal hide when ready
const canHideSplash = isAppReady && (fontsLoaded || !!fontError)
useEffect(() => {
  if (!canHideSplash) return
  SplashScreen.hideAsync()
}, [canHideSplash])

// Emergency hide after 3 seconds
useEffect(() => {
  const timer = setTimeout(() => {
    console.warn('Emergency splash hide')
    SplashScreen.hideAsync()
  }, 3000)
  return () => clearTimeout(timer)
}, [])
```

## Key Differences from Failed Approach

| Failed Approach                  | Working Approach                         |
| -------------------------------- | ---------------------------------------- |
| `Linking.useURL()` reactive hook | `getInitialURL()` + `addEventListener()` |
| Wait for navigation ready state  | Navigate when app ready                  |
| Href-style navigation objects    | Simple string paths                      |
| Complex pending link queue       | Direct navigation in callbacks           |
| Single path for cold/warm        | Separate handlers for each               |

## Files Changed

- `app/_layout.tsx`: Complete rewrite of deep link handling

## Testing

### ✅ Cold Start with Deep Link

1. Kill app completely
2. Click shared link
3. App opens, splash shows max 3 seconds
4. Navigate to shared content

### ✅ Warm Start with Deep Link

1. App running in background
2. Click shared link
3. Immediate navigation to content

### ✅ Normal Start

1. Open app normally
2. Splash hides when ready
3. Home screen shows

## Code Quality

✅ Passed Codacy analysis (ESLint + Semgrep OSS) with no issues

---

**Based on**: Commit db5fa1b1e7f01ab80c8f90d8914e658d6669c281  
**Date**: October 4, 2025
