import FontAwesome from '@react-native-vector-icons/fontawesome'
import FontAwesome5 from '@react-native-vector-icons/fontawesome5'
import MaterialIcons from '@react-native-vector-icons/material-icons'
import { fa5IconStyle } from '../../src/utils/fa5IconStyle'
import {
  Drawer,
  type DrawerContentComponentProps,
  type DrawerNavigationOptions
} from 'expo-router/drawer'
import { useAtom } from 'jotai'
import React from 'react'
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ColorValue
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import appConfig from '../../app.config.js'
import * as CONST from '../../src/consts'
import { UploadProvider } from '../../src/contexts/UploadContext'
import GlobalUploadBanner from '../../src/components/GlobalUploadBanner'
import * as STATE from '../../src/state'
import { getTheme } from '../../src/theme/sharedStyles'
import { SCREEN_HEADER_ICONS } from '../../src/theme/screenIcons'
import {
  getSystemTheme,
  saveFollowSystemPreference,
  saveThemePreference
} from '../../src/utils/themeStorage'

// Get version and build number from app.config.js
// Version comes from package.json, build number is shared between iOS and Android
const APP_VERSION = appConfig.expo.version
const BUILD_NUMBER = appConfig.expo.ios.buildNumber

const DRAWER_SPACING = 12
const THEME_MODES = ['light', 'dark', 'system'] as const
type ThemeMode = (typeof THEME_MODES)[number]

type StylesShape = ReturnType<typeof StyleSheet.create>

const createStyles = (isDark: boolean): StylesShape => {
  const theme = getTheme(isDark)

  return StyleSheet.create({
    themeContainer: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: theme.BORDER_LIGHT,
      backgroundColor: theme.HEADER_BACKGROUND
    },
    themeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.INTERACTIVE_BACKGROUND,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.INTERACTIVE_BORDER
    },
    themeText: {
      fontSize: 14,
      fontWeight: '600',
      color: CONST.MAIN_COLOR,
      marginLeft: 8
    },
    versionContainer: {
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: theme.BORDER_LIGHT,
      backgroundColor: theme.HEADER_BACKGROUND,
      alignItems: 'center'
    },
    versionText: {
      fontSize: 12,
      color: theme.TEXT_SECONDARY,
      fontWeight: '500',
      textAlign: 'center'
    },
    appName: {
      fontSize: 14,
      fontWeight: '600',
      color: CONST.MAIN_COLOR,
      marginBottom: 4
    },
    drawerRowContainer: {
      borderCurve: 'continuous',
      overflow: 'hidden'
    },
    drawerRowWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 11,
      paddingStart: 16,
      paddingEnd: 24,
      borderCurve: 'continuous'
    },
    drawerRowLabel: {
      marginEnd: 12,
      marginVertical: 4,
      flex: 1
    },
    drawerRowLabelText: {
      lineHeight: 24,
      textAlignVertical: 'center'
    }
  })
}

// Custom drawer row replicating the former @react-navigation/drawer DrawerItem
// visuals. The app sets explicit active/inactive tints + active background in the
// Drawer screenOptions, so no theme lookup is required here.
interface DrawerRowProps {
  focused: boolean
  options: DrawerNavigationOptions
  onPress: () => void
  styles: StylesShape
}

