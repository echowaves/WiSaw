# WiSaw - "What I Saw Today"

<div align="center">

[![Version](https://img.shields.io/badge/version-7.2.5-blue.svg)](https://github.com/echowaves/WiSaw)
[![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android%20%7C%20Web-lightgrey.svg)](https://expo.dev)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![React Native](https://img.shields.io/badge/React%20Native-0.79.4-blue.svg)](https://reactnative.dev)
[![Expo](https://img.shields.io/badge/Expo-53.0.12-000020.svg)](https://expo.dev)

**Minimalistic social sharing • Incognito pics • Anonymous posting**

</div>

## 🌟 Overview

WiSaw is a location-based, anonymous social sharing app that lets you capture and share moments without the complexity of traditional social media. No registration, no profiles, no followers - just pure, location-relevant content sharing.

### ✨ Key Features

- **🚫 No Registration Required** - Open the app and start sharing immediately
- **📍 Location-Based Feed** - See what's happening around you right now
- **🎭 Anonymous Sharing** - Share without revealing your identity
- **🗑️ Community Moderation** - Delete inappropriate content to improve quality for everyone
- **🤖 AI Image Recognition** - Automatic content descriptions using AI
- **💬 Real-time Comments** - Engage with posts through anonymous comments
- **🔗 Deep Linking** - Share specific photos and friend invitations
- **📱 Cross-Platform** - Available on iOS, Android, and Web

## 📱 Download

<p align="center">
<a href="http://itunes.apple.com/us/app/wisaw/id1299949122">
    <img src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83" alt="Download on the App Store" width="200">
</a>
<br/>
<a href="http://play.google.com/store/apps/details?id=com.echowaves.wisaw">
    <img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" alt="Get it on Google Play" width="230">
</a>
</p>

**🌐 Web Version:** [wisaw.com](https://www.wisaw.com)

## 🛠️ Tech Stack

### Frontend

- **React Native** (0.79.4) - Cross-platform mobile development
- **Expo** (53.0.12) - Development platform and build system
- **Expo Router** (5.1.0) - File-based routing system
- **TypeScript** - Type-safe development
- **Jotai** (2.8.4) - State management

### Backend Integration

- **Apollo Client** (3.9.7) - GraphQL client with caching
- **GraphQL** (16.8.1) - API query language
- **WebSocket Subscriptions** - Real-time updates

### UI/UX

- **React Native Elements** - UI component library
- **React Navigation** - Navigation system
- **Expo Image** - Optimized image handling
- **React Native Reanimated** - Smooth animations

### Device Features

- **Camera & Photo Library** - Image capture and storage
- **Location Services** - GPS-based content filtering
- **Push Notifications** - Real-time alerts
- **Deep Linking** - Share content and friend invitations

## 🏗️ Architecture

### Project Structure

```
WiSaw/
├── app/                    # Expo Router app directory
│   ├── (drawer)/          # Drawer navigation layout
│   │   ├── (tabs)/        # Bottom tabs navigation
│   │   │   ├── index.tsx  # Main feed screen
│   │   │   ├── chat.tsx   # Chat/messaging screen
│   │   │   └── photos/    # Photo-related screens
│   │   ├── friends.tsx    # Friends management
│   │   └── feedback.tsx   # User feedback
│   └── _layout.tsx        # Root layout
├── src/                   # Source code
│   ├── components/        # Reusable components
│   ├── screens/           # Screen components (legacy)
│   ├── utils/             # Utility functions
│   ├── hooks/             # Custom React hooks
│   └── state.js           # Global state management
├── assets/                # Images, icons, splash screens
├── docs/                  # Documentation and guides
└── public/                # Static web assets
```

### Key Features Implementation

#### 🔧 Navigation System

- **Expo Router** with file-based routing
- **Drawer Navigation** for main app sections
- **Tab Navigation** for primary features
- **Modal Navigation** for overlays and forms

#### 🎨 UI/UX Enhancements

- **Status Bar Handling** - Platform-specific status bar management
- **Safe Area Support** - Proper handling of device safe areas
- **Responsive Design** - Adapts to different screen sizes
- **Loading States** - User feedback during operations

#### 🔄 State Management

- **Jotai** for lightweight state management
- **Apollo Client Cache** for GraphQL data
- **Local Storage** for offline data persistence

#### 🔐 Privacy & Security

- **Anonymous Posting** - No user identification required
- **Location Privacy** - Approximate location sharing only
- **Content Moderation** - Community-driven content filtering

## 🚀 Getting Started

### Prerequisites

- Node.js (18+)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio/Emulator (for Android development)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/echowaves/WiSaw.git
   cd WiSaw
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   # Create .env file with your API endpoints
   API_URI=your_graphql_endpoint
   REALTIME_API_URI=your_websocket_endpoint
   API_KEY=your_api_key
   PRIVATE_IMG_HOST=your_image_host
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

### Development Scripts

```bash
# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Build for production
npm run build

# Deploy to production
npm run publish:prod

# Clear cache and reset
npm run clear
npm run reset:simulator
```

## 📋 Version Management

The app uses a centralized version management system:

- **Version:** Defined in `package.json` and imported to `app.config.js`
- **Build Numbers:** Automatically synced across iOS and Android
- **Single Source of Truth:** All version info in `package.json`

To update the app version:

1. Update `version`, `buildNumber`, and `versionCode` in `package.json`
2. Changes automatically propagate throughout the app

## 🔧 Configuration

### App Configuration

The app uses `app.config.js` for Expo configuration:

- Platform-specific settings
- Deep linking configuration
- Push notification setup
- Build properties

### Environment Setup

- Development: Uses Expo development server
- Production: Built with EAS (Expo Application Services)
- Web: Deployed as PWA

## 📖 Documentation

### Developer Guides

- [Deep Linking Implementation](docs/deep-linking-sharing-implementation.md)
- [Friends System](docs/friends-sharing-ux-improvements.md)
- [Navigation Architecture](docs/NAVIGATION_FIX_SUMMARY.md)
- [Version Management](docs/VERSION_CENTRALIZATION_SUMMARY.md)

### Feature Documentation

- [Comment System](docs/COMMENT_SEND_BUTTON_IMPLEMENTATION.md)
- [Feedback Screen](docs/FEEDBACK_SCREEN_FIX.md)
- [UI/UX Improvements](docs/name-picker-ux-improvements.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use Expo Router for navigation
- Implement proper error handling
- Add documentation for new features
- Test on both iOS and Android

## 📞 Support

- **Website:** [echowaves.com](https://www.echowaves.com)
- **App Store:** [WiSaw on iOS](http://itunes.apple.com/us/app/wisaw/id1299949122)
- **Google Play:** [WiSaw on Android](http://play.google.com/store/apps/details?id=com.echowaves.wisaw)
- **GitHub:** [Issues & Bug Reports](https://github.com/echowaves/WiSaw/issues)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev) and [React Native](https://reactnative.dev)
- UI components from [React Native Elements](https://reactnativeelements.com)
- State management with [Jotai](https://jotai.org)
- GraphQL integration via [Apollo Client](https://www.apollographql.com/docs/react/)

---

<div align="center">

**Made with ❤️ by [Echowaves Corp.](https://www.echowaves.com)**

_Experience authentic, location-based social sharing_

</div>

## 📱 Screenshots

### Main Feed

<img alt="Main feed showing nearby photos" src="https://static.wixstatic.com/media/c90e7e_919f2c5816824c37b755fc3e3d8c75d0~mv2.png" height="400" width="200">

### Photo Search

<img alt="Search and browse photos by relevance" src="https://static.wixstatic.com/media/c90e7e_e323af6b90234511bb3a0144b9156707~mv2.png" height="400" width="200">

### Photo Details

<img alt="Detailed photo view with AI descriptions" src="https://static.wixstatic.com/media/c90e7e_e762c27c4bae4d4599d621d092eeaeff~mv2.png" height="400" width="200">

### AI Recognition

<img alt="AI-powered image recognition and tagging" src="https://static.wixstatic.com/media/c90e7e_33b0dce4a0704c119065b2fbf64589cc~mv2.png" height="400" width="200">

### Comments

<img alt="Anonymous commenting system" src="https://static.wixstatic.com/media/c90e7e_258c95637d9644f8805f5c283423e6f3~mv2.png" height="400" width="200">

### Navigation Menu

<img alt="App navigation and features" src="https://static.wixstatic.com/media/c90e7e_7f845f0d82c84276a3006698d9c5df00~mv2.png" height="400" width="200">

<a href="https://app.codacy.com/gh/echowaves/WiSaw/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade"><img src="https://app.codacy.com/project/badge/Grade/751bc6b7868b4b209166cb14e1a8da03"/></a>