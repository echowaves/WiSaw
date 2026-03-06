import React from 'react'
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context'

const SafeAreaView = ({ children, ...props }) => {
  return <RNSafeAreaView {...props}>{children}</RNSafeAreaView>
}

export default SafeAreaView