const DrawerRow = ({
  focused,
  options,
  onPress,
  styles
}: DrawerRowProps): React.JSX.Element => {
  const {
    drawerLabel,
    drawerIcon,
    drawerLabelStyle,
    drawerItemStyle
  } = options
  const label = drawerLabel
  const icon = drawerIcon
  const color = focused
    ? (options.drawerActiveTintColor ?? 'transparent')
    : (options.drawerInactiveTintColor ?? 'transparent')
  const backgroundColor = focused
    ? (options.drawerActiveBackgroundColor ?? 'transparent')
    : (options.drawerInactiveBackgroundColor ?? 'transparent')
  const borderRadius = StyleSheet.flatten(drawerItemStyle)?.borderRadius ?? 12
  const hasIcon = typeof icon === 'function'
  const iconNode = hasIcon
    ? icon({ size: 24, focused, color })
    : null
  const labelIsString = typeof label === 'string'
  const labelIsFn = typeof label === 'function'

  return (
    <View
      collapsable={false}
      style={[styles.drawerRowContainer, { borderRadius, backgroundColor }, drawerItemStyle]}
    >
      <Pressable
        onPress={onPress}
        accessibilityRole='button'
        accessibilityState={{ selected: focused }}
      >
        <View style={[styles.drawerRowWrapper, { borderRadius }]}>
          {iconNode}
          <View style={[styles.drawerRowLabel, { marginStart: hasIcon ? 12 : 0 }]}>
            {labelIsString
              ? (
                <Text
                  numberOfLines={1}
                  style={[styles.drawerRowLabelText, { color }, drawerLabelStyle]}
                >
                  {label}
                </Text>
                )
              : (labelIsFn ? label({ color, focused }) : null)}
          </View>
        </View>
      </Pressable>
    </View>
  )
}

