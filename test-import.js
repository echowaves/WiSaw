// Test import of expo-masonry-layout
try {
  const { ExpoMasonryLayout } = require('expo-masonry-layout')
  console.log('SUCCESS: expo-masonry-layout imported successfully')
  console.log('ExpoMasonryLayout:', ExpoMasonryLayout)
} catch (error) {
  console.log('ERROR importing expo-masonry-layout:', error.message)
}
