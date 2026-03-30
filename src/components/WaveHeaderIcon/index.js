import React, { useEffect } from 'react'
import { TouchableOpacity, View, StyleSheet } from 'react-native'
import { useAtom } from 'jotai'
import { FontAwesome5 } from '@expo/vector-icons'
import { router } from 'expo-router'

import * as CONST from '../../consts'
import * as STATE from '../../state'
import { getTheme } from '../../theme/sharedStyles'
import { getWavesCount, getUngroupedPhotosCount } from '../../screens/Waves/reducer'

const WaveHeaderIcon = () => {
  const [isDarkMode] = useAtom(STATE.isDarkMode)
  const [wavesCount, setWavesCount] = useAtom(STATE.wavesCount)
  const [ungroupedPhotosCount, setUngroupedPhotosCount] = useAtom(STATE.ungroupedPhotosCount)
  const [uuid] = useAtom(STATE.uuid)
  const theme = getTheme(isDarkMode)

  useEffect(() => {
    if (wavesCount !== null || !uuid) return
    let cancelled = false
    Promise.all([
      getWavesCount({ uuid }),
      getUngroupedPhotosCount({ uuid })
    ]).then(([wc, uc]) => {
      if (cancelled) return
      setWavesCount(wc)
      setUngroupedPhotosCount(uc)
    }).catch(err => console.error('WaveHeaderIcon fetch:', err))
    return () => { cancelled = true }
  }, [wavesCount, uuid])

  const hasActivity = (wavesCount !== null && wavesCount > 0) || (ungroupedPhotosCount !== null && ungroupedPhotosCount > 0)
  const iconColor = hasActivity ? CONST.MAIN_COLOR : theme.TEXT_SECONDARY
  const showBadge = ungroupedPhotosCount !== null && ungroupedPhotosCount > 0

  const handlePress = () => {
    router.navigate('/waves')
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.container}
      activeOpacity={0.7}
    >
      <FontAwesome5 name='water' size={22} color={iconColor} />
      {showBadge && (
        <View style={[styles.badge, { borderColor: theme.HEADER_BACKGROUND }]} />
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
    borderWidth: 2
  }
})

export default WaveHeaderIcon
