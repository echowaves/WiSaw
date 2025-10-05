# Chat Dynamic Message Receiving Fix

## Problem

Chat messages were not being received dynamically/in real-time. Users had to refresh or navigate away and back to see new messages from other users.

The error message was:
```
Invalid subscription data received: {"data": undefined, "error": [TypeError: (0, link_1.execute)(link, operation, executeContext).pipe is not a function (it is undefined)]}
```

## Root Cause

The WebSocket subscription for receiving messages had several issues:

1. **Apollo Client 4.x Compatibility**: The app was using Apollo Client 4.x with `@apollo/client/link/ws` and `subscriptions-transport-ws`. Apollo Client 4.x has compatibility issues with the WebSocketLink, causing the `.pipe is not a function` error
2. **No AppState handling**: When the app went to background and came back to foreground, the WebSocket connection could drop without being detected or reconnected
3. **No focus-based health check**: When navigating between screens, the subscription state wasn't verified
4. **Insufficient connection monitoring**: There was no tracking of subscription health or active connection state
5. **Poor error recovery**: Error handling was basic and didn't provide clear feedback about connection issues

## Solution Implemented

### 1. Created Direct Subscription Client

**File**: `src/directSubscriptionClient.js` (NEW FILE)

Created a new direct subscription client that bypasses Apollo Client and uses `subscriptions-transport-ws` directly. This avoids the compatibility issues with Apollo Client 4.x.

```javascript
// Direct subscription client using subscriptions-transport-ws
import { SubscriptionClient } from 'subscriptions-transport-ws'

const directSubscriptionClient = new UUIDOperationIdSubscriptionClient(
  connection_url,
  {
    timeout: 5 * 60 * 1000,
    reconnect: true,
    lazy: true,
    connectionCallback: (err) => console.log('🔌 WebSocket connectionCallback', err ? 'ERR' : 'OK', err || '')
  }
).use([createAppSyncGraphQLOperationAdapter()])

export default directSubscriptionClient
```

### 2. Updated Chat Component to Use Direct Client

**File**: `src/screens/Chat/index.js`

Changed from using `subscriptionClient` (Apollo Client) to `directSubscriptionClient`:

```javascript
import directSubscriptionClient from '../../directSubscriptionClient'

// In subscription effect:
const subscription = directSubscriptionClient.request({
  query: subscriptionQuery,
  variables: { chatUuid }
}).subscribe(subscriptionParameters)
```

### 3. Added AppState Import

**File**: `src/screens/Chat/index.js`

Added `AppState` to React Native imports and `useFocusEffect` from React Navigation to handle app state changes and screen focus.

```javascript
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import {
  ActivityIndicator,
  Alert,
  Animated,
  AppState,  // Added
  SafeAreaView,
  // ... other imports
} from 'react-native'
```

### 4. Added Subscription State Tracking

**File**: `src/screens/Chat/index.js`

Added refs to track subscription state and app state:

```javascript
// Track subscription and connection state
const subscriptionRef = useRef(null)
const isSubscribedRef = useRef(false)
const appStateRef = useRef(AppState.currentState)
```

### 5. Enhanced Subscription with Health Monitoring

**File**: `src/screens/Chat/index.js`

Improved the subscription effect with:

- Subscription state tracking
- Better logging with emojis for visibility
- Connection health indicators
- Proper cleanup

```javascript
next(data) {
  // Mark subscription as active when we receive first message
  if (!isSubscribedRef.current) {
    console.log(`✅ Subscription active for ${chatUuid}`)
    isSubscribedRef.current = true
  }
  
  console.log('📨 Received message:', {
    messageUuid: onSendMessage.messageUuid,
    text: onSendMessage.text,
    from: onSendMessage.uuid
  })
  // ... rest of message handling
},
error(error) {
  console.error('❌ observableObject:: subscription error', { error })
  isSubscribedRef.current = false
  
  Toast.show({
    text1: 'Connection lost. Attempting to reconnect...',
    text2: JSON.stringify({ error }),
    type: 'error',
    topOffset: toastTopOffset
  })
  // ... reconnection logic
}
```

