# QR Code Friendship Sharing Implementation

## Overview

The WiSaw app now supports QR code generation for friendship sharing, providing users with two distinct sharing methods for different use cases.

## Two Types of Friendship Sharing

### 1. Friendship Request Sharing (Text-based)

**Purpose**: Share friendship invitations to create new friendships
**When to use**: When you want to invite someone new to become your friend
**How it works**:

- Creates a new friendship on the server
- Generates a text-based share link
- Recipient can accept the friendship request
- Available for pending friendships via "Share" button

### 2. Friend Name Sharing (QR Code)

**Purpose**: Share existing friend names between your own devices
**When to use**: When you want to sync friend names across your devices
**How it works**:

- Generates a QR code containing friend name data
- Allows scanning with another device to update the friend's name
- No server interaction required - just local name synchronization
- Available for all friends via "QR" button or QR code icon

## User Interface

### Pending Friends

- **Share Button** (orange): Creates and shares friendship invitation link
- **QR Button** (blue): Generates QR code for friend name sharing
- **Delete Button** (red): Removes the pending friendship

### Confirmed Friends

- **Share Name Button** (gray): Generates QR code for friend name sharing
- **Swipe Actions**:
  - Right swipe: QR code generation and edit options
  - Left swipe: Delete option

## Implementation Details

### QR Code Generation

- Uses `react-qr-code` library for QR code rendering
- Data is base64 encoded for security
- Custom deep link scheme: `wisaw://?type=friendship&data=...`
- QR codes contain friendship UUID and friend name

### Modal Features

- **QR Code Display**: Clear, scannable QR code
- **Share Button**: Native share sheet for sending the link
- **Copy Link**: Alert-based link sharing (iOS compatible)
- **Clear Instructions**: User-friendly guidance

### Error Handling

- Graceful fallbacks for QR generation failures
- User-friendly error messages via Toast notifications
- Proper validation of friendship data

## Files Modified

### Core Implementation

- `src/screens/FriendsList/index.js` - Main UI and QR button integration
- `src/components/QRCodeModal.js` - QR code modal component
- `src/utils/qrCodeHelper.js` - QR code generation and parsing utilities

### Styling

- Added `pendingQRButton` and `pendingQRButtonText` styles
- Added `confirmedQRButton` and `confirmedQRButtonText` styles
- Consistent color scheme with app design

## User Experience Flow

### For Pending Friends

1. User sees pending friend with Share, QR, and Delete buttons
2. User taps QR button
3. QR code modal opens with scannable code
4. User can share via native share sheet or scan with another device

### For Confirmed Friends

1. User sees confirmed friend with "Share Name" button
2. User taps Share Name button or swipes right for QR action
3. QR code modal opens
4. User can sync friend name across devices

## Benefits

1. **Dual Sharing Options**: Both text and QR code sharing methods available
2. **Clear Distinction**: Different UI elements for different sharing purposes
3. **Cross-Device Sync**: Easy friend name synchronization
4. **Discoverability**: Prominent buttons make QR feature accessible
5. **Consistent UX**: Follows app design patterns and user expectations

## Future Enhancements

1. **Batch QR Generation**: Generate QR codes for multiple friends
2. **QR History**: Track and display previously generated QR codes
3. **Custom QR Styling**: Brand-specific QR code appearance
4. **Advanced Encryption**: Enhanced security for QR code data
