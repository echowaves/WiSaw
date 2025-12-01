import { FontAwesome, FontAwesome5, MaterialIcons } from '@expo/vector-icons'
import { useAtom } from 'jotai'
import { StyleSheet, Text, View } from 'react-native'
import { isDarkMode } from '../../state'
import { getTheme } from '../../theme/sharedStyles'
import Button from '../ui/Button'

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
      paddingVertical: 60
    },
    card: {
      backgroundColor: theme.CARD_BACKGROUND,
      borderRadius: 24,
      padding: 32,
      alignItems: 'center',
      shadowColor: theme.CARD_SHADOW,
      shadowOffset: {
        width: 0,
        height: 4
      },
      shadowOpacity: 1,
      shadowRadius: 12,
      elevation: 8,
      borderWidth: 1,
      borderColor: theme.BORDER_LIGHT,
      maxWidth: 320,
      width: '100%'
    },
    iconContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: 'rgba(234, 94, 61, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24
    },
    icon: {
      opacity: 0.8
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.TEXT_PRIMARY,
      textAlign: 'center',
      marginBottom: 12,
      lineHeight: 28
    },
    subtitle: {
      fontSize: 16,
      color: theme.TEXT_SECONDARY,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 32
    },
    actionButtonContainer: {
      borderRadius: 20,
      overflow: 'hidden'
    },
    actionButton: {
      backgroundColor: theme.INTERACTIVE_PRIMARY,
      paddingHorizontal: 32,
      paddingVertical: 12,
      borderRadius: 20,
      shadowColor: theme.INTERACTIVE_PRIMARY,
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4
    },
    actionButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: 'white'
    }
  })

const EmptyStateCard = ({
  icon,
  iconType = 'FontAwesome',
  title,
  subtitle,
  actionText,
  onActionPress,
  iconColor
}) => {
  const [isDark] = useAtom(isDarkMode)
  const theme = getTheme(isDark)
  const styles = createStyles(theme)

  let IconComponent = FontAwesome
  if (iconType === 'MaterialIcons') {
    IconComponent = MaterialIcons
  } else if (iconType === 'FontAwesome5') {
    IconComponent = FontAwesome5
  }

  // Use theme color as default if no iconColor is provided
  const finalIconColor = iconColor || theme.TEXT_PRIMARY

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <IconComponent name={icon} size={64} color={finalIconColor} style={styles.icon} />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        {actionText && onActionPress && (
          <Button
            title={actionText}
            onPress={onActionPress}
            buttonStyle={styles.actionButton}
            titleStyle={styles.actionButtonText}
            containerStyle={styles.actionButtonContainer}
          />
        )}
      </View>
    </View>
  )
}

export default EmptyStateCard
