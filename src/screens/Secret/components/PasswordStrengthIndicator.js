import { FontAwesome5 } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const strengthValues = [0, 25, 50, 75, 100]
const strengthColors = ['#FF6B6B', '#FF9500', '#FFD93D', '#4FC3F7', '#50E3C2']
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
      color: '#FF6B6B',
      fontSize: 12,
      marginTop: 4
    }
  })

  return (
    <View style={styles.strengthContainer}>
      <View style={styles.strengthHeader}>
        <FontAwesome5 name={strengthIcons[strength]} size={16} color={strengthColors[strength]} />
        <Text style={[styles.strengthText, { color: strengthColors[strength] }]}>
          {strengthLabels[strength]}
        </Text>
      </View>
      <View style={styles.strengthBar}>
        <View
          style={[
            styles.strengthFill,
            {
              width: `${strengthValues[strength]}%`,
              backgroundColor: strengthColors[strength]
            }
          ]}
        />
      </View>
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  )
}

export default PasswordStrengthIndicator
