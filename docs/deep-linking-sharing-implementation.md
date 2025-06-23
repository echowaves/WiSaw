# Deep Linking and Sharing Implementation

This document describes the clean implementation of deep linking and sharing functionality in WiSaw, following Expo's modern best practices.

## Architecture Overview

The implementation has been simplified and separated into two main modules:

1. **Linking Helper** (`src/utils/linkingHelper.js`) - Handles deep linking and navigation
2. **Sharing Helper** (`src/utils/sharingHelper.js`) - Handles content sharing

## Deep Linking

### Configuration

**iOS Universal Links** are configured in `app.config.js`:

```javascript
ios: {
  associatedDomains: ['applinks:link.wisaw.com', 'applinks:wisaw.com'],
}
```

**Android App Links** are configured with simplified intent filters:

```javascript
android: {
  intentFilters: [
    {
      action: 'VIEW',
      autoVerify: true,
      data: [{ scheme: 'https', host: 'link.wisaw.com', pathPrefix: '/photos' }],
      category: ['BROWSABLE', 'DEFAULT'],
    },
    // ... similar patterns for friends and both domains
  ],
}
```

### Well-Known Files

- **iOS**: `public/.well-known/apple-app-site-association`
- **Android**: `public/.well-known/assetlinks.json`

These files need to be deployed to your web server and properly configured with your:

- Apple Team ID and Bundle Identifier
- Android Package Name and SHA256 certificates

### Supported URL Patterns

- `https://link.wisaw.com/photos/{photoId}`
- `https://wisaw.com/photos/{photoId}`
- `https://link.wisaw.com/friends/{friendshipUuid}`
- `https://wisaw.com/friends/{friendshipUuid}`
- `wisaw://photos/{photoId}` (fallback)
- `wisaw://friends/{friendshipUuid}` (fallback)

### Navigation Integration

The linking is integrated with React Navigation using the `linkingConfig`:

```javascript
import { linkingConfig } from './src/utils/linkingHelper'

<NavigationContainer ref={navigationRef} linking={linkingConfig}>
```

## Sharing

### Content Creation

The `createShareContent` function generates appropriate sharing content for different contexts:

```javascript
const content = createShareContent({
  type: 'photo',
  photo,
  photoDetails,
})
```

### Sharing Methods

1. **Native Share Sheet**: `shareWithNativeSheet()` - Uses React Native's built-in Share API
2. **Specific Apps**: `shareToSpecificApp()` - Direct deep linking to specific social apps
3. **SMS**: `shareViaSMS()` - Direct SMS sharing using Expo SMS
4. **Comprehensive**: `comprehensiveShare()` - Smart sharing with fallbacks

### Supported Apps

- **Social**: Facebook, Twitter, Instagram, TikTok, Snapchat, LinkedIn, Pinterest
- **Messaging**: WhatsApp, Telegram, iMessage, Slack, Discord
- **Email**: Gmail, Outlook
- **Other**: Reddit, YouTube

## Benefits of the Clean Implementation

1. **Simplified Configuration**: Removed Samsung-specific workarounds and complex intent filters
2. **Modern Best Practices**: Follows Expo's recommended approach for Universal/App Links
3. **Separation of Concerns**: Linking and sharing are handled by separate, focused modules
4. **Better Maintainability**: Cleaner code structure and easier to extend
5. **Improved Performance**: Less complex URL parsing and navigation logic
6. **Standards Compliance**: Uses standard web and mobile linking patterns

## Migration from Old Implementation

The old `linkingAndSharingHelper.js` file has been replaced with:

- `linkingHelper.js` - Modern deep linking implementation
- `sharingHelper.js` - Clean sharing functionality

All imports have been updated to use the new modules while maintaining backward compatibility.

## Testing

To test deep linking:

1. **Development**: Use Expo CLI's linking testing
2. **iOS**: Test with Safari and Messages app
3. **Android**: Test with Chrome and various messaging apps
4. **Production**: Verify well-known files are accessible

## Deployment Notes

1. **Well-Known Files**: Ensure both `.well-known` files are deployed and accessible
2. **Certificate Fingerprints**: Update `assetlinks.json` with actual SHA256 fingerprints
3. **Apple Team ID**: Update `apple-app-site-association` with your actual Team ID
4. **Domain Verification**: Verify both domains properly serve the well-known files

## Troubleshooting

- **iOS**: Check domain association in device settings
- **Android**: Verify app link verification in app info
- **Both**: Ensure well-known files return correct content-type (application/json for Android, any for iOS)

This implementation is more maintainable, standards-compliant, and should work reliably across all modern devices without device-specific workarounds.
