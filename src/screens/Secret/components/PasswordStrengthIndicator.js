import FontAwesome5 from '@react-native-vector-icons/fontawesome5'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { fa5IconStyle } from '../../../utils/fa5IconStyle'

const strengthValues = [0, 25, 50, 75, 100]
// Token names rather than literals: the same red→teal severity ramp has to stay
// readable in both modes, and the fixed pastels fall below 3:1 on light surfaces.
const strengthColorTokens = ['STATUS_ERROR', 'STATUS_CAUTION', 'STATUS_WARNING', 'TEXT_LINK', 'ACCENT_SECONDARY']
const strengthLabels = [
  'Too weak - easily guessed',
  'Weak - needs improvement',
  'Fair - getting better',
  'Good - almost there',
  'Excellent - very secure'
]
const strengthIcons = [
  'exclamation-triangle',
  'exclamation-circle',
  'shield-alt',
  'shield-alt',
  'user-shield'
]

const PasswordStrengthIndicator = ({ strength, theme, errorMessage }) => {
  const strengthColor = theme[strengthColorTokens[strength]] ?? theme.TEXT_PRIMARY
  const styles = StyleSheet.create({
    strengthContainer: {
      marginTop: 8,
      marginBottom: 16
    },
    strengthHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8
    },
    strengthText: {
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 8
    },
    strengthBar: {
      height: 8,
      backgroundColor: theme.BACKGROUND_DISABLED,
      borderRadius: 4,
      overflow: 'hidden'
    },
    strengthFill: {
      height: '100%',
      borderRadius: 4
    },
    errorText: {
      color: theme.STATUS_ERROR,
      fontSize: 12,
      marginTop: 4
    }
  })

  return (
    <View style={styles.strengthContainer}>
      <View style={styles.strengthHeader}>
        <FontAwesome5 name={strengthIcons[strength]} iconStyle={fa5IconStyle(strengthIcons[strength])} size={16} color={strengthColor} />
        <Text style={[styles.strengthText, { color: strengthColor }]}>
          {strengthLabels[strength]}
        </Text>
      </View>
      <View style={styles.strengthBar}>
        <View
          style={[
            styles.strengthFill,
            {
              width: `${strengthValues[strength]}%`,
              backgroundColor: strengthColor
            }
          ]}
        />
      </View>
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  )
}

export default PasswordStrengthIndicator
