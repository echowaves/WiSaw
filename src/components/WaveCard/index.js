import React, { useCallback } from 'react'
import { View, Text, TouchableOpacity, Pressable, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import WavePhotoStrip from '../WavePhotoStrip'
import { fetchWavePhotos } from '../../screens/WaveDetail/reducer'

const WaveCard = ({ wave, onPress, onLongPress, theme }) => {
  const photoCount = wave.photosCount ?? 0
  const photos = wave.photos || []

  const fetchFn = useCallback(async (pageNumber, batch) => {
    return fetchWavePhotos({ waveUuid: wave.waveUuid, pageNumber, batch })
  }, [wave.waveUuid])

  return (
    <View
      style={[styles.card, { backgroundColor: theme.CARD_BACKGROUND }]}
    >
      <WavePhotoStrip
        initialPhotos={photos}
        fetchFn={fetchFn}
        theme={theme}
        onPhotoLongPress={() => onLongPress(wave)}
      />
      <Pressable
        onPress={() => onPress(wave)}
        onLongPress={() => onLongPress(wave)}
        style={styles.infoContainer}
      >
        <View style={styles.infoRow}>
          <View style={styles.infoTextContainer}>
            <Text style={[styles.waveName, { color: theme.TEXT_PRIMARY }]} numberOfLines={1} ellipsizeMode='tail'>
              {wave.name}
            </Text>
            <Text style={[styles.photoCount, { color: theme.TEXT_SECONDARY }]}>
              {photoCount} {photoCount === 1 ? 'photo' : 'photos'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={(e) => { e.stopPropagation(); onLongPress(wave) }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.menuButton}
          >
            <Ionicons name='ellipsis-vertical' size={18} color={theme.TEXT_SECONDARY} />
          </TouchableOpacity>
        </View>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 8,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4
  },
  infoContainer: {
    padding: 10
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  infoTextContainer: {
    flex: 1
  },
  menuButton: {
    padding: 4
  },
  waveName: {
    fontSize: 14,
    fontWeight: '600'
  },
  photoCount: {
    fontSize: 12,
    marginTop: 2
  }
})

export default WaveCard
