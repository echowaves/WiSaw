# Samsung Deep Linking Fixes

## Overview

This document outlines the fixes implemented to resolve deep linking issues on Samsung devices after recent refactorings.

## Issues Identified

Samsung devices have unique behaviors when handling App Links that differ from standard Android implementations:

1. **Intent Filter Requirements**: Samsung requires more explicit intent filter configurations with `autoVerify=true` on each filter
2. **Samsung Internet Browser**: Different URL handling compared to Chrome
3. **Path Pattern Matching**: Samsung devices sometimes strip or modify URL paths
4. **Timing Issues**: Samsung devices may need longer delays for navigation

## Fixes Implemented

### 1. Enhanced Intent Filters (`app.config.js`)

```javascript
// Before: Basic intent filters without autoVerify on all patterns
// After: Comprehensive Samsung-specific intent filters

intentFilters: [
  // Primary domains with autoVerify (Samsung requires this to be first)
  {
    action: 'VIEW',
    autoVerify: true,
    data: [{ scheme: 'https', host: 'link.wisaw.com' }],
    category: ['BROWSABLE', 'DEFAULT'],
  },
  // ... multiple explicit patterns for Samsung compatibility
]
```

**Key Changes:**
- Added `autoVerify: true` to all HTTPS intent filters
- Created separate intent filters for exact path matching
- Added Samsung Internet browser package support
- Included path pattern alternatives (`/photos/.*`, `/friends/.*`)

### 2. Improved URL Parsing (`linkingAndSharingHelper.js`)

```javascript
// Enhanced handleDeepLink function with Samsung-specific logic
const handleDeepLink = async ({ url, navigation }) => {
  // Normalize path to handle Samsung URL modifications
  const cleanPath = path ? path.replace(/^\/+|\/+$/g, '') : ''
  
  // Multiple pattern matching for Samsung compatibility
  if (cleanPath.includes('photos')) {
    let photoId = null
    
    // Try different patterns that Samsung devices might use
    if (cleanPath.includes('photos/')) {
      photoId = cleanPath.split('photos/')[1]?.split('?')[0]?.split('#')[0]?.split('/')[0]
    } else {
      // Handle cases where Samsung strips the slash
      const parts = cleanPath.split('photos')
      // ... handle alternative patterns
    }
  }
}
```

**Key Improvements:**
- Robust path normalization for Samsung URL handling
- Multiple pattern matching strategies
- Increased navigation delays (300-400ms) for Samsung devices
- Better error handling and debugging support

### 3. App-Level Deep Linking Initialization (`App.js`)

Moved deep linking initialization from `PhotosList` to the main `App` component:

```javascript
// Initialize deep linking when navigation is ready
useEffect(() => {
  if (navigationRef.current && fontsLoaded) {
    // Initialize deep linking for Samsung device compatibility
    ;(async () => {
      const linkingHelper = await import('./src/utils/linkingAndSharingHelper')
      linkingHelper.initLinking({ navigation: navigationRef.current })
    })()
  }
}, [fontsLoaded])
```

**Benefits:**
- Earlier initialization ensures Samsung devices can handle links properly
- Navigation ref ensures proper navigation context
- Tied to font loading for better timing

### 4. Samsung-Specific Configuration

Added Samsung-specific metadata and queries:

```javascript
// Samsung-specific metadata for better deep linking support
config: {
  'samsung:applinks_verification_enabled': 'true',
  'samsung:applinks_auto_verify': 'true',
},

queries: {
  package: [
    // ... existing packages
    'com.sec.android.app.sbrowser',      // Samsung Browser
    'com.sec.android.app.internet',      // Samsung Internet Browser
  ],
  intent: [
    // Samsung specific intent queries for deep linking
    {
      action: 'android.intent.action.VIEW',
      data: { scheme: 'https' },
    },
  ],
}
```

## Testing Utilities

Created `samsungDeepLinkTester.js` for debugging Samsung-specific issues:

```javascript
import { testSamsungDeepLinks } from './src/utils/samsungDeepLinkTester'

// Call this function to test deep linking on Samsung devices
await testSamsungDeepLinks()
```

## URL Patterns Supported

The following URL patterns are now fully supported on Samsung devices:

- `https://link.wisaw.com/photos/12345`
- `https://wisaw.com/photos/12345`
- `https://link.wisaw.com/friends/abc-123`
- `https://wisaw.com/friends/abc-123`
- `wisaw://photos/12345` (custom scheme fallback)
- `wisaw://friends/abc-123` (custom scheme fallback)

## Legacy Support

Maintained backward compatibility with query parameter patterns:
- `https://wisaw.com?photoId=12345`
- `https://wisaw.com?friendshipUuid=abc-123`

## Deployment Notes

After deploying these changes:

1. **Build and Deploy**: Create a new build with the updated configuration
2. **Test on Samsung Devices**: Use the testing utilities to verify functionality
3. **Monitor**: Check logs for any deep linking issues specific to Samsung devices

## Troubleshooting

If deep links still don't work on Samsung devices:

1. **Check Device Settings**: Ensure the app has permission to open supported links
2. **Test Different Browsers**: Try Samsung Internet vs Samsung Browser vs Chrome
3. **Use Debug Utilities**: Run `testSamsungDeepLinks()` to diagnose issues
4. **Check App Link Verification**: Verify that the domains are properly associated

## Files Modified

- `app.config.js` - Enhanced intent filters and Samsung-specific configuration
- `App.js` - Moved deep linking initialization to app level
- `src/utils/linkingAndSharingHelper.js` - Improved URL parsing and navigation
- `src/screens/PhotosList/index.js` - Removed duplicate deep linking initialization
- `src/utils/samsungDeepLinkTester.js` - New testing utilities (temporary)

## Expected Results

These changes should resolve the Samsung deep linking issues by:
- Providing multiple intent filter patterns for Samsung compatibility
- Handling Samsung's unique URL parsing behaviors
- Ensuring proper timing for navigation on Samsung devices
- Supporting both Samsung Browser and Samsung Internet browser
