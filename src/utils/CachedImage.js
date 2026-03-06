import React, { useState } from 'react'
import { View } from 'react-native'
import { Image } from 'expo-image'

// Compatibility wrapper matching the expo-cached-image CachedImage API
const CachedImage = ({ source, cacheKey, resizeMode, placeholderContent, style, ...rest }) => {
  const [isLoading, setIsLoading] = useState(!!placeholderContent)

  const contentFit = resizeMode || 'cover'

  return (
    <View style={style}>
      {isLoading && placeholderContent}
      <Image
        source={source}
        contentFit={contentFit}
        cachePolicy='memory-disk'
        style={{ width: '100%', height: '100%' }}
        onLoad={() => setIsLoading(false)}
        {...rest}
      />
    </View>
  )
}

export default CachedImage
