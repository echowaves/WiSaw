import React from 'react'
import { SafeAreaView as RNSafeAreaView } from 'react-native'
import { useSafeAreaViewStyle } from '../../hooks/useStatusBarHeight'

/**
 * Enhanced SafeAreaView that handles Android status bar automatically
 */
const SafeAreaView = ({ style, children, ...props }) => {
  const enhancedStyle = useSafeAreaViewStyle(style)

  return (
    <RNSafeAreaView style={enhancedStyle} {...props}>
      {children}
    </RNSafeAreaView>
  )
}

export default SafeAreaView
