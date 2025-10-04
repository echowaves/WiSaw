# Tag Click Navigation Error Fix

## Problem
When clicking on an AI tag (label, text detection, or moderation label) in an expanded photo, the app was throwing a navigation error:

```
Code: ExpoRoot.js
  143 |     }
  144 |     return (<storeContext_1.StoreContext.Provider value={store}>
> 145 |       <NavigationContainer_1.NavigationContainer ref={store.navigationRef} 
          initialState={store.state} linking={store.linking} 
          onUnhandledAction={onUnhandledAction} documentTitle={documentTitle} 
          onReady={store.onReady}>
```

## Root Cause
The issue was caused by a race condition between two navigation/state management systems:

1. **Event-based search trigger**: When a tag was clicked, `onTriggerSearch(term)` was called, which:
   - Emits a search event via `photoSearchBus`
   - The event listener in `PhotosList` sets `pendingTriggerSearch` 
   - A `useEffect` then tries to update multiple state values (`setActiveSegment(2)`, `setPhotosList([])`, etc.)

2. **Router navigation**: Immediately after triggering the search, `router.back()` was called to close the expanded photo

These two operations created a race condition where:
- The PhotosList component was trying to update its state and switch segments
- Simultaneously, the router was trying to navigate back
- This left the navigation system in an inconsistent state, causing the error

## Solution
Removed the `router.back()` calls from all tag click handlers in the Photo component. The proper behavior is:

1. When a tag is clicked, only trigger the search via `onTriggerSearch(term)`
2. The PhotosList component handles all state transitions:
   - Closes expanded photos via `setExpandedPhotoIds(new Set())`
   - Switches to search segment via `setActiveSegment(2)`
   - Clears and reloads the photos list
3. No router navigation is needed because the Photo component is embedded within the ExpandableThumb

## Changes Made

### `/src/components/Photo/index.js`
Removed `router.back()` calls from three tag click handlers:

1. **AI Labels** (lines 870-889)
2. **Text Detections** (lines 937-956)  
3. **Moderation Labels** (lines 1006-1027)

Before:
```javascript
onPress={() => {
  if (typeof onTriggerSearch === 'function') {
    onTriggerSearch(label.Name)
  }
  router.back() // ❌ Removed - causes navigation conflict
}}
```

After:
```javascript
onPress={() => {
  if (typeof onTriggerSearch === 'function') {
    onTriggerSearch(label.Name)
  }
  // Photo will collapse naturally when segment switches
}}
```

### `/src/screens/PhotosList/index.js`
Added explicit closing of expanded photos in the `pendingTriggerSearch` useEffect (line 1405):

```javascript
// Close any expanded photos
setExpandedPhotoIds(new Set())
```

This ensures that any expanded photo is properly collapsed before the segment switch occurs, preventing any potential rendering issues.

## Why This Works

1. **Single source of truth**: The PhotosList component now fully controls the navigation flow when a tag is clicked
2. **Proper state management**: All state changes (expanding/collapsing photos, switching segments, loading data) happen in the correct order within a single component
3. **No navigation conflicts**: The router is not involved in this flow, eliminating the race condition
4. **Natural behavior**: When the segment switches and photosList is cleared, any expanded photos naturally collapse as part of the normal React rendering cycle

## Testing
After this fix, clicking on any AI tag should:
1. Immediately close the expanded photo
2. Switch to the Search segment
3. Populate the search bar with the clicked tag
4. Display search results for that tag
5. No navigation errors should occur

## Related Files
- `/src/components/Photo/index.js` - Photo component with tag click handlers
- `/src/components/ExpandableThumb/index.js` - Container for embedded photos
- `/src/screens/PhotosList/index.js` - Main screen managing photos and segments
- `/src/events/photoSearchBus.js` - Event bus for search triggers
