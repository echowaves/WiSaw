import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native'
import { useAtom } from 'jotai'
import Toast from 'react-native-toast-message'
import { MaterialCommunityIcons } from '@expo/vector-icons'

import * as STATE from '../../state'
import * as CONST from '../../consts'
import { getTheme } from '../../theme/sharedStyles'
import {
  listWaveMembers,
  assignFacilitator,
  removeFacilitator,
  removeUserFromWave,
  listWaveInvites,
  revokeWaveInvite,
  listWaveBans
} from '../Waves/reducer'
import ActionMenu from '../../components/ActionMenu'

const ROLE_CONFIG = {
  owner: { label: 'Owner', color: CONST.MAIN_COLOR, icon: 'crown' },
  facilitator: { label: 'Facilitator', color: '#8B5CF6', icon: 'shield-account' },
  contributor: { label: 'Contributor', color: '#6B7280', icon: 'account' }
}

const WaveMembers = ({ waveUuid, waveName }) => {
  const [uuid] = useAtom(STATE.uuid)
  const [isDarkMode] = useAtom(STATE.isDarkMode)
  const theme = getTheme(isDarkMode)

  const [members, setMembers] = useState([])
  const [invites, setInvites] = useState([])
  const [bans, setBans] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('members') // members | invites | bans

  // Action menu
  const [menuMember, setMenuMember] = useState(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [membersData, invitesData, bansData] = await Promise.all([
        listWaveMembers({ waveUuid, uuid }),
        listWaveInvites({ waveUuid, uuid }),
        listWaveBans({ waveUuid, uuid })
      ])
      setMembers(membersData || [])
      setInvites((invitesData || []).filter(i => i.active))
      setBans(bansData || [])
    } catch (error) {
      console.error(error)
      Toast.show({ type: 'error', text1: 'Error loading members', text2: error.message })
    } finally {
      setLoading(false)
    }
  }, [waveUuid, uuid])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleMakeFacilitator = async (member) => {
    try {
      await assignFacilitator({ waveUuid, targetUuid: member.uuid, uuid })
      Toast.show({ type: 'success', text1: `${member.nickName || 'User'} is now a facilitator` })
      loadData()
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.message })
    }
  }

  const handleRemoveFacilitator = async (member) => {
    try {
      await removeFacilitator({ waveUuid, targetUuid: member.uuid, uuid })
      Toast.show({ type: 'success', text1: `${member.nickName || 'User'} is no longer a facilitator` })
      loadData()
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.message })
    }
  }

  const handleRemoveMember = (member) => {
    Alert.alert(
      'Remove Member',
      `Remove ${member.nickName || 'this user'} from the wave?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeUserFromWave({ waveUuid, targetUuid: member.uuid, uuid })
              Toast.show({ type: 'success', text1: 'Member removed' })
              loadData()
            } catch (error) {
              Toast.show({ type: 'error', text1: 'Error', text2: error.message })
            }
          }
        }
      ]
    )
  }

  const handleRevokeInvite = (invite) => {
    Alert.alert(
      'Revoke Invite',
      'This invite link will no longer work.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            try {
              await revokeWaveInvite({ inviteToken: invite.inviteToken, uuid })
              Toast.show({ type: 'success', text1: 'Invite revoked' })
              loadData()
            } catch (error) {
              Toast.show({ type: 'error', text1: 'Error', text2: error.message })
            }
          }
        }
      ]
    )
  }

  const getMemberMenuItems = (member) => {
    if (member.role === 'owner' || member.uuid === uuid) return []
    const items = []
    if (member.role === 'contributor') {
      items.push({
        key: 'make-facilitator',
        icon: 'shield-account',
        label: 'Make Facilitator',
        onPress: () => handleMakeFacilitator(member)
      })
    }
    if (member.role === 'facilitator') {
      items.push({
        key: 'remove-facilitator',
        icon: 'shield-off-outline',
        label: 'Remove Facilitator Role',
        onPress: () => handleRemoveFacilitator(member)
      })
    }
    items.push('separator')
    items.push({
      key: 'remove',
      icon: 'account-remove-outline',
      label: 'Remove from Wave',
      destructive: true,
      onPress: () => handleRemoveMember(member)
    })
    return items
  }

  const renderMember = ({ item }) => {
    const roleInfo = ROLE_CONFIG[item.role] || ROLE_CONFIG.contributor
    const isMe = item.uuid === uuid
    const canManage = item.role !== 'owner' && !isMe

    return (
      <TouchableOpacity
        style={[styles.memberRow, { backgroundColor: theme.CARD_BACKGROUND }]}
        onPress={canManage ? () => setMenuMember(item) : undefined}
        activeOpacity={canManage ? 0.7 : 1}
      >
        <View style={[styles.memberAvatar, { backgroundColor: roleInfo.color + '20' }]}>
          <MaterialCommunityIcons name={roleInfo.icon} size={20} color={roleInfo.color} />
        </View>
        <View style={styles.memberInfo}>
          <Text style={[styles.memberName, { color: theme.TEXT_PRIMARY }]}>
            {item.nickName || 'Anonymous'}
            {isMe ? ' (you)' : ''}
          </Text>
          <Text style={[styles.memberRole, { color: roleInfo.color }]}>{roleInfo.label}</Text>
        </View>
        {canManage && (
          <MaterialCommunityIcons name='dots-vertical' size={20} color={theme.TEXT_SECONDARY} />
        )}
      </TouchableOpacity>
    )
  }

  const renderInvite = ({ item }) => {
    const expiresAt = item.expiresAt ? new Date(item.expiresAt) : null
    const isExpired = expiresAt && expiresAt < new Date()

    return (
      <View style={[styles.inviteRow, { backgroundColor: theme.CARD_BACKGROUND }]}>
        <View style={styles.inviteInfo}>
          <Text style={[styles.inviteToken, { color: theme.TEXT_PRIMARY }]} numberOfLines={1}>
            {item.inviteToken.substring(0, 16)}...
          </Text>
          <Text style={[styles.inviteDetail, { color: theme.TEXT_SECONDARY }]}>
            Used {item.useCount || 0}{item.maxUses ? `/${item.maxUses}` : ''} times
            {expiresAt ? ` · ${isExpired ? 'Expired' : `Expires ${expiresAt.toLocaleDateString()}`}` : ''}
          </Text>
        </View>
        <TouchableOpacity onPress={() => handleRevokeInvite(item)} style={styles.revokeButton}>
          <MaterialCommunityIcons name='link-off' size={18} color='#EF4444' />
        </TouchableOpacity>
      </View>
    )
  }

  const renderBan = ({ item }) => (
    <View style={[styles.memberRow, { backgroundColor: theme.CARD_BACKGROUND }]}>
      <View style={[styles.memberAvatar, { backgroundColor: '#EF444420' }]}>
        <MaterialCommunityIcons name='account-cancel' size={20} color='#EF4444' />
      </View>
      <View style={styles.memberInfo}>
        <Text style={[styles.memberName, { color: theme.TEXT_PRIMARY }]}>
          {item.uuid.substring(0, 12)}...
        </Text>
        {item.reason && (
          <Text style={[styles.memberRole, { color: theme.TEXT_SECONDARY }]}>{item.reason}</Text>
        )}
        <Text style={[styles.inviteDetail, { color: theme.TEXT_SECONDARY }]}>
          Banned {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </View>
  )

  const tabs = [
    { key: 'members', label: `Members (${members.length})` },
    { key: 'invites', label: `Invites (${invites.length})` },
    { key: 'bans', label: `Bans (${bans.length})` }
  ]

  return (
    <View style={[styles.container, { backgroundColor: theme.INTERACTIVE_BACKGROUND }]}>
      {/* Tab Bar */}
      <View style={[styles.tabBar, { borderBottomColor: theme.INTERACTIVE_BORDER }]}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && { borderBottomColor: CONST.MAIN_COLOR, borderBottomWidth: 2 }
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabLabel,
                { color: activeTab === tab.key ? CONST.MAIN_COLOR : theme.TEXT_SECONDARY }
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading
        ? (
          <View style={styles.centered}>
            <ActivityIndicator size='large' color={CONST.MAIN_COLOR} />
          </View>
          )
        : (
          <>
            {activeTab === 'members' && (
              <FlatList
                data={members}
                keyExtractor={(item) => item.uuid}
                renderItem={renderMember}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                  <Text style={[styles.emptyText, { color: theme.TEXT_SECONDARY }]}>No members yet</Text>
                }
              />
            )}
            {activeTab === 'invites' && (
              <FlatList
                data={invites}
                keyExtractor={(item) => item.inviteToken}
                renderItem={renderInvite}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                  <Text style={[styles.emptyText, { color: theme.TEXT_SECONDARY }]}>No active invites</Text>
                }
              />
            )}
            {activeTab === 'bans' && (
              <FlatList
                data={bans}
                keyExtractor={(item) => item.uuid}
                renderItem={renderBan}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                  <Text style={[styles.emptyText, { color: theme.TEXT_SECONDARY }]}>No banned users</Text>
                }
              />
            )}
          </>
          )}

      <ActionMenu
        visible={!!menuMember}
        onClose={() => setMenuMember(null)}
        title={menuMember?.nickName || 'Member'}
        items={menuMember ? getMemberMenuItems(menuMember) : []}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center'
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600'
  },
  listContent: {
    padding: 12,
    gap: 8
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  memberInfo: {
    flex: 1
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600'
  },
  memberRole: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2
  },
  inviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12
  },
  inviteInfo: {
    flex: 1
  },
  inviteToken: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'monospace'
  },
  inviteDetail: {
    fontSize: 12,
    marginTop: 2
  },
  revokeButton: {
    padding: 8
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 40
  }
})

export default WaveMembers
