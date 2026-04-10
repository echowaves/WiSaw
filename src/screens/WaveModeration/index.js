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
import { router } from 'expo-router'

import * as STATE from '../../state'
import * as CONST from '../../consts'
import { getTheme } from '../../theme/sharedStyles'
import {
  listWaveAbuseReports,
  dismissWaveReport,
  removePhotoFromWave,
  banUserFromWave
} from '../Waves/reducer'
import ActionMenu from '../../components/ActionMenu'

const WaveModeration = ({ waveUuid, waveName }) => {
  const [uuid] = useAtom(STATE.uuid)
  const [isDarkMode] = useAtom(STATE.isDarkMode)
  const [nickName] = useAtom(STATE.nickName)
  const theme = getTheme(isDarkMode)

  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [menuReport, setMenuReport] = useState(null)

  // Identity gate: facilitators must have a nickname
  const hasIdentity = nickName && nickName.length > 0

  const loadReports = useCallback(async () => {
    setLoading(true)
    try {
      const data = await listWaveAbuseReports({ waveUuid, uuid })
      setReports(data || [])
    } catch (error) {
      console.error(error)
      Toast.show({ type: 'error', text1: 'Error loading reports', text2: error.message })
    } finally {
      setLoading(false)
    }
  }, [waveUuid, uuid])

  useEffect(() => {
    if (hasIdentity) {
      loadReports()
    }
  }, [loadReports, hasIdentity])

  const handleDismiss = async (report) => {
    try {
      await dismissWaveReport({ reportId: report.id, uuid })
      Toast.show({ type: 'success', text1: 'Report dismissed' })
      setReports(prev => prev.filter(r => r.id !== report.id))
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error dismissing report', text2: error.message })
    }
  }

  const handleRemovePhoto = (report) => {
    Alert.alert(
      'Remove Photo',
      'Remove this photo from the wave?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removePhotoFromWave({ photoId: report.photoId, waveUuid, uuid })
              Toast.show({ type: 'success', text1: 'Photo removed from wave' })
              setReports(prev => prev.filter(r => r.id !== report.id))
            } catch (error) {
              Toast.show({ type: 'error', text1: 'Error', text2: error.message })
            }
          }
        }
      ]
    )
  }

  const handleBanUser = (report) => {
    Alert.alert(
      'Ban User',
      'Ban the user who uploaded this photo from the wave?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Ban',
          style: 'destructive',
          onPress: async () => {
            try {
              await banUserFromWave({
                waveUuid,
                targetUuid: report.uuid,
                uuid,
                reason: 'Reported content'
              })
              Toast.show({ type: 'success', text1: 'User banned' })
              loadReports()
            } catch (error) {
              Toast.show({ type: 'error', text1: 'Error', text2: error.message })
            }
          }
        }
      ]
    )
  }

  const getReportMenuItems = (report) => [
    {
      key: 'dismiss',
      icon: 'check-circle-outline',
      label: 'Dismiss Report',
      onPress: () => handleDismiss(report)
    },
    {
      key: 'remove-photo',
      icon: 'image-off-outline',
      label: 'Remove Photo from Wave',
      destructive: true,
      onPress: () => handleRemovePhoto(report)
    },
    'separator',
    {
      key: 'ban-user',
      icon: 'account-cancel-outline',
      label: 'Ban User',
      destructive: true,
      onPress: () => handleBanUser(report)
    }
  ]

  // Identity gate card
  if (!hasIdentity) {
    return (
      <View style={[styles.container, { backgroundColor: theme.INTERACTIVE_BACKGROUND }]}>
        <View style={[styles.identityCard, { backgroundColor: theme.CARD_BACKGROUND }]}>
          <MaterialCommunityIcons name='shield-lock-outline' size={48} color={CONST.MAIN_COLOR} />
          <Text style={[styles.identityTitle, { color: theme.TEXT_PRIMARY }]}>
            Identity Required
          </Text>
          <Text style={[styles.identityText, { color: theme.TEXT_SECONDARY }]}>
            Moderators must have a nickname set to ensure accountability. Set up your identity to access moderation tools.
          </Text>
          <TouchableOpacity
            style={[styles.identityButton, { backgroundColor: CONST.MAIN_COLOR }]}
            onPress={() => router.push('/identity')}
          >
            <Text style={styles.identityButtonText}>Set Up Identity</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.INTERACTIVE_BACKGROUND }]}>
        <ActivityIndicator size='large' color={CONST.MAIN_COLOR} />
      </View>
    )
  }

  const renderReport = ({ item }) => (
    <TouchableOpacity
      style={[styles.reportRow, { backgroundColor: theme.CARD_BACKGROUND }]}
      onPress={() => setMenuReport(item)}
    >
      <View style={[styles.reportIcon, { backgroundColor: '#EF444420' }]}>
        <MaterialCommunityIcons name='flag-outline' size={20} color='#EF4444' />
      </View>
      <View style={styles.reportInfo}>
        <Text style={[styles.reportTitle, { color: theme.TEXT_PRIMARY }]}>
          Photo #{item.photoId.substring(0, 8)}
        </Text>
        <Text style={[styles.reportDetail, { color: theme.TEXT_SECONDARY }]}>
          Reported {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <MaterialCommunityIcons name='dots-vertical' size={20} color={theme.TEXT_SECONDARY} />
    </TouchableOpacity>
  )

  return (
    <View style={[styles.container, { backgroundColor: theme.INTERACTIVE_BACKGROUND }]}>
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        renderItem={renderReport}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name='shield-check' size={48} color={theme.TEXT_SECONDARY} />
            <Text style={[styles.emptyText, { color: theme.TEXT_SECONDARY }]}>
              No pending reports
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.TEXT_SECONDARY }]}>
              All clear! No content has been flagged for review.
            </Text>
          </View>
        }
      />

      <ActionMenu
        visible={!!menuReport}
        onClose={() => setMenuReport(null)}
        title='Report Actions'
        items={menuReport ? getReportMenuItems(menuReport) : []}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  listContent: {
    padding: 12,
    gap: 8
  },
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12
  },
  reportIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  reportInfo: {
    flex: 1
  },
  reportTitle: {
    fontSize: 15,
    fontWeight: '600'
  },
  reportDetail: {
    fontSize: 12,
    marginTop: 2
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 8
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600'
  },
  emptySubtext: {
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 40
  },
  identityCard: {
    margin: 20,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12
  },
  identityTitle: {
    fontSize: 18,
    fontWeight: '700'
  },
  identityText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20
  },
  identityButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8
  },
  identityButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 15
  }
})

export default WaveModeration
