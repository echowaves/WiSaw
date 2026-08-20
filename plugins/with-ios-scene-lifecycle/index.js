const { withAppDelegate, withInfoPlist } = require('@expo/config-plugins');

// Adopts the UIKit scene lifecycle in the prebuild-generated AppDelegate.
//
// WHY: apps linked against the iOS 27 SDK (Xcode 27) are killed at launch with
// EXC_BREAKPOINT in __UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption
// unless they adopt UIScene (Apple TN3187). Expo's prebuild template still
// generates a classic AppDelegate/window-lifecycle app:
//   - https://github.com/expo/expo/issues/46664 (accepted, unreleased)
//   - https://github.com/facebook/react-native/issues/54739 (upstream)
//
// The patch adds a UIApplicationSceneManifest to Info.plist and appends a
// SceneDelegate class to AppDelegate.swift that:
//   - owns the UIWindow and starts React Native from the connected scene,
//   - forwards custom-scheme deep links (wisaw://) and universal links
//     (applinks:wisaw.com) to AppDelegate.application(_:open:) /
//     application(_:continue:) — the template already routes both to
//     RCTLinkingManager, so expo-router deep linking keeps working,
//   - forwards cold-launch URL contexts / user activities and app
//     life-cycle events that no longer reach the UIApplicationDelegate
//     under the scene lifecycle.
//
// The patch anchors are strict on purpose: if the Expo template changes,
// prebuild fails loudly instead of silently generating a crashing app.
//
// REMOVE this plugin once the Expo SDK ships a scene-based template —
// re-check the issues above on every SDK upgrade.

const sceneConfigurationMethod = [
  '  // Configure the scene session to be handled by the SceneDelegate',
  '  // (UIScene lifecycle — see plugins/with-ios-scene-lifecycle).',
  '  public func application(',
  '    _ application: UIApplication,',
  '    configurationForConnecting connectingSceneSession: UISceneSession,',
  '    options: UIScene.ConnectionOptions',
  '  ) -> UISceneConfiguration {',
  '    let configuration = UISceneConfiguration(name: "Default Configuration", sessionRole: connectingSceneSession.role)',
  '    configuration.delegateClass = SceneDelegate.self',
  '    return configuration',
  '  }',
  ''
].join('\n');

const sceneDelegateClass = [
  '// Handles the UIKit scene lifecycle (iOS 27 SDK requirement — Apple TN3187).',
  '// Owns the window, starts React Native, and forwards links and life-cycle',
  '// events to the AppDelegate so RCTLinkingManager and the Expo subscribers',
  '// keep receiving them. Injected by plugins/with-ios-scene-lifecycle.',
  'class SceneDelegate: UIResponder, UIWindowSceneDelegate {',
  '  var window: UIWindow?',
  '',
  '  @available(iOS 13.0, *)',
  '  func scene(',
  '    _ scene: UIScene,',
  '    willConnectTo session: UISceneSession,',
  '    options connectionOptions: UIScene.ConnectionOptions',
  '  ) {',
  '    guard let windowScene = scene as? UIWindowScene else {',
  '      return',
  '    }',
  '    guard let appDelegate = UIApplication.shared.delegate as? AppDelegate,',
  '      let factory = appDelegate.reactNativeFactory else {',
  '      return',
  '    }',
  '',
  '    let nextWindow = UIWindow(windowScene: windowScene)',
  '    window = nextWindow',
  '    appDelegate.window = nextWindow',
  '',
  '    factory.startReactNative(',
  '      withModuleName: "main",',
  '      in: nextWindow,',
  '      launchOptions: nil)',
  '',
  '    // Cold-start deep/universal links arrive through the scene, not the app delegate.',
  '    // (self. disambiguates the scene(_:openURLContexts:) / scene(_:continue:)',
  '    //  methods from the `scene` parameter of willConnectTo.)',
  '    if !connectionOptions.urlContexts.isEmpty {',
  '      self.scene(scene, openURLContexts: connectionOptions.urlContexts)',
  '    }',
  '    for userActivity in connectionOptions.userActivities {',
  '      self.scene(scene, continue: userActivity)',
  '    }',
  '  }',
  '',
  '  // Custom-scheme deep links (wisaw://). Forwarding to the AppDelegate keeps',
  '  // RCTLinkingManager (and therefore Linking.getInitialURL / expo-router) working.',
  '  @available(iOS 13.0, *)',
  '  func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {',
  '    guard let appDelegate = UIApplication.shared.delegate as? AppDelegate else {',
  '      return',
  '    }',
  '    for urlContext in URLContexts {',
  '      var options: [UIApplication.OpenURLOptionsKey: Any] = [',
  '        .openInPlace: urlContext.options.openInPlace',
  '      ]',
  '      if let sourceApplication = urlContext.options.sourceApplication {',
  '        options[.sourceApplication] = sourceApplication',
  '      }',
  '      if let annotation = urlContext.options.annotation {',
  '        options[.annotation] = annotation',
  '      }',
  '      _ = appDelegate.application(UIApplication.shared, open: urlContext.url, options: options)',
  '    }',
  '  }',
  '',
  '  // Universal links (applinks:wisaw.com, applinks:link.wisaw.com).',
  '  @available(iOS 13.0, *)',
  '  func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {',
  '    guard let appDelegate = UIApplication.shared.delegate as? AppDelegate else {',
  '      return',
  '    }',
  '    _ = appDelegate.application(UIApplication.shared, continue: userActivity) { _ in }',
  '  }',
  '',
  '  // Under the scene lifecycle UIKit stops calling these UIApplicationDelegate',
  '  // methods; forward them so Expo subscribers (expo-notifications, etc.) still see them.',
  '  @available(iOS 13.0, *)',
  '  func sceneDidBecomeActive(_ scene: UIScene) {',
  '    (UIApplication.shared.delegate as? AppDelegate)?.applicationDidBecomeActive(UIApplication.shared)',
  '  }',
  '',
  '  @available(iOS 13.0, *)',
  '  func sceneWillResignActive(_ scene: UIScene) {',
  '    (UIApplication.shared.delegate as? AppDelegate)?.applicationWillResignActive(UIApplication.shared)',
  '  }',
  '',
  '  @available(iOS 13.0, *)',
  '  func sceneWillEnterForeground(_ scene: UIScene) {',
  '    (UIApplication.shared.delegate as? AppDelegate)?.applicationWillEnterForeground(UIApplication.shared)',
  '  }',
  '',
  '  @available(iOS 13.0, *)',
  '  func sceneDidEnterBackground(_ scene: UIScene) {',
  '    (UIApplication.shared.delegate as? AppDelegate)?.applicationDidEnterBackground(UIApplication.shared)',
  '  }',
  '}',
  ''
].join('\n');

