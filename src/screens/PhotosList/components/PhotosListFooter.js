import React from 'react'
import {
  View,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions
} from 'react-native'
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons'
import { router } from 'expo-router'
import * as Notifications from 'expo-notifications'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import Badge from '../../../components/ui/Badge'
import * as CONST from '../../../consts'

const FOOTER_HEIGHT = 90

const PhotosListFooter = ({
  theme,
  navigation,
  netAvailable,
  unreadCount,
  isCameraOpening,
  onCameraPress,
  location
}) => {
  const { width } = useWindowDimensions()
  const insets = useSafeAreaInsets()

  // Update badge count side effect - maybe this should be in the parent or a hook?
  // Keeping it here for now to match original behavior, but it's a side effect in render.
  // Better to move it to useEffect in parent, but let's stick to extraction first.
  // Actually, renderFooter had this: Notifications.setBadgeCountAsync(unreadCount || 0)
  // I will leave it out and assume the parent handles it or I'll add a useEffect here.
  React.useEffect(() => {
    Notifications.setBadgeCountAsync(unreadCount || 0)
  }, [unreadCount])

  if (!location) return null

  const styles = StyleSheet.create({
    footerContainer: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      left: 0,
      borderTopWidth: 1,
      borderTopColor: theme.BORDER_LIGHT,
      shadowColor: theme.HEADER_SHADOW
    },
    videoRecordButton: {
      justifyContent: 'center',
      alignItems: 'center',
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.STATUS_ERROR,
      shadowColor: theme.STATUS_ERROR,
      shadowOffset: {
        width: 0,
        height: 4
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 15,
      zIndex: 15
    },
    badgeStyle: {
      backgroundColor: theme.STATUS_ERROR,
      borderWidth: 2,
      borderColor: theme.BACKGROUND,
      minWidth: 20,
      height: 20,
      borderRadius: 10
    }
  })

  return (
    <View
      style={{
        backgroundColor: theme.CARD_BACKGROUND,
        width,
        height: FOOTER_HEIGHT,
        paddingBottom: insets.bottom,
        ...styles.footerContainer,
        shadowOffset: {
          width: 0,
          height: -2
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 14,
        zIndex: 14
      }}
    >
      <SafeAreaView
        style={{
          flex: 1
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingTop: 10,
            height: '100%',
            elevation: 14,
            zIndex: 14
          }}
        >
          {/* Navigation Menu Button */}
          <TouchableOpacity
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: theme.INTERACTIVE_BACKGROUND,
              elevation: 15,
              zIndex: 15
            }}
            onPress={() => {
              try {
                navigation.openDrawer()
              } catch (error) {
                // Fallback if drawer navigation is not available
                console.log('Could not open drawer:', error)
              }
            }}
            disabled={!netAvailable}
          >
            <FontAwesome
              name='navicon'
              size={22}
              color={netAvailable ? CONST.MAIN_COLOR : theme.TEXT_DISABLED}
            />
          </TouchableOpacity>

          {/* Video Recording Button */}
          <TouchableOpacity
            style={[styles.videoRecordButton, isCameraOpening && { opacity: 0.5 }]}
            onPress={() => {
              onCameraPress({ cameraType: 'video' })
            }}
            disabled={isCameraOpening}
          >
            <FontAwesome5 name='video' color='white' size={24} />
          </TouchableOpacity>

          {/* Photo Capture Button - Main Action */}
          <TouchableOpacity
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              width: 70,
              height: 70,
              borderRadius: 35,
              backgroundColor: CONST.MAIN_COLOR,
              shadowColor: CONST.MAIN_COLOR,
              shadowOffset: {
                width: 0,
                height: 6
              },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 15,
              zIndex: 15,
              borderWidth: 3,
              borderColor: theme.BACKGROUND,
              opacity: isCameraOpening ? 0.5 : 1
            }}
            onPress={() => {
              onCameraPress({ cameraType: 'camera' })
            }}
            disabled={isCameraOpening}
          >
            <FontAwesome5 name='camera' color='white' size={28} />
          </TouchableOpacity>

          {/* Friends List Button */}
          <TouchableOpacity
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: theme.INTERACTIVE_BACKGROUND,
              position: 'relative',
              elevation: 15,
              zIndex: 15
            }}
            onPress={() => router.push('/friends')}
            disabled={!netAvailable}
          >
            <FontAwesome5
              name='user-friends'
              size={22}
              color={netAvailable ? CONST.MAIN_COLOR : theme.TEXT_DISABLED}
            />
            {unreadCount > 0 && (
              <Badge
                value={unreadCount}
                badgeStyle={styles.badgeStyle}
                textStyle={{
                  fontSize: 11,
                  fontWeight: 'bold'
                }}
                containerStyle={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  elevation: 20,
                  zIndex: 20
                }}
              />
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  )
}

export default PhotosListFooter
