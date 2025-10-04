const { getDefaultConfig } = require('@expo/metro-config')

const config = getDefaultConfig(__dirname, {
  // Enable CSS support
  isCSSEnabled: true
})

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
