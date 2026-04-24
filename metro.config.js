const path = require('path')
const fs = require('fs')
const { getDefaultConfig } = require('@expo/metro-config')

// Local expo-masonry-layout for development (only if it exists)
const masonryLayoutRoot = path.resolve(__dirname, '../expo-masonry-layout')
const useLocalMasonry = fs.existsSync(masonryLayoutRoot)

const config = getDefaultConfig(__dirname, {
  // Enable CSS support
  isCSSEnabled: true
})

// Watch the local masonry layout package so Metro can resolve it
if (useLocalMasonry) {
  config.watchFolders = [masonryLayoutRoot]
}

// Ensure react/react-native resolve from WiSaw's node_modules, not the library's
config.resolver.nodeModulesPaths = [path.resolve(__dirname, 'node_modules')]

// Force the local masonry package to use the app's React (prevent duplicate React)
config.resolver.extraNodeModules = {
  react: path.resolve(__dirname, 'node_modules/react'),
  'react-native': path.resolve(__dirname, 'node_modules/react-native')
}

// Intercept resolution from the local package to prevent duplicate React
const appNodeModules = path.resolve(__dirname, 'node_modules')
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // When resolving react or react-native from inside the local masonry package,
  // force it to resolve from the app's node_modules
  if (
    context.originModulePath.includes('expo-masonry-layout') &&
    (moduleName === 'react' || moduleName === 'react-native' ||
     moduleName.startsWith('react/') || moduleName.startsWith('react-native/'))
  ) {
    return context.resolveRequest(
      { ...context, nodeModulesPaths: [appNodeModules] },
      moduleName,
      platform
    )
  }
  return context.resolveRequest(context, moduleName, platform)
}

// Performance optimizations
config.transformer.minifierConfig = {
  mangle: {
    keep_fnames: true
  },
  output: {
    ascii_only: true,
    quote_style: 3,
    wrap_iife: true
  },
  sourceMap: {
    includeSources: false
  },
  toplevel: false,
  compress: {
    reduce_funcs: false
  }
}

// Optimize resolver for faster lookups
config.resolver.sourceExts.push('cjs')
config.resolver.platforms = ['ios', 'android', 'native', 'web']

module.exports = config
