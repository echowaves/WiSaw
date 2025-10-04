import { Dimensions, Platform, StatusBar } from 'react-native'
import * as CONST from '../consts'

// Get device dimensions for responsive header heights
const { width: screenWidth, height: screenHeight } = Dimensions.get('window')
const isSmallDevice = screenWidth < 768 // Phones vs tablets

// Header height constants
export const HEADER_HEIGHTS = {
  CONTENT_HEIGHT: 56, // minHeight of content container
  PADDING_VERTICAL: 12, // paddingVertical of content container
  TOTAL_HEIGHT: 80, // CONTENT_HEIGHT + (PADDING_VERTICAL * 2) + borders/shadows
  // For components that need to account for header overlap
  // Use larger offset for smaller devices (iPhones) due to different safe areas
  SAFE_AREA_OFFSET: isSmallDevice ? 120 : 100
}

// Light theme configuration
export const LIGHT_THEME = {
  // Use the light theme from PhotosList as the base
  BACKGROUND: CONST.BG_COLOR, // '#ffffff'
  TEXT_PRIMARY: CONST.TEXT_COLOR, // '#555f61'
  TEXT_SECONDARY: 'rgba(85, 95, 97, 0.7)',

  // Card and container styles
  CARD_BACKGROUND: 'rgba(255, 255, 255, 0.95)',
  CARD_BORDER: 'rgba(0, 0, 0, 0.06)',
  CARD_SHADOW: 'rgba(0, 0, 0, 0.25)',
  SURFACE: 'rgba(255, 255, 255, 0.98)',
  BORDER_LIGHT: 'rgba(0, 0, 0, 0.08)',

  // Header styles
  HEADER_BACKGROUND: CONST.HEADER_GRADIENT_END, // '#f8f9fa'
  HEADER_BORDER: CONST.HEADER_BORDER_COLOR,
  HEADER_SHADOW: CONST.HEADER_SHADOW_COLOR,

  // Interactive elements
  INTERACTIVE_BACKGROUND: 'rgba(234, 94, 61, 0.05)',
  INTERACTIVE_BORDER: 'rgba(234, 94, 61, 0.2)',
  INTERACTIVE_PRIMARY: CONST.MAIN_COLOR,
  INTERACTIVE_ACTIVE: CONST.SEGMENT_BACKGROUND_ACTIVE,
  INTERACTIVE_SECONDARY: 'rgba(234, 94, 61, 0.1)',

  // Disabled states
  TEXT_DISABLED: 'rgba(85, 95, 97, 0.4)',
  BACKGROUND_DISABLED: 'rgba(85, 95, 97, 0.05)',
  BORDER_DISABLED: 'rgba(85, 95, 97, 0.15)',

  // Status indicators
  STATUS_SUCCESS: '#4FC3F7',
  STATUS_EDIT: '#34C759',
  STATUS_WARNING: '#FFD700',
  STATUS_ERROR: '#FF4757',
  STATUS_CAUTION: '#FF9500',

  // Status indicator backgrounds (transparent variants)
  STATUS_ERROR_BACKGROUND: 'rgba(255, 71, 87, 0.15)',
  STATUS_ERROR_BORDER: 'rgba(255, 71, 87, 0.3)',
  STATUS_SUCCESS_BACKGROUND: 'rgba(79, 195, 247, 0.15)',
  STATUS_SUCCESS_BORDER: 'rgba(79, 195, 247, 0.3)',

  // Input and form styles
  inputFooterBackground: 'rgba(248, 249, 250, 0.8)',

  // Help and info styles
  helpCardBackground: 'rgba(79, 195, 247, 0.1)',
  helpCardBorder: 'rgba(79, 195, 247, 0.2)',

  // Disabled button state
  disabledBackground: CONST.SECONDARY_COLOR,

  // Aliases for theme consistency
  interactiveBackground: 'rgba(234, 94, 61, 0.1)'
}

