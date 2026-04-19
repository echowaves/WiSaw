import React, { useState } from 'react'
import { Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAtom } from 'jotai'
import { FontAwesome5 } from '@expo/vector-icons'
import { router } from 'expo-router'

import * as CONST from '../../consts'
import * as STATE from '../../state'
import { getTheme } from '../../theme/sharedStyles'

const HEADER_HEIGHT = 60

const IdentityHeaderIcon = () => {
  const [nickName] = useAtom(STATE.nickName)
  const [isDarkMode] = useAtom(STATE.isDarkMode)
  const theme = getTheme(isDarkMode)
  const [isOpen, setIsOpen] = useState(false)
  const insets = useSafeAreaInsets()

  const hasIdentity = nickName !== ''

  if (hasIdentity) {
    return null
  }

  const handleIconPress = () => {
    setIsOpen(!isOpen)
  }

  const handleRowPress = () => {
    setIsOpen(false)
    router.navigate('/(drawer)/identity')
  }

  const handleBackdropPress = () => {
    setIsOpen(false)
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleIconPress}
        style={styles.iconButton}
        activeOpacity={0.7}
      >
        <FontAwesome5
          name='user-secret'
          size={22}
          color={hasIdentity ? CONST.MAIN_COLOR : theme.TEXT_SECONDARY}
        />
        {!hasIdentity && (
          <View style={[styles.badge, { borderColor: theme.HEADER_BACKGROUND }]} />
        )}
      </TouchableOpacity>

      <Modal visible={isOpen} transparent animationType='fade' onRequestClose={handleBackdropPress}>
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <View style={styles.backdrop}>
            <View style={[styles.popover, {
              top: insets.top + HEADER_HEIGHT,
              backgroundColor: theme.CARD_BACKGROUND,
              borderColor: theme.BORDER_LIGHT,
              shadowColor: theme.CARD_SHADOW
            }]}>
              <TouchableOpacity
                style={styles.popoverRow}
                onPress={handleRowPress}
                activeOpacity={0.7}
              >
                <FontAwesome5
                  name={hasIdentity ? 'user-secret' : 'user-plus'}
                  size={16}
                  color={hasIdentity ? CONST.MAIN_COLOR : theme.TEXT_SECONDARY}
                  style={styles.popoverIcon}
                />
                <Text
                  style={[styles.popoverLabel, { color: theme.TEXT_PRIMARY }]}
                >
                  {hasIdentity ? nickName : 'Set Up Identity'}
                </Text>
                <FontAwesome5 name='chevron-right' size={12} color={theme.TEXT_SECONDARY} />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
    borderWidth: 2
  },
  backdrop: {
    flex: 1
  },
  popover: {
    position: 'absolute',
    left: 16,
    minWidth: 220,
    borderRadius: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden'
  },
  popoverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16
  },
  popoverIcon: {
    width: 24,
    textAlign: 'center'
  },
  popoverLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 10,
    marginRight: 8
  }
})

export default IdentityHeaderIcon