function patchAppDelegate(contents) {
  if (contents.includes('class SceneDelegate: UIResponder, UIWindowSceneDelegate')) {
    return contents; // already patched (idempotent for non-clean prebuild)
  }

  let nextContents = contents;

  // 1. Remove the pre-scene startup block — the SceneDelegate starts React
  //    Native once UIKit connects the scene. Deployment target is 16.4, so
  //    there is no legacy non-scene path to keep.
  const startupBlockPattern =
    /#if os\(iOS\) \|\| os\(tvOS\)\n\s*window = UIWindow\(frame: UIScreen\.main\.bounds\)\n\s*factory\.startReactNative\(\n\s*withModuleName: "main",\n\s*in: window,\n\s*launchOptions: launchOptions\)\n#endif/;
  if (!startupBlockPattern.test(nextContents)) {
    throw new Error(
      'with-ios-scene-lifecycle: could not find the React Native startup block in AppDelegate.swift — the Expo template changed; re-check whether this plugin is still needed (expo/expo#46664).'
    );
  }
  nextContents = nextContents.replace(
    startupBlockPattern,
    '    // React Native is started by SceneDelegate.scene(_:willConnectTo:options:)\n    // (UIScene lifecycle — see plugins/with-ios-scene-lifecycle).'
  );

  // 2. Route scene sessions to the SceneDelegate.
  const linkingMarker = '\n  // Linking API';
  if (!nextContents.includes(linkingMarker)) {
    throw new Error(
      'with-ios-scene-lifecycle: could not find the "// Linking API" marker in AppDelegate.swift.'
    );
  }
  nextContents = nextContents.replace(
    linkingMarker,
    '\n' + sceneConfigurationMethod + linkingMarker
  );

  // 3. Insert the SceneDelegate class before ReactNativeDelegate.
  const reactNativeDelegateMarker =
    '\nclass ReactNativeDelegate: ExpoReactNativeFactoryDelegate';
  if (!nextContents.includes(reactNativeDelegateMarker)) {
    throw new Error(
      'with-ios-scene-lifecycle: could not find ReactNativeDelegate in AppDelegate.swift.'
    );
  }
  return nextContents.replace(
    reactNativeDelegateMarker,
    '\n' + sceneDelegateClass + reactNativeDelegateMarker
  );
}

function addAppDelegateSceneLifecycle(config) {
  return withAppDelegate(config, (nextConfig) => {
    if (nextConfig.modResults.language !== 'swift') {
      throw new Error(
        'with-ios-scene-lifecycle: AppDelegate is ' +
          nextConfig.modResults.language +
          '; only Swift is supported.'
      );
    }
    nextConfig.modResults.contents = patchAppDelegate(nextConfig.modResults.contents);
    return nextConfig;
  });
}

function addInfoPlistSceneManifest(config) {
  return withInfoPlist(config, (nextConfig) => {
    nextConfig.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: 'Default Configuration',
            UISceneDelegateClassName: '$(PRODUCT_MODULE_NAME).SceneDelegate'
          }
        ]
      }
    };
    return nextConfig;
  });
}

module.exports = function withIosSceneLifecycle(config) {
  return addAppDelegateSceneLifecycle(addInfoPlistSceneManifest(config));
};
