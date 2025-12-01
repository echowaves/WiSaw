import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useAtom } from 'jotai'
import { FontAwesome } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import * as STATE from '../../state'
import * as CONST from '../../consts'
import { saveActiveWave } from '../../utils/waveStorage'

const ActiveWaveIndicator = () => {
  const [activeWave, setActiveWave] = useAtom(STATE.activeWave)
  const insets = useSafeAreaInsets()

  if (!activeWave) return null

  const handleClearWave = () => {
    setActiveWave(null)
    saveActiveWave(null)
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <Text style={styles.text}>
          Active Wave: {activeWave.name}
        </Text>
        <TouchableOpacity onPress={handleClearWave}>
          <FontAwesome name='times-circle' size={20} color='#FFF' />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: CONST.MAIN_COLOR,
    width: '100%'
  },
  content: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  text: {
    color: '#FFF',
    fontWeight: 'bold'
  }
})

export default ActiveWaveIndicator