// Custom Drawer Content with Theme Switcher and Version Information
const CustomDrawerContent = (props: DrawerContentComponentProps): React.JSX.Element => {
  const { state, navigation, descriptors } = props
  const [isDark, setIsDark] = useAtom(STATE.isDarkMode)
  const [followSystemTheme, setFollowSystemTheme] = useAtom(
    STATE.followSystemTheme
  )
  const styles = createStyles(isDark)
  const theme = getTheme(isDark)
  const insets = useSafeAreaInsets()

  const handleThemeChange = async (themeMode: ThemeMode): Promise<void> => {
    switch (themeMode) {
      case 'light':
        setIsDark(false)
        setFollowSystemTheme(false)
        await saveThemePreference(false)
        await saveFollowSystemPreference(false)
        break
      case 'dark':
        setIsDark(true)
        setFollowSystemTheme(false)
        await saveThemePreference(true)
        await saveFollowSystemPreference(false)
        break
      case 'system':
        setFollowSystemTheme(true)
        setIsDark(getSystemTheme()) // Set immediate system theme
        await saveFollowSystemPreference(true)
        break
    }
  }

  const getCurrentThemeMode = (): ThemeMode => {
    if (followSystemTheme) return 'system'
    return isDark ? 'dark' : 'light'
  }

  const getThemeIcon = (mode: ThemeMode): 'sun' | 'moon' | 'mobile-alt' => {
    switch (mode) {
      case 'light':
        return 'sun'
      case 'dark':
        return 'moon'
      case 'system':
        return 'mobile-alt'
    }
  }

  const getThemeLabel = (mode: ThemeMode): string => {
    switch (mode) {
      case 'light':
        return 'Light Mode'
      case 'dark':
        return 'Dark Mode'
      case 'system':
        return 'Auto'
    }
  }

  const focusedRouteKey = state.routes[state.index].key
  const focusedOptions = descriptors[focusedRouteKey].options

  const handleItemPress = (routeName: string, routeKey: string, focused: boolean): void => {
    const event = navigation.emit({
      type: 'drawerItemPress',
      target: routeKey,
      canPreventDefault: true
    })
    if (!event.defaultPrevented) {
      if (focused) {
        navigation.closeDrawer()
      } else {
        // The drawer auto-closes on route change (DrawerRouter)
        navigation.navigate(routeName)
      }
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.BACKGROUND }}>
      <ScrollView
        contentContainerStyle={[
          {
            paddingTop: DRAWER_SPACING + insets.top,
            paddingBottom: DRAWER_SPACING + insets.bottom,
            paddingStart: DRAWER_SPACING + insets.left,
            paddingEnd: DRAWER_SPACING + insets.right
          },
          focusedOptions.drawerContentContainerStyle
        ]}
        style={[{ flex: 1 }, focusedOptions.drawerContentStyle]}
      >
        {state.routes.map((route, i) => (
          <DrawerRow
            key={route.key}
            focused={i === state.index}
            options={descriptors[route.key].options}
            onPress={() => handleItemPress(route.name, route.key, i === state.index)}
            styles={styles}
          />
        ))}
      </ScrollView>

      {/* Theme Switcher */}
      <View style={styles.themeContainer}>
        <Text
          style={[
            styles.themeText,
            { textAlign: 'center', marginBottom: 12, marginLeft: 0 }
          ]}
        >
          Theme
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {THEME_MODES.map((mode) => (
            <TouchableOpacity
              key={mode}
              onPress={() => { void handleThemeChange(mode) }}
              style={[
                styles.themeButton,
                {
                  flex: 1,
                  marginHorizontal: 2,
                  backgroundColor:
                    getCurrentThemeMode() === mode
                      ? theme.INTERACTIVE_PRIMARY
                      : theme.INTERACTIVE_BACKGROUND
                }
              ]}
            >
              <FontAwesome5
                name={getThemeIcon(mode)}
                // name is a union spanning regular (sun/moon) and solid (mobile-alt);
                // fa5IconStyle resolves the per-glyph style at runtime.
                iconStyle={fa5IconStyle(getThemeIcon(mode)) as any}
                size={16}
                color={
                  getCurrentThemeMode() === mode ? '#FFFFFF' : CONST.MAIN_COLOR
                }
              />
              <Text
                style={[
                  styles.themeText,
                  {
                    fontSize: 12,
                    marginLeft: 4,
                    color:
                      getCurrentThemeMode() === mode
                        ? '#FFFFFF'
                        : CONST.MAIN_COLOR
                  }
                ]}
              >
                {getThemeLabel(mode).split(' ')[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Version Info */}
      <View style={styles.versionContainer}>
        <Text style={styles.appName}>WiSaw</Text>
        <Text style={styles.versionText}>Version {APP_VERSION}</Text>
        <Text style={styles.versionText}>Build {BUILD_NUMBER}</Text>
      </View>
    </View>
  )
}

interface IconProps {
  color: ColorValue
  size: number
  focused: boolean
}

interface LabelProps {
  color: ColorValue
  focused: boolean
}

// Inline components for identity drawer item — read nickName atom for dynamic icon/label
const IdentityDrawerIcon = ({ color, size, focused }: IconProps): React.JSX.Element => {
  const [nickName] = useAtom(STATE.nickName)
  const hasIdentity = nickName !== ''
  const iconColor = hasIdentity && !focused ? CONST.MAIN_COLOR : color

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <FontAwesome name={SCREEN_HEADER_ICONS.identity.name} size={22} color={iconColor} />
      {!hasIdentity && (
        <View style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: '#FF3B30'
        }}
        />
      )}
    </View>
  )
}

// Inline component for friends drawer item — show MAIN_COLOR when user has friends
const FriendsDrawerIcon = ({ color, size, focused }: IconProps): React.JSX.Element => {
  const [friendsList] = useAtom(STATE.friendsList)
  const hasFriends = (Array.isArray(friendsList) ? friendsList : []).length > 0
  const iconColor = hasFriends && !focused ? CONST.MAIN_COLOR : color

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <FontAwesome5 name={SCREEN_HEADER_ICONS.friends.name} iconStyle='solid' size={22} color={iconColor} />
    </View>
  )
}

// Inline component for waves drawer item
const WavesDrawerIcon = ({ color, size, focused }: IconProps): React.JSX.Element => {
  const [wavesCount] = useAtom(STATE.wavesCount)
  const hasActivity = (typeof wavesCount === 'number' ? wavesCount : 0) > 0
  const iconColor = hasActivity && !focused ? CONST.MAIN_COLOR : color

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <FontAwesome5 name={SCREEN_HEADER_ICONS.waves.name} iconStyle='solid' size={22} color={iconColor} />
    </View>
  )
}

