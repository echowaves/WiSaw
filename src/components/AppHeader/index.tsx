import { Ionicons } from '@expo/vector-icons'
import { useAtom } from 'jotai'
import React from 'react'
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as STATE from '../../state'
import { getTheme } from '../../theme/sharedStyles'

type AppHeaderProps = {
  title: string | React.ReactNode
  onBack?: () => void
  rightSlot?: React.ReactNode
  safeTopOnly?: boolean
}

export default function AppHeader({
  title,
  onBack,
  rightSlot,
  safeTopOnly = false,
}: AppHeaderProps) {
  const [isDark] = useAtom(STATE.isDarkMode)
  const theme = getTheme(isDark)
  const insets = useSafeAreaInsets()

  const styles = StyleSheet.create({
    safeArea: {
      backgroundColor: theme.HEADER_BACKGROUND,
    },
    container: {
      backgroundColor: theme.HEADER_BACKGROUND,
      borderBottomWidth: 1,
      borderBottomColor: theme.HEADER_BORDER,
      shadowColor: theme.HEADER_SHADOW,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 3,
    },
    contentContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      minHeight: 56,
    },
    leftArea: {
      flex: 0,
      alignItems: 'flex-start',
      minWidth: 44,
    },
    titleArea: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rightArea: {
      flex: 0,
      alignItems: 'flex-end',
      minWidth: 44,
    },
    titleText: {
      color: theme.TEXT_PRIMARY,
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
    },
    headerButton: {
      padding: 12,
      borderRadius: 20,
      backgroundColor: theme.INTERACTIVE_BACKGROUND,
      marginHorizontal: 8,
      borderWidth: 1,
      borderColor: theme.INTERACTIVE_BORDER,
      shadowColor: theme.CARD_SHADOW,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
  })

  const Outer = safeTopOnly ? View : (SafeAreaView as any)
  const outerProps: any = safeTopOnly
    ? {
        style: [styles.safeArea, { paddingTop: insets.top }],
      }
    : {
        style: styles.safeArea,
      }

  return (
    <Outer {...outerProps}>
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <View style={styles.leftArea}>
            {onBack ? (
              <TouchableOpacity
                onPress={onBack}
                style={styles.headerButton}
                accessibilityLabel="Go back"
              >
                <Ionicons
                  name="chevron-back"
                  size={24}
                  color={theme.TEXT_PRIMARY}
                />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 44 }} />
            )}
          </View>

          <View style={styles.titleArea}>
            {typeof title === 'string' ? (
              <Text style={styles.titleText}>{title}</Text>
            ) : (
              title
            )}
          </View>

          <View style={styles.rightArea}>
            {rightSlot ? rightSlot : <View style={{ width: 44 }} />}
          </View>
        </View>
      </View>
    </Outer>
  )
}