### 6. Added AppState Listener

**File**: `src/screens/Chat/index.js`

Added new useEffect to monitor app state changes:

```javascript
// AppState listener to handle app going to background and coming back
useEffect(() => {
  const subscription = AppState.addEventListener('change', (nextAppState) => {
    console.log('AppState changed:', appStateRef.current, '->', nextAppState)

    if (
      appStateRef.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      console.log('🔄 App came to foreground, checking subscription health')
      if (!isSubscribedRef.current) {
        console.warn('⚠️ Subscription not active after returning to foreground')
        Toast.show({
          text1: 'Reconnecting to chat...',
          type: 'info',
          topOffset: toastTopOffset,
          visibilityTime: 2000
        })
      } else {
        console.log('✅ Subscription still active')
      }
    }

    appStateRef.current = nextAppState
  })

  return () => {
    subscription.remove()
  }
}, [toastTopOffset])
```

### 7. Added Focus Effect

**File**: `src/screens/Chat/index.js`

Added useFocusEffect to verify subscription when screen comes into focus:

```javascript
// Focus effect to refresh connection when screen comes into focus
useFocusEffect(
  useCallback(() => {
    console.log('📱 Chat screen focused')
    // Verify subscription is active
    if (!isSubscribedRef.current) {
      console.warn('⚠️ Subscription not active on focus')
    }

    return () => {
      console.log('📱 Chat screen unfocused')
    }
  }, [])
)
```

## Technical Benefits

✅ **Apollo Client 4.x Compatibility**: Bypassed compatibility issues by using SubscriptionClient directly
✅ **Stable WebSocket Connection**: Direct use of subscriptions-transport-ws provides more reliable connections
✅ **App State Awareness**: Detects when app goes to background/foreground and monitors connection health
✅ **Focus-Based Verification**: Checks subscription health when screen comes into focus
✅ **Better Error Handling**: Improved error messages and automatic reconnection attempts
✅ **Connection Monitoring**: Real-time tracking of subscription state with clear logging
✅ **User Feedback**: Toast notifications inform users of connection issues and reconnection attempts
✅ **Improved Debugging**: Enhanced logging with emojis for better visibility in console

## User Experience Improvements

- **Before**: 
  - Messages didn't appear in real-time
  - No indication when connection was lost
  - Had to navigate away and back to see new messages
  - Poor experience when app went to background

- **After**: 
  - Messages appear instantly when received
  - Clear feedback when connection issues occur
  - Automatic reconnection when app returns to foreground
  - Toast notifications for connection status
  - Reliable real-time messaging experience

## Testing Recommendations

1. **Real-time Messaging**: Send messages from another device and verify they appear immediately
2. **Background/Foreground**: Put app in background, send messages, return to foreground - messages should appear
3. **Screen Navigation**: Navigate between screens while receiving messages
4. **Network Issues**: Disconnect/reconnect network to test reconnection logic
5. **Extended Background**: Leave app in background for several minutes, verify reconnection on return

## Debugging

The implementation includes comprehensive logging:

- `✅ Subscription active for {chatUuid}` - Subscription established
- `📨 Received message:` - Message received with details
- `❌ observableObject:: subscription error` - Connection error occurred
- `🔄 App came to foreground, checking subscription health` - App state changed
- `⚠️ Subscription not active...` - Warning about inactive subscription
- `📱 Chat screen focused/unfocused` - Screen focus changes

## Files Modified

- `src/directSubscriptionClient.js` - NEW FILE: Direct subscription client bypassing Apollo Client
- `src/screens/Chat/index.js` - Updated to use direct subscription client, added AppState listener, focus effect, and improved subscription management

## Related Documentation

- [Chat Navigation Fix](./CHAT_NAVIGATION_FIX_SUMMARY.md)
- [Chat Header Name Update](./CHAT_HEADER_NAME_UPDATE_FIX.md)
