import 'dotenv/config'

export default {
  name: "WiSaw",
  version: "7.0.3",
  extra: {
    API_URI: process.env.API_URI,
    API_KEY: process.env.API_KEY,
    REGION: process.env.REGION,
  },
  slug: "WiSaw",
  scheme: "wisaw",
  icon: "./assets/icon.png",
  notification: {
    iosDisplayInForeground: true,
  },
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  orientation: "portrait",
  platforms: [
    "ios",
    "android",
    "web",
  ],
  updates: {
    enabled: true,
    checkAutomatically: "ON_LOAD",
    fallbackToCacheTimeout: 30000,
  },
  assetBundlePatterns: [
    "**/*",
  ],
  ios: {
    bundleIdentifier: "com.echowaves",
    buildNumber: "209",
    supportsTablet: true,
    infoPlist: {
      UIBackgroundModes: [
        "fetch",
      ],
      NSCameraUsageDescription: "This will allow you to take photos with WiSaw app. When you take a photo with WiSaw, it will be stored in your photo album on your device and will be shared with other near-by users of the app. Any user who finds content objectionable or abusive will be able to remove it permanently, so that no one will be able to see it any more.",
      NSLocationAlwaysUsageDescription: "We need to know your location so that we can show you posts in your area.",
      NSLocationWhenInUseUsageDescription: "You need to enable your location, in order to see photos that are closest to you.",
      NSLocationAlwaysAndWhenInUseUsageDescription: "You need to enable your location, in order to see photos that are closest to you.",
      NSMotionUsageDescription: "This will help us to improve the relevance of posts that you can see related to you location.",
      NSPhotoLibraryAddUsageDescription: "In order to store Photos and Videos taken with WiSaw on your device, you need to allow access to Photos in settings.",
      NSPhotoLibraryUsageDescription: "This will allow to store photos you take with WiSaw in photo album on your device.",
      NSMicrophoneUsageDescription: "WiSaw allows your to record video with sound. In order for the sound to be captured, you need to allow access to the microphone.",
    },
    associatedDomains: [
      "applinks:link.wisaw.com",
    ],
    config: {
      branch: {
        apiKey: "key_live_bfxOER1DaZ6pQzOMj9chBffdwFaB8vg4",
      },
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#FFFFFF",
    },
    package: "com.echowaves.wisaw",
    versionCode: 209,
    permissions: [
      "INTERNET",
      "SYSTEM_ALERT_WINDOW",
      "ACCESS_COARSE_LOCATION",
      "ACCESS_FINE_LOCATION",
      "CAMERA",
      "WRITE_EXTERNAL_STORAGE",
      "READ_EXTERNAL_STORAGE",
    ],
    config: {
      branch: {
        apiKey: "key_live_bfxOER1DaZ6pQzOMj9chBffdwFaB8vg4",
      },
    },
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [
          {
            scheme: "https",
            host: "*.wisaw.com",
            pathPrefix: "/photos",
          },
          {
            scheme: "https",
            host: "*.wisaw.com",
            pathPrefix: "/friends",
          },
        ],
        category: [
          "BROWSABLE",
          "DEFAULT",
        ],
      },
    ],
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  description: "Minimalistic social sharing, incognito pics, anonymous posting.\n\nNo registration, no sign in -- just open the app, start taking photos, and see what's posted by other people nearby today.\nThe most minimalistic social sharing possible, yet, it's the most relevant one as well. It's relevant in time and space. You only see what may potentially matter to you. You do not have to spend time and effort making connections, describing your profile etc. You just start using it. \nThe feed will always stay relevant for your location and time. If you see something you do not like -- just delete it, which will have an effect of drastically increasing the quality of the content for everyone, reducing the noise.\nIt works best for events, large and small. Wedding or celebration party, at a beach or a park, student at a campus, or a conference attendee, or a group of fans at a football game -- these all will benefit from WiSaw and will definitely make it a lot more fun.\nRead more on https://www.echowaves.com or view the photos on https://www.wisaw.com",
  githubUrl: "https://github.com/echowaves/WiSaw",
}