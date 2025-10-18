import { FontAwesome5 } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const WarningCard = ({ theme }) => {
  const styles = StyleSheet.create({
    warningCard: {
      backgroundColor: 'rgba(255, 107, 107, 0.1)',
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: 'rgba(255, 107, 107, 0.2)',
      marginBottom: 20
    },
    warningTitle: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8
    },
    warningTitleText: {
      color: '#FF6B6B',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8
    },
    warningText: {
      fontSize: 14,
      color: theme.TEXT_SECONDARY,
      lineHeight: 20
    }
  })

  return (
    <View style={styles.warningCard}>
      <View style={styles.warningTitle}>
        <FontAwesome5 name='exclamation-triangle' size={16} color='#FF6B6B' />
        <Text style={styles.warningTitleText}>Important Security Notice</Text>
      </View>
      <Text style={styles.warningText}>
        • Use a strong, unique secret you'll remember{'\n'}• Write it down and store it
        securely{'\n'}• We cannot recover lost secrets - no email or phone required{'\n'}• Your
        identity is completely anonymous and secure
      </Text>
    </View>
  )
}

export default WarningCard
