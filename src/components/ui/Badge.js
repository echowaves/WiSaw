import { StyleSheet, Text, View } from 'react-native'

const styles = StyleSheet.create({
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600'
  }
})

const flatten = (stylesParam) => {
  if (!stylesParam) return []
  return Array.isArray(stylesParam) ? stylesParam : [stylesParam]
}

const Badge = ({ value, badgeStyle, textStyle, containerStyle, accessibilityLabel }) => {
  const displayValue = typeof value === 'number' && value > 99 ? '99+' : String(value ?? '')

  return (
    <View
      accessibilityLabel={accessibilityLabel || `Badge count ${displayValue || '0'}`}
      style={flatten(containerStyle)}
    >
      <View style={[styles.badge, ...flatten(badgeStyle)]}>
        <Text style={[styles.text, ...flatten(textStyle)]}>{displayValue}</Text>
      </View>
    </View>
  )
}

export default Badge
