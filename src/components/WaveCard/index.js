import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native'
import { FontAwesome5, Ionicons } from '@expo/vector-icons'
import CachedImage from 'expo-cached-image'

import * as CONST from '../../consts'

const isValidImageUri = (uri) => {
  return uri && typeof uri === 'string' && (uri.startsWith('http://') || uri.startsWith('https://'))
}

const WaveCard = ({ wave, onPress, onLongPress, theme }) => {
  const photoCount = wave.photosCount ?? 0
  const photos = wave.photos || []

  const renderCollage = () => {
    if (photos.length === 0) {
      return (
        <View style={[styles.placeholder, { backgroundColor: theme.INTERACTIVE_BACKGROUND }]}>
          <FontAwesome5 name='water' size={32} color={theme.TEXT_SECONDARY} />
        </View>
      )
    }

    return (
      <View style={styles.collageContainer}>
        {[0, 1, 2, 3].map((index) => {
          const photoUrl = photos[index]
          if (isValidImageUri(photoUrl)) {
            return (
              <CachedImage
                key={`${wave.waveUuid}-${index}`}
                source={{ uri: photoUrl }}
                cacheKey={`wave-thumb-${wave.waveUuid}-${index}`}
                style={styles.collageImage}
                resizeMode='cover'
              />
            )
          }
          return (
            <View
              key={`empty-${index}`}
              style={[styles.collageImage, { backgroundColor: theme.INTERACTIVE_BACKGROUND }]}
            />
          )
        })}
      </View>
    )
  }

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.CARD_BACKGROUND }]}
      onPress={() => onPress(wave)}
      onLongPress={() => onLongPress(wave)}
      activeOpacity={0.8}
    >
      {renderCollage()}
      <View style={styles.infoContainer}>
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
      </View>
    </TouchableOpacity>
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
  collageContainer: {
    width: '100%',
    aspectRatio: 5,
    flexDirection: 'row'
  },
  collageImage: {
    flex: 1,
    height: '100%'
  },
  placeholder: {
    width: '100%',
    aspectRatio: 5,
    alignItems: 'center',
    justifyContent: 'center'
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
