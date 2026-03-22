import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as SecureStore from 'expo-secure-store'

export default function InteractionHintBanner ({ hasContent }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const check = async () => {
      try {
        const shown = await SecureStore.getItemAsync('interactionHintShown')
        if (!shown) setVisible(true)
      } catch { /* noop */ }
    }
    check()
  }, [])

  const dismiss = useCallback(async () => {
    setVisible(false)
    try {
      await SecureStore.setItemAsync('interactionHintShown', 'true')
    } catch { /* noop */ }
  }, [])

  if (!visible || !hasContent) return null

  return (
    <View style={styles.banner}>
      <View style={styles.content}>
        <Ionicons name='bulb-outline' size={16} color='#FFD700' style={{ marginRight: 8 }} />
        <Text style={styles.text}>Tap and hold for options or tap ⋮</Text>
      </View>
      <TouchableOpacity onPress={dismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name='close' size={18} color='rgba(255,255,255,0.8)' />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.6)',
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  text: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '500'
  }
})
