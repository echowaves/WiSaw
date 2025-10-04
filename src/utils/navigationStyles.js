import { Platform, StatusBar } from 'react-native'
import * as CONST from '../consts'

/**
 * Get default header style with platform-specific adjustments
 * @param {Object} customStyle - Custom style overrides
 * @returns {Object} Complete header style
 */
export const getDefaultHeaderStyle = (customStyle = {}) => {
  const baseStyle = {
    backgroundColor: CONST.HEADER_GRADIENT_END,
    borderBottomWidth: 1,
    borderBottomColor: CONST.HEADER_BORDER_COLOR,
    shadowColor: CONST.HEADER_SHADOW_COLOR,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
    ...customStyle
  }

  return {
    ...baseStyle,
    ...(Platform.OS === 'android' && {
      paddingTop: StatusBar.currentHeight,
      height: (baseStyle.height || 56) + (StatusBar.currentHeight || 0)
    })
  }
}

/**
 * Get default screen options for navigation
 * @param {Object} customOptions - Custom options to override defaults
 * @returns {Object} Complete screen options
 */
export const getDefaultScreenOptions = (customOptions = {}) => ({
  gestureEnabled: true,
  headerShown: true,
  headerStyle: getDefaultHeaderStyle(customOptions.headerStyle),
  headerTitleStyle: {
    fontSize: 18,
    fontWeight: '600',
    color: CONST.TEXT_COLOR,
    ...customOptions.headerTitleStyle
  },
  headerTintColor: CONST.MAIN_COLOR,
  animationTypeForReplace: 'push',
  animation: 'slide_from_right',
  ...customOptions
})

/**
 * Get transparent header style for overlay screens
 * @param {Object} customStyle - Custom style overrides
 * @returns {Object} Transparent header style
 */
export const getTransparentHeaderStyle = (customStyle = {}) => {
  const baseStyle = {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    ...customStyle
  }

  return {
    ...baseStyle,
    ...(Platform.OS === 'android' && {
      paddingTop: StatusBar.currentHeight,
      height: (baseStyle.height || 56) + (StatusBar.currentHeight || 0)
    })
  }
}
