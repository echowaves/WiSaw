const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

config.resolver.sourceExts.push('ios.js', 'android.js')

module.exports = config