// Dark theme configuration
export const DARK_THEME = {
  // Dark backgrounds
  BACKGROUND: '#121212',
  TEXT_PRIMARY: '#FFFFFF',
  TEXT_SECONDARY: 'rgba(255, 255, 255, 0.7)',

  // Card and container styles
  CARD_BACKGROUND: '#1E1E1E',
  CARD_BORDER: 'rgba(255, 255, 255, 0.12)',
  CARD_SHADOW: 'rgba(255, 255, 255, 0.1)',
  SURFACE: '#1A1A1A',
  BORDER_LIGHT: 'rgba(255, 255, 255, 0.12)',

  // Header styles
  HEADER_BACKGROUND: '#1F1F1F',
  HEADER_BORDER: 'rgba(255, 255, 255, 0.12)',
  HEADER_SHADOW: 'rgba(0, 0, 0, 0.3)',

  // Interactive elements
  INTERACTIVE_BACKGROUND: 'rgba(234, 94, 61, 0.15)',
  INTERACTIVE_BORDER: 'rgba(234, 94, 61, 0.3)',
  INTERACTIVE_PRIMARY: CONST.MAIN_COLOR,
  INTERACTIVE_ACTIVE: CONST.SEGMENT_BACKGROUND_ACTIVE,
  INTERACTIVE_SECONDARY: 'rgba(234, 94, 61, 0.2)',

  // Disabled states
  TEXT_DISABLED: 'rgba(255, 255, 255, 0.4)',
  BACKGROUND_DISABLED: 'rgba(255, 255, 255, 0.05)',
  BORDER_DISABLED: 'rgba(255, 255, 255, 0.15)',

  // Status indicators (slightly brighter for dark backgrounds)
  STATUS_SUCCESS: '#5DD3FD',
  STATUS_EDIT: '#30D158',
  STATUS_WARNING: '#FFE066',
  STATUS_ERROR: '#FF6B7D',
  STATUS_CAUTION: '#FFB84D',

  // Status indicator backgrounds (transparent variants)
  STATUS_ERROR_BACKGROUND: 'rgba(255, 107, 125, 0.2)',
  STATUS_ERROR_BORDER: 'rgba(255, 107, 125, 0.4)',
  STATUS_SUCCESS_BACKGROUND: 'rgba(93, 211, 253, 0.2)',
  STATUS_SUCCESS_BORDER: 'rgba(93, 211, 253, 0.4)',

  // Input and form styles
  inputFooterBackground: 'rgba(40, 40, 40, 0.8)',

  // Help and info styles
  helpCardBackground: 'rgba(93, 211, 253, 0.15)',
  helpCardBorder: 'rgba(93, 211, 253, 0.3)',

  // Disabled button state
  disabledBackground: 'rgba(255, 255, 255, 0.1)',

  // Aliases for theme consistency
  interactiveBackground: 'rgba(234, 94, 61, 0.15)'
}

// Function to get current theme based on mode
export const getTheme = (isDark) => (isDark ? DARK_THEME : LIGHT_THEME)

// Default theme (for backward compatibility)
export const THEME = LIGHT_THEME

// Shared container styles
export const SHARED_CONTAINERS = {
  main: {
    flex: 1,
    backgroundColor: THEME.BACKGROUND
  },

  scrollContainer: {
    flex: 1,
    backgroundColor: THEME.BACKGROUND
  },

  contentContainer: {
    backgroundColor: THEME.BACKGROUND,
    paddingBottom: 40
  },

  card: {
    backgroundColor: THEME.CARD_BACKGROUND,
    borderRadius: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: THEME.CARD_BORDER,
    shadowColor: THEME.CARD_SHADOW,
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },

  infoCard: {
    backgroundColor: THEME.CARD_BACKGROUND,
    borderRadius: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: THEME.CARD_BORDER,
    shadowColor: THEME.CARD_SHADOW,
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  }
}

// Shared text styles
export const SHARED_TEXT = {
  primary: {
    color: THEME.TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '400'
  },

  secondary: {
    color: THEME.TEXT_SECONDARY,
    fontSize: 14,
    fontWeight: '400'
  },

  heading: {
    color: THEME.TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: '700'
  },

  subheading: {
    color: THEME.TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '600'
  },

  caption: {
    color: THEME.TEXT_SECONDARY,
    fontSize: 12,
    fontWeight: '500'
  }
}

// Shared header styles
export const SHARED_HEADER = {
  container: {
    backgroundColor: THEME.HEADER_BACKGROUND,
    borderBottomWidth: 1,
    borderBottomColor: THEME.HEADER_BORDER,
    shadowColor: THEME.HEADER_SHADOW,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3
  },

  title: {
    color: THEME.TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '600'
  },

  subtitle: {
    color: THEME.TEXT_SECONDARY,
    fontSize: 14,
    fontWeight: '500'
  },

  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: HEADER_HEIGHTS.PADDING_VERTICAL,
    minHeight: HEADER_HEIGHTS.CONTENT_HEIGHT
  },

  // Reusable header style configurations
  drawerStyle: {
    backgroundColor: THEME.HEADER_BACKGROUND,
    borderBottomWidth: 1,
    borderBottomColor: THEME.HEADER_BORDER,
    shadowColor: THEME.HEADER_SHADOW,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3
  },

  modalStyle: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)'
  },

  modalTitleStyle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#fff'
  },

  // Transparent overlay header style for photo details and similar screens
  transparentStyle: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    height: HEADER_HEIGHTS.TOTAL_HEIGHT,
    ...Platform.select({
      android: {
        height: HEADER_HEIGHTS.TOTAL_HEIGHT + (StatusBar.currentHeight || 0)
      }
    })
  },

  transparentTitleStyle: {
    fontSize: 16,
    fontWeight: 600,
    color: THEME.TEXT_PRIMARY
  },

  // For Expo Router headers to ensure consistent height
  routeStyle: {
    height: HEADER_HEIGHTS.TOTAL_HEIGHT,
    ...Platform.select({
      android: {
        height: HEADER_HEIGHTS.TOTAL_HEIGHT + (StatusBar.currentHeight || 0)
      }
    })
  },

  // Dynamic header height calculation utility
  getDynamicHeight: (safeAreaTop, isSmallDevice = false) => {
    const headerContentHeight = HEADER_HEIGHTS.CONTENT_HEIGHT + HEADER_HEIGHTS.PADDING_VERTICAL * 2
    const buffer = isSmallDevice ? 10 : 5
    return safeAreaTop + headerContentHeight + buffer
  }
}