const IdentityDrawerLabel = ({ color, focused }: LabelProps): React.JSX.Element => {
  const [nickName] = useAtom(STATE.nickName)
  const hasIdentity = nickName !== ''

  return (
    <Text
      style={{
        color,
        fontSize: 16,
        fontWeight: '600',
        marginLeft: -10,
        textTransform: 'capitalize'
      }}
    >
      {hasIdentity ? nickName : 'Set Up Identity'}
    </Text>
  )
}

export default function DrawerLayout (): React.JSX.Element {
  const [isDark] = useAtom(STATE.isDarkMode)
  const [netAvailable] = useAtom(STATE.netAvailable)
  const theme = getTheme(isDark)

  const offlineScreenListeners = netAvailable
    ? undefined
    : { drawerItemPress: (e) => e.preventDefault() }
  const offlineItemStyle = netAvailable
    ? undefined
    : { opacity: 0.4 }

  return (
    <UploadProvider>
      <View style={{ flex: 1 }}>
        <GlobalUploadBanner />
        <Drawer
          screenOptions={{
            headerShown: false,
            drawerStyle: {
              backgroundColor: theme.BACKGROUND,
              width: 280
            },
            drawerActiveTintColor: 'white',
            drawerActiveBackgroundColor: CONST.MAIN_COLOR,
            drawerInactiveTintColor: isDark ? '#BBB' : '#666',
            drawerItemStyle: {
              borderRadius: 12,
              marginVertical: 4,
              marginHorizontal: 8,
              paddingHorizontal: 12
            },
            drawerLabelStyle: {
              fontSize: 16,
              fontWeight: '600',
              marginLeft: -10,
              textTransform: 'capitalize'
            },
            // Performance optimizations
            swipeEnabled: true,
            swipeEdgeWidth: 20,
            drawerType: 'front',
            overlayColor: 'rgba(0, 0, 0, 0.5)'
          }}
          drawerContent={(props) => <CustomDrawerContent {...props} />}
        >
          <Drawer.Screen
            name='(tabs)'
            options={{
              drawerIcon: ({ color, size }) => (
                <FontAwesome5 name='home' iconStyle='solid' size={22} color={color} />
              ),
              drawerLabel: 'Home',
              title: 'Home'
            }}
          />
          <Drawer.Screen
            name='identity'
            options={{
              drawerIcon: (props) => <IdentityDrawerIcon {...props} />,
              drawerLabel: (props) => <IdentityDrawerLabel {...props} />,
              title: 'Identity',
              headerShown: false,
              drawerItemStyle: offlineItemStyle
            }}
            listeners={offlineScreenListeners}
          />
          <Drawer.Screen
            name='friends'
            options={{
              drawerIcon: (props) => <FriendsDrawerIcon {...props} />,
              drawerLabel: 'Friends',
              title: 'Friends',
              headerShown: false,
              drawerItemStyle: offlineItemStyle
            }}
            listeners={offlineScreenListeners}
          />
          <Drawer.Screen
            name='waves'
            options={{
              drawerIcon: (props) => <WavesDrawerIcon {...props} />,
              drawerLabel: 'Waves',
              title: 'Waves',
              headerShown: false,
              drawerItemStyle: offlineItemStyle
            }}
            listeners={offlineScreenListeners}
          />
          <Drawer.Screen
            name='feedback'
            options={{
              drawerIcon: ({ color, size }) => (
                <MaterialIcons name={SCREEN_HEADER_ICONS.feedback.name} size={22} color={color} />
              ),
              drawerLabel: 'Feedback',
              title: 'Feedback',
              headerShown: false,
              drawerItemStyle: offlineItemStyle
            }}
            listeners={offlineScreenListeners}
          />
        </Drawer>
      </View>
    </UploadProvider>
  )
}
