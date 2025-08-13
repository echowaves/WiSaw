import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { SHARED_STYLES } from '../../theme/sharedStyles'

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
  const insets = useSafeAreaInsets()

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
                style={SHARED_STYLES.interactive.headerButton}
                accessibilityLabel="Go back"
              >
                <Ionicons
                  name="chevron-back"
                  size={24}
                  color={SHARED_STYLES.theme.TEXT_PRIMARY}
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

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: SHARED_STYLES.theme.HEADER_BACKGROUND,
  },
  container: {
    backgroundColor: SHARED_STYLES.theme.HEADER_BACKGROUND,
    borderBottomWidth: 1,
    borderBottomColor: SHARED_STYLES.theme.HEADER_BORDER,
    shadowColor: SHARED_STYLES.theme.HEADER_SHADOW,
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
    height: 56, // Set a fixed height
  },
  leftArea: { flex: 1, flexDirection: 'row' },
  titleArea: { flex: 3, alignItems: 'center', justifyContent: 'center' },
  rightArea: { flex: 1, alignItems: 'flex-end', flexDirection: 'row' },
  titleText: {
    fontSize: 16,
    fontWeight: '600',
    color: SHARED_STYLES.theme.TEXT_PRIMARY,
  },
})
