import { FontAwesome5 } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import * as CONST from '../../../consts'

const ActionRow = ({ icon, label, onPress, destructive, theme }) => {
  const accentColor = destructive ? '#FF9500' : CONST.MAIN_COLOR

  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.CARD_BACKGROUND,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: destructive ? 'rgba(255, 149, 0, 0.2)' : theme.BORDER_LIGHT
    },
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: destructive ? 'rgba(255, 149, 0, 0.1)' : 'rgba(234, 94, 61, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12
    },
    label: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
      color: destructive ? '#FF9500' : theme.TEXT_PRIMARY
    },
    chevron: {
      marginLeft: 8
    }
  })

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <FontAwesome5 name={icon} size={16} color={accentColor} />
      </View>
      <Text style={styles.label}>{label}</Text>
      <FontAwesome5 name='chevron-right' size={14} color={theme.TEXT_SECONDARY} style={styles.chevron} />
    </TouchableOpacity>
  )
}

export default ActionRow
