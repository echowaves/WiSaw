import React, { useEffect } from 'react'
import { TouchableOpacity, StyleSheet } from 'react-native'
import { useAtom } from 'jotai'
import { FontAwesome5 } from '@expo/vector-icons'
import { router } from 'expo-router'

import * as STATE from '../../state'
import { getTheme } from '../../theme/sharedStyles'
import { getWavesCount, getBookmarksCount } from '../../screens/Waves/reducer'
import { subscribeToAutoGroupDone } from '../../events/autoGroupBus'

const WaveHeaderIcon = () => {
  const [isDarkMode] = useAtom(STATE.isDarkMode)
  const [wavesCount, setWavesCount] = useAtom(STATE.wavesCount)
  const [, setBookmarksCount] = useAtom(STATE.bookmarksCount)
  const [uuid] = useAtom(STATE.uuid)
  const theme = getTheme(isDarkMode)

  useEffect(() => {
    if (wavesCount !== null || !uuid) return
    let cancelled = false
    Promise.all([
      getWavesCount({ uuid }),
      getBookmarksCount({ uuid })
    ]).then(([wc, bc]) => {
      if (cancelled) return
      setWavesCount(wc)
      setBookmarksCount(bc)
    }).catch(err => console.error('WaveHeaderIcon fetch:', err))
    return () => { cancelled = true }
  }, [wavesCount, uuid])

  // Subscribe to auto-group completion event to refresh badge
  useEffect(() => {
    const unsubscribeDone = subscribeToAutoGroupDone(() => {
      let cancelled = false
      Promise.all([
        getWavesCount({ uuid }),
        getBookmarksCount({ uuid })
      ]).then(([wc, bc]) => {
        if (cancelled) return
        setWavesCount(wc)
        setBookmarksCount(bc)
      }).catch(err => console.error('WaveHeaderIcon fetch:', err))
      return () => { cancelled = true }
    })
    return unsubscribeDone
  }, [uuid, setWavesCount, setBookmarksCount])

  const hasWaves = wavesCount !== null && wavesCount > 0
  const iconColor = hasWaves ? '#EA5E3D' : '#8E8E93'

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
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center'
  }
})

export default WaveHeaderIcon
