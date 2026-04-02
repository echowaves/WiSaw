import React, { useCallback } from 'react'
import { View, Text, TouchableOpacity, Pressable, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAtom } from 'jotai'

import WavePhotoStrip from '../WavePhotoStrip'
import { fetchFriendPhotos } from '../../screens/FriendDetail/reducer'
import * as STATE from '../../state'

const FriendCard = ({ friend, onPress, onLongPress, onPhotoPress, onPhotoLongPress, theme }) => {
  const [uuid] = useAtom(STATE.uuid)
  const displayName = friend?.contact || 'Unnamed Friend'
  const isUnnamed = !friend?.contact
  const photos = friend.photos || []
  const friendUserUuid = friend.uuid1 === uuid ? friend.uuid2 : friend.uuid1

  const fetchFn = useCallback(async (pageNumber, batch) => {
    return fetchFriendPhotos({ uuid, friendUuid: friendUserUuid, pageNumber, batch })
  }, [uuid, friendUserUuid])

  return (
    <View style={[styles.card, { backgroundColor: theme.CARD_BACKGROUND }]}>
      <WavePhotoStrip
        initialPhotos={photos}
        fetchFn={fetchFn}
        theme={theme}
        onPhotoPress={() => onPhotoPress ? onPhotoPress(friend) : onPress(friend)}
        onPhotoLongPress={() => onPhotoLongPress ? onPhotoLongPress(friend) : onLongPress(friend)}
      />
      <Pressable
        onPress={() => onPress(friend)}
        onLongPress={() => onLongPress(friend)}
        style={styles.infoContainer}
      >
        <View style={styles.infoRow}>
          <View style={styles.infoTextContainer}>
            <Text style={[styles.friendName, { color: theme.TEXT_PRIMARY }]} numberOfLines={1} ellipsizeMode='tail'>
              {displayName}
            </Text>
            {isUnnamed && (
              <Text style={[styles.unnamedHint, { color: theme.TEXT_SECONDARY }]}>
                Long-press to assign a name
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={(e) => { e.stopPropagation(); onLongPress(friend) }}
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
  friendName: {
    fontSize: 14,
    fontWeight: '600'
  },
  unnamedHint: {
    fontSize: 12,
    marginTop: 2,
    fontStyle: 'italic'
  }
})

export default FriendCard
