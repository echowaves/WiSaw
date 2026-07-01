import React, { useCallback } from 'react'
import { View, Text, TouchableOpacity, Pressable, StyleSheet } from 'react-native'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'

import WavePhotoStrip from '../WavePhotoStrip'
import { fetchWavePhotos } from '../../screens/WaveDetail/reducer'
import { normalizeWaveName } from '../../utils/normalizeWaveName'
import { WAVE_ROLES } from '../../consts'

const WaveCard = ({ wave, onPress, onLongPress, theme, selectMode, selected, onToggleSelection }) => {
  const photoCount = wave.photosCount ?? 0
  const photos = wave.photos || []
  const roleConfig = WAVE_ROLES[wave.myRole] || WAVE_ROLES.contributor
  const isOwner = wave.myRole === 'owner'

  const fetchFn = useCallback(async (pageNumber, batch) => {
    return fetchWavePhotos({ waveUuid: wave.waveUuid, pageNumber, batch })
  }, [wave.waveUuid])

  // In selection mode, tapping the card does nothing - only checkbox toggles selection
  // In browse mode, tap navigates to wave detail
  const handlePress = () => {
    if (!selectMode) {
      onPress(wave)
    }
  }

  // In selection mode, disable long-press context menu
  const handleLongPress = () => {
    if (!selectMode) {
      onLongPress(wave)
    }
  }

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.CARD_BACKGROUND },
        selected && styles.selectedCard
      ]}
    >
      <WavePhotoStrip
        initialPhotos={photos}
        fetchFn={fetchFn}
        theme={theme}
        onPhotoPress={handlePress}
        onPhotoLongPress={handleLongPress}
      />
      <Pressable
        onPress={handlePress}
        onLongPress={handleLongPress}
        style={styles.infoContainer}
      >
        <View style={styles.infoRow}>
          {selectMode && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation()
                if (isOwner && onToggleSelection) {
                  onToggleSelection(wave.waveUuid)
                }
              }}
              style={styles.selectionIndicator}
            >
              {selected ? <Ionicons name='checkmark' size={16} color='#007AFF' /> : <Ionicons name='square-outline' size={18} color='#007AFF' />}
            </TouchableOpacity>
          )}
          <View style={styles.infoTextContainer}>
            <View style={styles.nameRow}>
              <Text style={[styles.waveName, { color: theme.TEXT_PRIMARY }]} numberOfLines={1} ellipsizeMode='tail'>
                {normalizeWaveName(wave.name)}
              </Text>
              {wave.isFrozen && (
                <MaterialCommunityIcons name='snowflake' size={14} color='#3B82F6' style={styles.frozenIcon} />
              )}
            </View>
            <View style={styles.metaRow}>
              <Text style={[styles.photoCount, { color: theme.TEXT_SECONDARY }]}>
                {photoCount} {photoCount === 1 ? 'photo' : 'photos'}
              </Text>
              {wave.myRole && (
                <View style={[styles.roleBadge, { backgroundColor: `${roleConfig.color}15` }]}>
                  <Text style={[styles.roleBadgeText, { color: roleConfig.color }]}>
                    {roleConfig.label}
                  </Text>
                </View>
              )}
              {wave.splashDate && new Date(wave.splashDate) > new Date() && (
                <View style={[styles.roleBadge, { backgroundColor: '#FEF3C7' }]}>
                  <Text style={[styles.roleBadgeText, { color: '#D97706' }]}>Pending</Text>
                </View>
              )}
            </View>
          </View>
          {!selectMode && (
            <TouchableOpacity
              onPress={(e) => { e.stopPropagation(); onLongPress(wave) }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.menuButton}
            >
              <Ionicons name='ellipsis-vertical' size={18} color={theme.TEXT_SECONDARY} />
            </TouchableOpacity>
          )}
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
    fontWeight: '600',
    flex: 1
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  frozenIcon: {
    marginLeft: 4
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2
  },
  photoCount: {
    fontSize: 12
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '600'
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#007AFF'
  },
  cardRelative: {
    position: 'relative'
  },
  selectionIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center'
  },
  selectionOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10
  },
  checkBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center'
  }
})

export default WaveCard
