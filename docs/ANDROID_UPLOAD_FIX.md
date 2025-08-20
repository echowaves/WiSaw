# Photo Upload Fix

## Overview

This fix addresses the issue where photo uploads get stuck on some devices, where photos are added to the queue but never create database records or upload files. The solution works consistently across both iOS and Android platforms.

## Root Causes Identified

1. **Network Detection Issues**: Inconsistent `NetInfo` reporting across devices
2. **GraphQL Timeout Issues**: The `generatePhoto` mutation could timeout without proper error handling
3. **Race Conditions**: Upload queue processing lacked proper error boundaries
4. **Missing State Updates**: Queue items weren't updated with photo metadata, causing re-generation attempts
5. **Inadequate Error Handling**: No proper handling for network interruptions during uploads

## Fixes Implemented

### 1. Enhanced Network Detection (`index.js`)

```javascript
// More reliable network checking for all platforms
const isNetworkAvailable =
  state.isConnected && state.isInternetReachable !== false
```

**Benefits:**

- Checks both `isConnected` and `isInternetReachable` for better reliability
- Adds debug logging for network states
- Consistent behavior across iOS and Android

### 2. Timeout Protection for Photo Generation (`reducer.js`)

```javascript
const photo = await withTimeout(
  CONST.gqlClient.mutate({...}),
  30000, // 30 second timeout
  'Generate photo mutation'
)
```

**Benefits:**

- Prevents indefinite hanging on slow/unstable connections
- Provides clear timeout error messages
- Uses existing `withTimeout` utility

### 3. Enhanced Upload Error Handling (`reducer.js`)

```javascript
try {
  photo = await generatePhoto({...})
  // Update queue with photo info to prevent re-generation
  await updateQueueItem(item, processedItem)
} catch (photoGenError) {
  // Better error handling with user feedback
  if (errorMsg.includes('timeout') || errorMsg.includes('network')) {
    Toast.show({
      text1: 'Upload delayed',
      text2: 'Connection issues. Will retry automatically.',
      type: 'info',
    })
  }
  return null // Retry later instead of crashing
}
```

**Benefits:**

- Graceful handling of network/timeout errors
- Queue item updates prevent duplicate photo generation
- Better user feedback for temporary issues

### 4. Improved Upload Loop (`index.js`)

```javascript
// Check network before each upload attempt
const currentNetState = await NetInfo.fetch()
if (!currentNetState.isConnected || currentNetState.isInternetReachable === false) {
  console.log('Network lost during upload, stopping')
  break
}
```

**Benefits:**

- Real-time network validation during upload process
- Stops processing when network is lost
- Consistent 750ms retry delays for optimal performance

### 5. Enhanced Queue Management (`reducer.js`)

Added `updateQueueItem()` function to persist photo metadata:

```javascript
export const updateQueueItem = async (originalItem, updatedItem) => {
  // Updates specific items in queue with new metadata
  // Prevents duplicate photo generation attempts
}
```

**Benefits:**

- Prevents re-generating photos that already exist
- Maintains upload state across app restarts
- Reduces server load and upload time

### 6. Improved Debugging (`reducer.js`)

```javascript
export const initPendingUploads = async () => {
  // Check for stuck items and missing files
  const stuckItems = pendingImages.filter(
    (item) => !item.localImgUrl && item.photo,
  )
  if (stuckItems.length > 0) {
    console.warn(`Found ${stuckItems.length} potentially stuck upload items`)
  }
}
```

**Benefits:**

- Identifies stuck uploads on app startup
- Validates file existence before processing
- Better debugging information for troubleshooting

## Files Modified

1. **`src/screens/PhotosList/index.js`**
   - Enhanced network detection for better reliability
   - Added real-time network checking during uploads
   - Optimized retry delays (750ms)
   - Better error handling for network issues

2. **`src/screens/PhotosList/reducer.js`**
   - Added timeout protection to `generatePhoto()`
   - Enhanced error handling in `processCompleteUpload()`
   - Added `updateQueueItem()` function
   - Improved debugging in `initPendingUploads()`

## Testing Recommendations

### Cross-Platform Testing

1. **Network Switching**: Test uploads while switching between WiFi/cellular
2. **Weak Network**: Test on slow/unstable connections
3. **Background/Foreground**: Test app backgrounding during uploads
4. **Device Restart**: Test queue persistence across device restarts
5. **Multiple Photos**: Test bulk upload scenarios

### Debugging Tools

Enable debug logs to monitor:

- Network state changes on Android
- Upload queue status on startup
- Photo generation timeouts
- File existence validation

### Expected Improvements

- **Reliability**: Uploads should no longer get stuck indefinitely
- **User Feedback**: Better error messages and progress indication
- **Performance**: Reduced duplicate operations and server calls
- **Recovery**: Better handling of network interruptions

## Monitoring

Watch for these console logs to verify fixes:

- `"Network state:"` - Network detection working
- `"Found X pending uploads in queue"` - Queue initialization
- `"Found X potentially stuck upload items"` - Stuck item detection
- `"Network lost during upload, stopping"` - Network protection

## Rollback Plan

If issues persist, revert changes by:

1. Remove enhanced network detection (revert to original `state.isInternetReachable`)
2. Remove timeout wrapper from generatePhoto
3. Remove updateQueueItem calls
4. Restore original upload loop logic

The fixes are designed to be backwards compatible and fail gracefully.
