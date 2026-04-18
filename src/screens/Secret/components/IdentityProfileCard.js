import { FontAwesome } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import * as CONST from '../../../consts'

const IdentityProfileCard = ({ nickName, theme }) => {
  const styles = StyleSheet.create({
    card: {
      backgroundColor: theme.CARD_BACKGROUND,
      borderRadius: 16,
      padding: 24,
      marginBottom: 24,
      shadowColor: theme.CARD_SHADOW,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 1,
      borderColor: theme.BORDER_LIGHT,
      alignItems: 'center'
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(234, 94, 61, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16
    },
    nickName: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.TEXT_PRIMARY,
      textAlign: 'center',
      marginBottom: 8
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(80, 227, 194, 0.1)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#50E3C2',
      marginRight: 8
    },
    statusText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#50E3C2'
    }
  })

  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <FontAwesome name='user-secret' size={36} color={CONST.MAIN_COLOR} />
      </View>
      <Text style={styles.nickName}>{nickName}</Text>
      <View style={styles.statusBadge}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>Attached to this device</Text>
      </View>
    </View>
  )
}

export default IdentityProfileCard
