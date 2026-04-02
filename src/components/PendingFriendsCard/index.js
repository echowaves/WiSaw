import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { FontAwesome5 } from '@expo/vector-icons'

import * as CONST from '../../consts'

const PendingFriendsCard = ({ pendingFriends, onRemind, onLongPress, theme }) => {
  if (!pendingFriends || pendingFriends.length === 0) return null

  return (
    <View style={[styles.card, { backgroundColor: `${CONST.MAIN_COLOR}1A`, borderColor: CONST.MAIN_COLOR }]}>
      <View style={styles.header}>
        <FontAwesome5 name='clock' size={18} color={CONST.MAIN_COLOR} />
        <Text style={[styles.title, { color: theme.TEXT_PRIMARY }]}>
          Pending Friends ({pendingFriends.length})
        </Text>
      </View>

      {pendingFriends.map((friend) => {
        const displayName = friend?.contact || 'Unnamed Friend'
        return (
          <TouchableOpacity
            key={friend.friendshipUuid}
            style={[styles.friendRow, { borderColor: theme.INTERACTIVE_BORDER }]}
            onLongPress={() => onLongPress(friend)}
            activeOpacity={0.7}
          >
            <View style={styles.friendInfo}>
              <Text style={[styles.friendName, { color: theme.TEXT_PRIMARY }]} numberOfLines={1} ellipsizeMode='tail'>
                {displayName}
              </Text>
              <Text style={[styles.statusText, { color: theme.TEXT_SECONDARY }]}>
                Waiting for confirmation
              </Text>
              <Text style={[styles.explainerText, { color: theme.TEXT_SECONDARY }]}>
                Share this link with your friend to establish the connection. Friend names are never stored on our servers — they are only kept locally on your device to ensure privacy and security.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.remindButton}
              onPress={() => onRemind(friend)}
              activeOpacity={0.8}
            >
              <FontAwesome5 name='share' size={14} color='white' style={{ marginRight: 6 }} />
              <Text style={styles.remindText}>Share</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    margin: 8,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    padding: 12,
    overflow: 'hidden'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth
  },
  friendInfo: {
    flex: 1,
    marginRight: 12
  },
  friendName: {
    fontSize: 15,
    fontWeight: '600'
  },
  statusText: {
    fontSize: 13,
    marginTop: 2
  },
  explainerText: {
    fontSize: 12,
    marginTop: 2,
    fontStyle: 'italic'
  },
  remindButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CONST.MAIN_COLOR,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14
  },
  remindText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600'
  }
})

export default PendingFriendsCard
