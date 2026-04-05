import React, { useCallback } from 'react'
import { View, Text, TouchableOpacity, Pressable, StyleSheet } from 'react-native'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'

import WavePhotoStrip from '../WavePhotoStrip'
import { fetchWavePhotos } from '../../screens/WaveDetail/reducer'
import * as CONST from '../../consts'

const ROLE_CONFIG = {
  owner: { label: 'Owner', color: CONST.MAIN_COLOR },
  facilitator: { label: 'Facilitator', color: '#8B5CF6' },
  contributor: { label: 'Contributor', color: '#6B7280' }
}

const WaveCard = ({ wave, onPress, onLongPress, theme }) => {
  const photoCount = wave.photosCount ?? 0
  const photos = wave.photos || []
  const roleConfig = ROLE_CONFIG[wave.myRole] || ROLE_CONFIG.contributor

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
        onPhotoPress={() => onPress(wave)}
        onPhotoLongPress={() => onLongPress(wave)}
      />
      <Pressable
        onPress={() => onPress(wave)}
        onLongPress={() => onLongPress(wave)}
        style={styles.infoContainer}
      >
        <View style={styles.infoRow}>
          <View style={styles.infoTextContainer}>
            <View style={styles.nameRow}>
              <Text style={[styles.waveName, { color: theme.TEXT_PRIMARY }]} numberOfLines={1} ellipsizeMode='tail'>
                {wave.name}
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
              {wave.isActive === false && (
                <View style={[styles.roleBadge, { backgroundColor: '#FEF3C7' }]}>
                  <Text style={[styles.roleBadgeText, { color: '#D97706' }]}>Pending</Text>
                </View>
              )}
            </View>
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
  }
})

export default WaveCard
