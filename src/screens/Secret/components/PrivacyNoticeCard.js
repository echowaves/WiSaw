import { FontAwesome5 } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const PrivacyNoticeCard = ({ theme }) => {
  const styles = StyleSheet.create({
    card: {
      backgroundColor: 'rgba(80, 227, 194, 0.08)',
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: 'rgba(80, 227, 194, 0.2)',
      marginBottom: 20
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8
    },
    title: {
      color: '#50E3C2',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8
    },
    text: {
      fontSize: 14,
      color: theme.TEXT_SECONDARY,
      lineHeight: 20
    }
  })

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <FontAwesome5 name='lock' size={16} color='#50E3C2' />
        <Text style={styles.title}>Your Privacy is Protected</Text>
      </View>
      <Text style={styles.text}>
        {'• No personal information is stored on our servers\n• Your secret is the only key to your identity\n• Use a strong, unique secret you\'ll remember\n• Lost secrets cannot be recovered — this is how we protect your privacy'}
      </Text>
    </View>
  )
}

export default PrivacyNoticeCard
