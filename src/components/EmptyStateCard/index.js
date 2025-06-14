import { FontAwesome, MaterialIcons } from '@expo/vector-icons'
import { Button } from '@rneui/themed'
import { StyleSheet, Text, View } from 'react-native'
import * as CONST from '../../consts'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: CONST.HEADER_SHADOW_COLOR,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: CONST.HEADER_BORDER_COLOR,
    maxWidth: 320,
    width: '100%',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(234, 94, 61, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    opacity: 0.8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: CONST.TEXT_COLOR,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 16,
    color: CONST.INACTIVE_SEGMENT_COLOR,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  actionButtonContainer: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  actionButton: {
    backgroundColor: CONST.MAIN_COLOR,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: CONST.MAIN_COLOR,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
})

const EmptyStateCard = ({
  icon,
  iconType = 'FontAwesome',
  title,
  subtitle,
  actionText,
  onActionPress,
  iconColor = CONST.MAIN_COLOR,
}) => {
  const IconComponent =
    iconType === 'MaterialIcons' ? MaterialIcons : FontAwesome

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <IconComponent
            name={icon}
            size={64}
            color={iconColor}
            style={styles.icon}
          />
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
