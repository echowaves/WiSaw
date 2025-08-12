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
  SAFE_AREA_OFFSET: isSmallDevice ? 120 : 100,
}

// Shared theme configuration
export const THEME = {
  // Use the light theme from PhotosList as the base
  BACKGROUND: CONST.BG_COLOR, // '#ffffff'
  TEXT_PRIMARY: CONST.TEXT_COLOR, // '#555f61'
  TEXT_SECONDARY: 'rgba(85, 95, 97, 0.7)',

  // Card and container styles
  CARD_BACKGROUND: 'rgba(255, 255, 255, 0.95)',
  CARD_BORDER: 'rgba(0, 0, 0, 0.06)',
  CARD_SHADOW: 'rgba(0, 0, 0, 0.08)',
  SURFACE: 'rgba(255, 255, 255, 0.98)',
  BORDER_LIGHT: 'rgba(0, 0, 0, 0.08)',

  // Header styles
  HEADER_BACKGROUND: CONST.HEADER_GRADIENT_END, // '#f8f9fa'
  HEADER_BORDER: CONST.HEADER_BORDER_COLOR,
  HEADER_SHADOW: CONST.HEADER_SHADOW_COLOR,

  // Interactive elements
  INTERACTIVE_BACKGROUND: 'rgba(234, 94, 61, 0.05)',
  INTERACTIVE_BORDER: 'rgba(234, 94, 61, 0.2)',
  INTERACTIVE_ACTIVE: CONST.SEGMENT_BACKGROUND_ACTIVE,
  INTERACTIVE_SECONDARY: 'rgba(234, 94, 61, 0.1)',

  // Disabled states
  TEXT_DISABLED: 'rgba(85, 95, 97, 0.4)',
  BACKGROUND_DISABLED: 'rgba(85, 95, 97, 0.05)',
  BORDER_DISABLED: 'rgba(85, 95, 97, 0.15)',

  // Status indicators
  STATUS_SUCCESS: '#4FC3F7',
  STATUS_WARNING: '#FFD700',
  STATUS_ERROR: '#FF4757',
  STATUS_CAUTION: '#FF9500',
}

// Shared container styles
export const SHARED_CONTAINERS = {
  main: {
    flex: 1,
    backgroundColor: THEME.BACKGROUND,
  },

  scrollContainer: {
    flex: 1,
    backgroundColor: THEME.BACKGROUND,
  },

  contentContainer: {
    backgroundColor: THEME.BACKGROUND,
    paddingBottom: 40,
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
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
}

// Shared text styles
export const SHARED_TEXT = {
  primary: {
    color: THEME.TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '400',
  },

  secondary: {
    color: THEME.TEXT_SECONDARY,
    fontSize: 14,
    fontWeight: '400',
  },

  heading: {
    color: THEME.TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: '700',
  },

  subheading: {
    color: THEME.TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '600',
  },

  caption: {
    color: THEME.TEXT_SECONDARY,
    fontSize: 12,
    fontWeight: '500',
  },
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
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },

  title: {
    color: THEME.TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '600',
  },

  subtitle: {
    color: THEME.TEXT_SECONDARY,
    fontSize: 14,
    fontWeight: '500',
  },

  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: HEADER_HEIGHTS.PADDING_VERTICAL,
    minHeight: HEADER_HEIGHTS.CONTENT_HEIGHT,
  },

  // For Expo Router headers to ensure consistent height
  routeStyle: {
    height: HEADER_HEIGHTS.TOTAL_HEIGHT,
    ...Platform.select({
      android: {
        height: HEADER_HEIGHTS.TOTAL_HEIGHT + (StatusBar.currentHeight || 0),
      },
    }),
  },

  // Dynamic header height calculation utility
  getDynamicHeight: (safeAreaTop, isSmallDevice = false) => {
    const headerContentHeight =
      HEADER_HEIGHTS.CONTENT_HEIGHT + HEADER_HEIGHTS.PADDING_VERTICAL * 2
    const buffer = isSmallDevice ? 10 : 5
    return safeAreaTop + headerContentHeight + buffer
  },
}

// Shared interactive elements
export const SHARED_INTERACTIVE = {
  button: {
    backgroundColor: THEME.INTERACTIVE_BACKGROUND,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: THEME.INTERACTIVE_BORDER,
  },

  buttonText: {
    color: CONST.MAIN_COLOR,
    fontSize: 14,
    fontWeight: '600',
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
    borderColor: THEME.INTERACTIVE_BORDER,
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
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  statText: {
    color: THEME.TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
}

// Shared layout utilities
export const SHARED_LAYOUT = {
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  separator: {
    borderBottomWidth: 1,
    borderBottomColor: THEME.CARD_BORDER,
    marginVertical: 12,
    paddingBottom: 12,
  },
}

// Combined styles object for easy importing
export const SHARED_STYLES = {
  containers: SHARED_CONTAINERS,
  text: SHARED_TEXT,
  header: SHARED_HEADER,
  interactive: SHARED_INTERACTIVE,
  layout: SHARED_LAYOUT,
  theme: THEME,
}
