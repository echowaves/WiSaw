import React from 'react'
import { View } from 'react-native'
import { useHeaderStyle } from '../../hooks/useStatusBarHeight'

/**
 * Header container that automatically handles status bar spacing
 */
const HeaderContainer = ({ style, children, ...props }) => {
  const enhancedStyle = useHeaderStyle(style)

  return (
    <View style={enhancedStyle} {...props}>
      {children}
    </View>
  )
}

export default HeaderContainer
