// Import version from package.json and shared build number
const { version, buildNumber, versionCode } = require('./package.json')

// Dark field sampled from the WiSaw logo; splash and adaptive icon sit on it.
const BRAND_FIELD = '#01122D'

module.exports = {
  expo: {
    owner: 'echowaves',
    runtimeVersion: { policy: 'appVersion' },
    jsEngine: 'hermes',
    updates: { url: 'https://u.expo.dev/d1624159-fed7-42bf-b11b-7ea8f38a8dee' },
    name: 'WiSaw',
    version,
    plugins: [
      // Branch removed - using native deep linking instead
      'expo-secure-store',
      'expo-router',
      // No background media playback in this app, so expo-audio's AudioControlsService
      // (foregroundServiceType="mediaPlayback") stays unregistered. That also drops the
      // FOREGROUND_SERVICE_MEDIA_PLAYBACK permission and would drop the iOS 'audio' background
      // mode too — that one is declared explicitly in ios.infoPlist below.
      ['expo-audio', { enableBackgroundPlayback: false }],
      'expo-asset',
      'expo-background-task',
      'expo-font',
      'expo-splash-screen',
      'expo-status-bar',
      'expo-video',
      '@react-native-community/datetimepicker',
      // The UIKit scene lifecycle that the iOS 27 SDK requires is now part of the
      // SDK 58 prebuild template (Expo ships SceneDelegate), so the
      // plugins/with-ios-scene-lifecycle workaround was removed.
      [
        'expo-build-properties',
        {
          android: {
            // RN 0.88 (SDK 58) compiles against API 37 and targets 36
            compileSdkVersion: 37,
            targetSdkVersion: 36,
            buildToolsVersion: '37.0.0',
            enableProguardInReleaseBuilds: true,
            enableShrinkResourcesInReleaseBuilds: true
          },
          ios: {
            deploymentTarget: '16.4', // above RN 0.88's minimum of 15.1
            flipper: false // Disable Flipper for better performance
          }
        }
      ],
      // Gradle wrapper plugin disabled - manually fixing Gradle version below
      // './scripts/gradle-wrapper-properties-plugin',
      // '8.10.2'
    ],
    extra: {
      eas: { projectId: 'd1624159-fed7-42bf-b11b-7ea8f38a8dee' },
      API_URI: process.env.API_URI,
      REALTIME_API_URI: process.env.REALTIME_API_URI,
      API_KEY: process.env.API_KEY,
      PRIVATE_IMG_HOST: process.env.PRIVATE_IMG_HOST
    },
    mods: {
      ios: {
        /* iOS mods... */
      },
      android: {
        /* Android mods... */
      }
    },
    ios: {
      bundleIdentifier: 'com.echowaves',
      buildNumber,
      supportsTablet: true,
      infoPlist: {
        // iOS: 'audio' is required for video Picture-in-Picture (see Photo's
        // allowsPictureInPicture). It used to arrive incidentally from expo-audio's background
        // playback; now that that is off, declare it here so PiP keeps working on iOS.
        UIBackgroundModes: ['processing', 'audio'],
        BGTaskSchedulerPermittedIdentifiers: ['background-task'],
        NSCameraUsageDescription:
          'This will allow you to take photos with WiSaw app. When you take a photo with WiSaw, it will be stored in your photo album on your device and will be shared with other near-by users of the app. Any user who finds content objectionable or abusive will be able to remove it permanently, so that no one will be able to see it any more.',
        NSLocationAlwaysUsageDescription:
          'We need to know your location so that we can show you posts in your area.',
        NSLocationWhenInUseUsageDescription:
          'You need to enable your location, in order to see photos that are closest to you.',
        NSLocationAlwaysAndWhenInUseUsageDescription:
          'You need to enable your location, in order to see photos that are closest to you.',
        NSMotionUsageDescription:
          'This will help us to improve the relevance of posts that you can see related to you location.',
        NSPhotoLibraryAddUsageDescription:
          'In order to store Photos and Videos taken with WiSaw on your device, you need to allow access to Photos in settings.',
        NSPhotoLibraryUsageDescription:
          'This will allow to store photos you take with WiSaw in photo album on your device.',
        NSMicrophoneUsageDescription:
          'WiSaw allows your to record video with sound. In order for the sound to be captured, you need to allow access to the microphone.'
      },
      associatedDomains: ['applinks:link.wisaw.com', 'applinks:wisaw.com'],
      config: {
        usesNonExemptEncryption: false
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: BRAND_FIELD
      },
      package: 'com.echowaves.wisaw',
      versionCode,
      permissions: [
        'INTERNET',
        'SYSTEM_ALERT_WINDOW',
        'ACCESS_COARSE_LOCATION',
        'ACCESS_FINE_LOCATION',
        // Kept from the previous manifest: expo-audio injected this while background playback
        // was on. expo-location declares foregroundServiceType="location" services and relies on
        // the app to declare the base permission, so it stays rather than shrinking surface
        // beyond what was asked for.
        'FOREGROUND_SERVICE',
        'CAMERA',
        'WRITE_EXTERNAL_STORAGE',
        'READ_EXTERNAL_STORAGE',
        'com.google.android.gms.permission.AD_ID'
      ],
      androidStatusBar: {
        barStyle: 'dark-content',
        backgroundColor: '#FFFFFF',
        translucent: false
      },
      config: {},
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'https',
              host: 'link.wisaw.com',
              pathPrefix: '/photos'
            }
          ],
          category: ['BROWSABLE', 'DEFAULT']
        },
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'https',
              host: 'link.wisaw.com',
              pathPrefix: '/friends'
            }
          ],
          category: ['BROWSABLE', 'DEFAULT']
        },
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'https',
              host: 'wisaw.com',
              pathPrefix: '/photos'
            }
          ],
          category: ['BROWSABLE', 'DEFAULT']
        },
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'https',
              host: 'wisaw.com',
              pathPrefix: '/friends'
            }
          ],
          category: ['BROWSABLE', 'DEFAULT']
        },
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'https',
              host: 'link.wisaw.com',
              pathPrefix: '/friendships'
            }
          ],
          category: ['BROWSABLE', 'DEFAULT']
        },
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'https',
              host: 'wisaw.com',
              pathPrefix: '/friendships'
            }
          ],
          category: ['BROWSABLE', 'DEFAULT']
        },
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'https',
              host: 'link.wisaw.com',
              pathPrefix: '/wave/join'
            }
          ],
          category: ['BROWSABLE', 'DEFAULT']
        },
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'https',
              host: 'link.wisaw.com',
              pathPrefix: '/wave/invite'
            }
          ],
          category: ['BROWSABLE', 'DEFAULT']
        },
        {
          action: 'VIEW',
          data: [{ scheme: 'wisaw' }],
          category: ['BROWSABLE', 'DEFAULT']
        }
      ],
      queries: {
        intent: [
          {
            action: 'android.intent.action.SENDTO',
            data: {
              scheme: 'smsto'
            }
          }
        ]
      }
    },
    web: { favicon: './assets/favicon.png' },
    slug: 'WiSaw',
    scheme: 'wisaw',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    notification: { iosDisplayInForeground: true },
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: BRAND_FIELD,
      hideAsync: true // Let Expo handle splash screen hiding automatically
    },
    orientation: 'portrait',
    platforms: ['ios', 'android', 'web'],
    assetBundlePatterns: ['**/*'],
    description:
      "Minimalistic social sharing, incognito pics, anonymous posting.\n\nNo registration, no sign in -- just open the app, start taking photos, and see what's posted by other people nearby today.\nThe most minimalistic social sharing possible, yet, it's the most relevant one as well. It's relevant in time and space. You only see what may potentially matter to you. You do not have to spend time and effort making connections, describing your profile etc. You just start using it. \nThe feed will always stay relevant for your location and time. If you see something you do not like -- just delete it, which will have an effect of drastically increasing the quality of the content for everyone, reducing the noise.\nIt works best for events, large and small. Wedding or celebration party, at a beach or a park, student at a campus, or a conference attendee, or a group of fans at a football game -- these all will benefit from WiSaw and will definitely make it a lot more fun.\nRead more on https://www.echowaves.com or view the photos on https://www.wisaw.com",
    githubUrl: 'https://github.com/echowaves/WiSaw'
  }
}
