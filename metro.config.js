const path = require('path')
const { getDefaultConfig } = require('@expo/metro-config')

// Local expo-masonry-layout for development
const masonryLayoutRoot = path.resolve(__dirname, '../expo-masonry-layout')

const config = getDefaultConfig(__dirname, {
  // Enable CSS support
  isCSSEnabled: true
})

// Watch the local masonry layout package so Metro can resolve it
config.watchFolders = [masonryLayoutRoot]

// Ensure react/react-native resolve from WiSaw's node_modules, not the library's
config.resolver.nodeModulesPaths = [path.resolve(__dirname, 'node_modules')]

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