// Shared interactive elements
export const SHARED_INTERACTIVE = {
  button: {
    backgroundColor: THEME.INTERACTIVE_BACKGROUND,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: THEME.INTERACTIVE_BORDER
  },

  buttonText: {
    color: CONST.MAIN_COLOR,
    fontSize: 14,
    fontWeight: '600'
  },

  // Primary button styles for forms and actions
  primaryButton: {
    borderRadius: 12,
    backgroundColor: CONST.MAIN_COLOR,
    shadowColor: CONST.MAIN_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    paddingVertical: 16
  },

  primaryButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    paddingRight: 8
  },

  // Secondary button styles
  secondaryButton: {
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: THEME.BORDER_LIGHT,
    paddingVertical: 14
  },

  secondaryButtonTitle: {
    ...SHARED_TEXT.secondary,
    fontSize: 16,
    fontWeight: '500'
  },

  // Button container for consistent spacing
  buttonContainer: {
    marginTop: 20
  },

  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    backgroundColor: THEME.INTERACTIVE_BACKGROUND,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.INTERACTIVE_BORDER
  },

  headerButton: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: THEME.INTERACTIVE_BACKGROUND,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: THEME.INTERACTIVE_BORDER,
    shadowColor: THEME.CARD_SHADOW,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4
  },

  statText: {
    color: THEME.TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6
  }
}

// Shared layout utilities
export const SHARED_LAYOUT = {
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },

  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  centered: {
    justifyContent: 'center',
    alignItems: 'center'
  },

  separator: {
    borderBottomWidth: 1,
    borderBottomColor: THEME.CARD_BORDER,
    marginVertical: 12,
    paddingBottom: 12
  }
}

// Combined styles object for easy importing
export const SHARED_STYLES = {
  containers: SHARED_CONTAINERS,
  text: SHARED_TEXT,
  header: SHARED_HEADER,
  interactive: SHARED_INTERACTIVE,
  layout: SHARED_LAYOUT,
  theme: THEME
}

// Hook to get current theme based on dark mode state
// This will be used by components that need dynamic theming
export const useCurrentTheme = () => {
  const { useAtom } = require('jotai')
  const { isDarkMode } = require('../state')
  const [isDark] = useAtom(isDarkMode)
  return getTheme(isDark)
}

// Function to get themed styles (for components that need dynamic styles)
export const getThemedStyles = (isDark) => {
  const currentTheme = getTheme(isDark)

  return {
    containers: {
      main: {
        flex: 1,
        backgroundColor: currentTheme.BACKGROUND
      },
      scrollContainer: {
        flex: 1,
        backgroundColor: currentTheme.BACKGROUND
      },
      contentContainer: {
        backgroundColor: currentTheme.BACKGROUND,
        paddingBottom: 40
      },
      card: {
        backgroundColor: currentTheme.CARD_BACKGROUND,
        borderRadius: 20,
        marginVertical: 8,
        marginHorizontal: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: currentTheme.CARD_BORDER,
        shadowColor: currentTheme.CARD_SHADOW,
        shadowOffset: {
          width: 0,
          height: 4
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8
      }
    },
    text: {
      primary: {
        color: currentTheme.TEXT_PRIMARY,
        fontSize: 16,
        fontWeight: '400'
      },
      secondary: {
        color: currentTheme.TEXT_SECONDARY,
        fontSize: 14,
        fontWeight: '400'
      },
      heading: {
        color: currentTheme.TEXT_PRIMARY,
        fontSize: 18,
        fontWeight: '700'
      }
    },
    interactive: {
      button: {
        backgroundColor: currentTheme.INTERACTIVE_BACKGROUND,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: currentTheme.INTERACTIVE_BORDER
      }
    },
    theme: currentTheme
  }
}
