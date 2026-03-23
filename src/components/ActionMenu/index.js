import { useAtom } from 'jotai'
import { useCallback, useMemo } from 'react'
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

import * as CONST from '../../consts'
import * as STATE from '../../state'
import { getTheme } from '../../theme/sharedStyles'

const DESTRUCTIVE_COLOR = '#FF3B30'

const ActionMenu = ({ visible, onClose, title = null, items }) => {
  const [isDarkMode] = useAtom(STATE.isDarkMode)
  const theme = getTheme(isDarkMode)
  const styles = useMemo(() => createStyles(theme), [theme])

  const handleItemPress = useCallback((item) => {
    onClose()
    if (item.onPress) {
      item.onPress()
    }
  }, [onClose])

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} style={styles.card}>
          {title && (
            <Text style={styles.title}>{title}</Text>
          )}
          {items.map((item, index) => {
            if (item === 'separator') {
              return <View key={`sep-${index}`} style={styles.separator} />
            }

            const color = item.destructive
              ? DESTRUCTIVE_COLOR
              : theme.TEXT_PRIMARY

            return (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.row,
                  item.disabled && styles.rowDisabled
                ]}
                onPress={() => handleItemPress(item)}
                disabled={item.disabled}
                activeOpacity={0.6}
              >
                <MaterialCommunityIcons
                  name={item.icon}
                  size={22}
                  color={color}
                  style={styles.icon}
                />
                <Text style={[styles.label, { color }]}>
                  {item.label}
                </Text>
                {item.checked && (
                  <MaterialCommunityIcons
                    name='check'
                    size={20}
                    color={CONST.MAIN_COLOR}
                    style={styles.checkIcon}
                  />
                )}
              </TouchableOpacity>
            )
          })}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}

const createStyles = (theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.6)'
    },
    card: {
      backgroundColor: theme.SURFACE,
      borderRadius: 16,
      width: '85%',
      maxWidth: 360,
      paddingVertical: 8,
      overflow: 'hidden'
    },
    title: {
      fontSize: 14,
      color: theme.TEXT_SECONDARY,
      textAlign: 'center',
      paddingBottom: 8,
      paddingTop: 4
    },
    separator: {
      height: 1,
      backgroundColor: theme.INTERACTIVE_BORDER,
      marginHorizontal: 16
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16
    },
    rowDisabled: {
      opacity: 0.4
    },
    icon: {
      marginRight: 12
    },
    label: {
      fontSize: 16,
      flex: 1
    },
    checkIcon: {
      marginLeft: 8
    }
  })

export default ActionMenu
