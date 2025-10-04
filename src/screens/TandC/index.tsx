import { Ionicons } from '@expo/vector-icons'
import { useAtom } from 'jotai'
import { useMemo } from 'react'
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context'

import * as STATE from '../../state'
import { getTheme } from '../../theme/sharedStyles'

export const TANDC_DESCRIPTION =
  'WiSaw is a shared space for real-time moments. Help keep it safe, welcoming, and authentic for everyone nearby.'

export const TANDC_AGREEMENT =
  "By continuing you agree to WiSaw's Terms & Conditions and will help moderate the community."

export const TANDC_POINTS = [
  'Photos you capture are saved to your album and shared to the global WiSaw feed.',
  'People nearby can discover your photos in real time.',
  "You can explore what others are sharing around you as soon as it's posted.",
  'Abusive or inappropriate photos can be removed immediately and disappear for everyone.',
  'The community does not tolerate objectionable content or abusive behavior.',
  'Repeat offenders will be removed from WiSaw by the community.',
]

const FOOTER_NOTE = 'You can revisit these guidelines anytime from Settings.'

export type TandCModalProps = {
  onAccept: () => void
  primaryActionLabel?: string
}

export default function TandCModal({
  onAccept,
  primaryActionLabel = 'I Agree',
}: TandCModalProps) {
  const [isDarkMode] = useAtom(STATE.isDarkMode)
  const insets = useSafeAreaInsets()
  const theme = useMemo(() => getTheme(isDarkMode), [isDarkMode])
  const styles = useMemo(() => createStyles(theme, insets), [theme, insets])

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.heroSection}>
            <Ionicons
              name="shield-checkmark"
              size={48}
              color={theme.INTERACTIVE_PRIMARY}
              style={styles.heroIcon}
            />
            <Text style={styles.title}>WiSaw Community Guidelines</Text>
            <Text style={styles.subtitle}>{TANDC_DESCRIPTION}</Text>
          </View>

          <View style={styles.pointsList}>
            {TANDC_POINTS.map((point, index) => (
              <View
                key={point}
                style={[
                  styles.pointRow,
                  index !== TANDC_POINTS.length - 1 && styles.pointRowSpacing,
                ]}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={theme.INTERACTIVE_PRIMARY}
                  style={styles.pointIcon}
                />
                <Text style={styles.pointText}>{point}</Text>
              </View>
            ))}
          </View>

          <View style={styles.actionsSection}>
            <Text style={styles.agreementText}>{TANDC_AGREEMENT}</Text>
            <View style={styles.primaryButtonContainer}>
              <Pressable
                accessibilityRole="button"
                onPress={onAccept}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.primaryButtonPressed,
                ]}
              >
                <Text style={styles.primaryButtonTitle}>
                  {primaryActionLabel}
                </Text>
              </Pressable>
            </View>
            <Text style={styles.footerNote}>{FOOTER_NOTE}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

type ThemeShape = ReturnType<typeof getTheme>

const createStyles = (theme: ThemeShape, insets: EdgeInsets) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.HEADER_BACKGROUND,
    },
    scrollContainer: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingVertical: Math.max(32, insets.top),
      paddingBottom: Math.max(40, insets.bottom + 24),
      justifyContent: 'center',
      backgroundColor: theme.HEADER_BACKGROUND,
    },
    card: {
      backgroundColor: theme.CARD_BACKGROUND,
      borderRadius: 28,
      paddingHorizontal: 24,
      paddingVertical: 32,
      borderWidth: 1,
      borderColor: theme.CARD_BORDER,
      shadowColor: theme.CARD_SHADOW,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
      elevation: 12,
    },
    heroSection: {
      alignItems: 'center',
      marginBottom: 28,
    },
    heroIcon: {
      marginBottom: 4,
    },
    title: {
      color: theme.TEXT_PRIMARY,
      fontSize: 22,
      fontWeight: '700',
      textAlign: 'center',
    },
    subtitle: {
      color: theme.TEXT_SECONDARY,
      fontSize: 16,
      lineHeight: 24,
      textAlign: 'center',
      marginTop: 12,
    },
    pointsList: {
      marginBottom: 28,
    },
    pointRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    pointRowSpacing: {
      marginBottom: 16,
    },
    pointIcon: {
      marginRight: 12,
      marginTop: 2,
    },
    pointText: {
      flex: 1,
      color: theme.TEXT_PRIMARY,
      fontSize: 16,
      lineHeight: 24,
    },
    actionsSection: {
      alignItems: 'center',
    },
    agreementText: {
      color: theme.TEXT_PRIMARY,
      fontSize: 15,
      lineHeight: 22,
      textAlign: 'center',
      fontWeight: '600',
      marginBottom: 18,
    },
    primaryButtonContainer: {
      alignSelf: 'stretch',
    },
    primaryButton: {
      borderRadius: 14,
      backgroundColor: theme.INTERACTIVE_PRIMARY,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryButtonPressed: {
      opacity: 0.85,
    },
    primaryButtonTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    footerNote: {
      color: theme.TEXT_SECONDARY,
      fontSize: 14,
      lineHeight: 20,
      textAlign: 'center',
      marginTop: 16,
    },
  })
