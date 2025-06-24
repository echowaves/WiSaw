# Version and Build Number Extraction Update

## Change Summary

Updated the drawer version display to extract version and build number directly from `app.config.js` instead of hardcoding the values.

## Before (Hardcoded)

```tsx
// Get version and build number from package.json and app.config.js
const APP_VERSION = '7.2.4'
const BUILD_NUMBER = '328'
```

## After (Dynamic)

```tsx
import appConfig from '../../app.config.js'

// Get version and build number from app.config.js
const APP_VERSION = appConfig.expo.version
const BUILD_NUMBER = appConfig.expo.ios.buildNumber
```

## Benefits

✅ **Single Source of Truth**: Version information is now centralized in `app.config.js`
✅ **Automatic Sync**: When version/build is updated in config, drawer automatically reflects the change
✅ **Reduced Maintenance**: No need to manually update version in multiple places
✅ **Error Prevention**: Eliminates risk of version mismatches between config and UI

## Configuration Structure

The values are extracted from:

- **Version**: `appConfig.expo.version` (e.g., "7.2.4")
- **Build Number**: `appConfig.expo.ios.buildNumber` (e.g., "328")

Note: Using iOS build number as the primary display. Android version code is also available at `appConfig.expo.android.versionCode` if needed.

## Files Modified

- `app/(drawer)/_layout.tsx` - Updated to import and extract version info from config

## Testing

✅ App builds and starts successfully
✅ Version information displays correctly in drawer
✅ No hardcoded values remaining

## Status: ✅ COMPLETE

Version and build number are now dynamically extracted from the configuration file.
