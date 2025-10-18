import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2D9CDB',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 24
  },
  contentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconWrapper: {
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  titleLarge: {
    fontSize: 18
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#2D9CDB'
  },
  outlineTitle: {
    color: '#2D9CDB'
  },
  disabled: {
    opacity: 0.6
  },
  pressed: {
    opacity: 0.85
  }
})

const flatten = (stylesParam) => {
  if (!stylesParam) return []
  return Array.isArray(stylesParam) ? stylesParam : [stylesParam]
}

const Button = ({
  title,
  children,
  onPress,
  buttonStyle,
  titleStyle,
  containerStyle,
  icon,
  disabled = false,
  loading = false,
  loadingProps,
  accessibilityLabel,
  type = 'solid',
  size = 'md'
}) => {
  const renderContent = () => {
    if (loading) {
      const indicatorColor =
        (titleStyle && StyleSheet.flatten(titleStyle)?.color) ||
        (type === 'outline' ? '#333' : '#FFFFFF')

      return <ActivityIndicator color={indicatorColor} size='small' {...loadingProps} />
    }

    const content = children ?? (
      <Text
        style={[
          styles.title,
          type === 'outline' && styles.outlineTitle,
          size === 'lg' && styles.titleLarge,
          titleStyle
        ]}
      >
        {title}
      </Text>
    )

    if (!icon && !children) {
      return content
    }

    return (
      <View style={styles.contentWrapper}>
        {icon ? <View style={styles.iconWrapper}>{icon}</View> : null}
        {content}
      </View>
    )
  }

  return (
    <View style={flatten(containerStyle)}>
      <Pressable
        accessibilityRole='button'
        accessibilityLabel={accessibilityLabel || title}
        disabled={disabled || loading}
        onPress={disabled || loading ? undefined : onPress}
        style={({ pressed }) => [
          styles.button,
          type === 'outline' && styles.outline,
          size === 'lg' && styles.large,
          ...flatten(buttonStyle),
          disabled && styles.disabled,
          pressed && !disabled && !loading && styles.pressed
        ]}
      >
        {renderContent()}
      </Pressable>
    </View>
  )
}

export default Button
