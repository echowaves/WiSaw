// Import version from package.json and shared build number
const { version, buildNumber, versionCode } = require('./package.json')

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
      [
        'expo-build-properties',
        {
          android: {
            // compileSdkVersion: 34,
            targetSdkVersion: 35,
            // buildToolsVersion: '34.0.0',
            // kotlinVersion: '2.0.0',
            enableProguardInReleaseBuilds: true,
            enableShrinkResourcesInReleaseBuilds: true,
          },
          ios: {
            // deploymentTarget: '16.0'
            flipper: false, // Disable Flipper for better performance
          },
        },
      ],
    ],
    extra: {
      eas: { projectId: 'd1624159-fed7-42bf-b11b-7ea8f38a8dee' },
      API_URI: process.env.API_URI,
      REALTIME_API_URI: process.env.REALTIME_API_URI,
      API_KEY: process.env.API_KEY,
      PRIVATE_IMG_HOST: process.env.PRIVATE_IMG_HOST,
    },
    mods: {
      ios: {
        /* iOS mods... */
      },
      android: {
        /* Android mods... */
      },
    },
    ios: {
      bundleIdentifier: 'com.echowaves',
      buildNumber,
      supportsTablet: true,
      infoPlist: {
        UIBackgroundModes: ['processing'],
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
          'WiSaw allows your to record video with sound. In order for the sound to be captured, you need to allow access to the microphone.',
      },
      associatedDomains: ['applinks:link.wisaw.com', 'applinks:wisaw.com'],
      config: {
        usesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#FFFFFF',
      },
      package: 'com.echowaves.wisaw',
      versionCode,
      permissions: [
        'INTERNET',
        'SYSTEM_ALERT_WINDOW',
        'ACCESS_COARSE_LOCATION',
        'ACCESS_FINE_LOCATION',
        'CAMERA',
        'WRITE_EXTERNAL_STORAGE',
        'READ_EXTERNAL_STORAGE',
        'com.google.android.gms.permission.AD_ID',
      ],
      config: {},
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'https',
              host: 'link.wisaw.com',
              pathPrefix: '/photos',
            },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'https',
              host: 'link.wisaw.com',
              pathPrefix: '/friends',
            },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'https',
              host: 'wisaw.com',
              pathPrefix: '/photos',
            },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'https',
              host: 'wisaw.com',
              pathPrefix: '/friends',
            },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
        {
          action: 'VIEW',
          data: [{ scheme: 'wisaw' }],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
      queries: {
        intent: [
          {
            action: 'android.intent.action.SENDTO',
            data: {
              scheme: 'smsto',
            },
          },
        ],
      },
    },
    web: { favicon: './assets/favicon.png' },
    slug: 'WiSaw',
    scheme: 'wisaw',
    icon: './assets/icon.png',
    notification: { iosDisplayInForeground: true },
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    orientation: 'portrait',
    platforms: ['ios', 'android', 'web'],
    assetBundlePatterns: ['**/*'],
    description:
      "Minimalistic social sharing, incognito pics, anonymous posting.\n\nNo registration, no sign in -- just open the app, start taking photos, and see what's posted by other people nearby today.\nThe most minimalistic social sharing possible, yet, it's the most relevant one as well. It's relevant in time and space. You only see what may potentially matter to you. You do not have to spend time and effort making connections, describing your profile etc. You just start using it. \nThe feed will always stay relevant for your location and time. If you see something you do not like -- just delete it, which will have an effect of drastically increasing the quality of the content for everyone, reducing the noise.\nIt works best for events, large and small. Wedding or celebration party, at a beach or a park, student at a campus, or a conference attendee, or a group of fans at a football game -- these all will benefit from WiSaw and will definitely make it a lot more fun.\nRead more on https://www.echowaves.com or view the photos on https://www.wisaw.com",
    githubUrl: 'https://github.com/echowaves/WiSaw',
  },
}
