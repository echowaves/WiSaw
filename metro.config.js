const { getDefaultConfig } = require('@expo/metro-config')

// Get the default Expo Metro config
const config = getDefaultConfig(__dirname, {
  // Enable CSS support
  isCSSEnabled: true,
})

// Add 'cjs' to source extensions
config.resolver.sourceExts.push('cjs')

module.exports = config
