let Notifications

try {
  Notifications = require('expo-notifications')
} catch (e) {
  // expo-notifications is not available (e.g. Expo Go SDK 53+)
  Notifications = {
    setBadgeCountAsync: async () => {},
    requestPermissionsAsync: async () => ({})
  }
}

module.exports = Notifications
