import { FontAwesome } from '@expo/vector-icons'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import * as CONST from '../../consts'

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 4
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: CONST.HEADER_BORDER_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: CONST.HEADER_SHADOW_COLOR,
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2
  }
})

const ModernHeaderButton = ({
  onPress,
  iconName,
  iconSize = 20,
  iconColor = CONST.MAIN_COLOR,
  style = {},
  containerStyle = {}
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.container, containerStyle]}
    activeOpacity={0.7}
  >
    <View style={[styles.button, style]}>
      <FontAwesome name={iconName} size={iconSize} color={iconColor} />
    </View>
  </TouchableOpacity>
)

export default ModernHeaderButton
