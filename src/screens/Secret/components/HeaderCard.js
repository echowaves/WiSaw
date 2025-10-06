import { FontAwesome5 } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import * as CONST from '../../../consts'

const HeaderCard = ({ nickNameEntered, theme }) => {
  const styles = StyleSheet.create({
    headerCard: {
      backgroundColor: theme.CARD_BACKGROUND,
      borderRadius: 16,
      padding: 24,
      marginBottom: 24,
      shadowColor: theme.CARD_SHADOW,
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 1,
      borderColor: theme.BORDER_LIGHT
    },
    iconContainer: {
      alignSelf: 'center',
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(234, 94, 61, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.TEXT_PRIMARY,
      textAlign: 'center',
      marginBottom: 8
    },
    subtitle: {
      fontSize: 16,
      color: theme.TEXT_SECONDARY,
      textAlign: 'center',
      lineHeight: 22
    }
  })

  return (
    <View style={styles.headerCard}>
      <View style={styles.iconContainer}>
        <FontAwesome5 name="user-shield" size={32} color={CONST.MAIN_COLOR} />
      </View>
      <Text style={styles.title}>
        {nickNameEntered ? 'Update Your Identity' : 'Create Your Identity'}
      </Text>
      <Text style={styles.subtitle}>
        {nickNameEntered
          ? 'Change your secret to update your incognito identity across devices.'
          : 'Create a secure incognito identity that you can restore on any device.'}
      </Text>
    </View>
  )
}

export default HeaderCard
