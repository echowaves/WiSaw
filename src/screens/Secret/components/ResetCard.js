import { MaterialCommunityIcons } from '@expo/vector-icons'
import React from 'react'
import { Alert, StyleSheet, Text, View } from 'react-native'
import Button from '../../../components/ui/Button'

const ResetCard = ({ theme, onReset }) => {
  const styles = StyleSheet.create({
    resetCard: {
      backgroundColor: 'rgba(255, 149, 0, 0.1)',
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: 'rgba(255, 149, 0, 0.2)'
    },
    resetTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FF9500',
      marginBottom: 12
    },
    resetText: {
      fontSize: 14,
      color: theme.TEXT_PRIMARY,
      lineHeight: 20,
      marginBottom: 16
    },
    resetButton: {
      backgroundColor: 'transparent',
      borderColor: '#FF9500',
      borderWidth: 2,
      borderRadius: 12,
      paddingVertical: 12
    },
    resetButtonText: {
      color: '#FF9500',
      fontSize: 16,
      fontWeight: '600'
    }
  })

  const handleResetPress = () => {
    Alert.alert(
      'Reset Your Identity?',
      'This will create a new identity or allow you to restore from another device. Your current identity will be disconnected from this phone.\n\nMake sure you have your current secret saved if you want to restore it later.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: onReset
        }
      ],
      { cancelable: true }
    )
  }

  return (
    <View style={styles.resetCard}>
      <Text style={styles.resetTitle}>⚠️ Reset Identity</Text>
      <Text style={styles.resetText}>
        This will disconnect your current identity from this device. Make sure to save your current
        secret before proceeding if you want to restore it later.
      </Text>
      <Button
        type="outline"
        buttonStyle={styles.resetButton}
        titleStyle={styles.resetButtonText}
        icon={
          <MaterialCommunityIcons
            name="refresh"
            size={20}
            color="#FF9500"
            style={{ marginRight: 8 }}
          />
        }
        title="Reset Identity"
        onPress={handleResetPress}
      />
    </View>
  )
}

export default ResetCard
