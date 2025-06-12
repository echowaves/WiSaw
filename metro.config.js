const { getDefaultConfig } = require('@expo/metro-config')

const config = getDefaultConfig(__dirname, {
  // Enable CSS support
  isCSSEnabled: true,
})

// const { resolver: defaultResolver } = config
// exports.resolver = {
//   ...defaultResolver,
//   sourceExts: [
//     ...defaultResolver.sourceExts, // 'js', 'json', 'ts', 'tsx',
//     "cjs",
//   ],
// }
config.resolver.sourceExts.push('cjs')

module.exports = config
