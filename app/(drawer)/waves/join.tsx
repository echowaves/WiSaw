import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useAtom } from 'jotai'
import Toast from 'react-native-toast-message'

import AppHeader from '../../../src/components/AppHeader'
import * as STATE from '../../../src/state'
import * as CONST from '../../../src/consts'
import { joinOpenWave, joinWaveByInvite } from '../../../src/screens/Waves/reducer'
import { getTheme, SHARED_STYLES } from '../../../src/theme/sharedStyles'

export default function WaveJoinScreen () {
  const router = useRouter()
  const { waveUuid, inviteToken } = useLocalSearchParams()
  const [uuid] = useAtom(STATE.uuid)
  const [isDarkMode] = useAtom(STATE.isDarkMode)
  const theme = getTheme(isDarkMode)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [joined, setJoined] = useState(false)

  const isInvite = Boolean(inviteToken)

  const handleJoin = useCallback(async () => {
    if (!uuid) return
    setLoading(true)
    setError(null)

    try {
      let wave
      if (isInvite) {
        wave = await joinWaveByInvite({ inviteToken, uuid })
      } else {
        wave = await joinOpenWave({ waveUuid, uuid })
      }
      setJoined(true)
      Toast.show({
        text1: `Joined wave: ${wave.name}`,
        type: 'success',
        topOffset: 60,
        visibilityTime: 2000
      })
      // Navigate to wave detail after short delay
      setTimeout(() => {
        router.replace({
          pathname: `/waves/${wave.waveUuid}`,
          params: {
            waveName: wave.name,
            myRole: wave.myRole || 'contributor',
            isFrozen: wave.isFrozen ? '1' : '0'
          }
        })
      }, 500)
    } catch (err) {
      const message = err?.message || 'Unable to join wave'
      setError(message)
      Toast.show({
        text1: 'Could not join wave',
        text2: message,
        type: 'error',
        topOffset: 60,
        visibilityTime: 4000
      })
    } finally {
      setLoading(false)
    }
  }, [uuid, isInvite, inviteToken, waveUuid, router])

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => (
            <AppHeader
              onBack={() => router.back()}
              title='Join Wave'
            />
          )
        }}
      />
      <SafeAreaView edges={['bottom']} style={[styles.container, { backgroundColor: theme.BACKGROUND }]}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Wave Icon */}
          <View style={[styles.iconCircle, { backgroundColor: `${CONST.MAIN_COLOR}15` }]}>
            <MaterialCommunityIcons name='waves' size={48} color={CONST.MAIN_COLOR} />
          </View>

          <Text style={[styles.title, { color: theme.TEXT_PRIMARY }]}>
            {isInvite ? 'You\'ve Been Invited' : 'Join This Wave'}
          </Text>

          <Text style={[styles.subtitle, { color: theme.TEXT_SECONDARY }]}>
            You are about to join a wave as a contributor.
          </Text>

          {/* Photo Visibility Disclosure */}
          <View style={[styles.disclosureCard, { backgroundColor: theme.CARD_BACKGROUND, borderColor: theme.BORDER_LIGHT }]}>
            <View style={styles.disclosureHeader}>
              <MaterialCommunityIcons name='information-outline' size={20} color={CONST.MAIN_COLOR} />
              <Text style={[styles.disclosureTitle, { color: theme.TEXT_PRIMARY }]}>
                Before You Join
              </Text>
            </View>

            <Text style={[styles.disclosureText, { color: theme.TEXT_SECONDARY }]}>
              {'\u2022'} All photos in this wave are also visible in the global feed — anyone can view them.
            </Text>
            <Text style={[styles.disclosureText, { color: theme.TEXT_SECONDARY }]}>
              {'\u2022'} If someone deletes a photo from the global feed, it will also disappear from this wave.
            </Text>
            <Text style={[styles.disclosureText, { color: theme.TEXT_SECONDARY }]}>
              {'\u2022'} Once a wave is frozen (by the owner or by reaching its end date), photos cannot be removed or deleted — including from the global feed.
            </Text>
            <Text style={[styles.disclosureText, { color: theme.TEXT_SECONDARY }]}>
              {'\u2022'} Comments on frozen wave photos are also locked.
            </Text>
          </View>

          {/* Error Display */}
          {error && (
            <View style={[styles.errorCard, { backgroundColor: '#FFF0F0', borderColor: '#FFCCCC' }]}>
              <MaterialCommunityIcons name='alert-circle-outline' size={20} color='#CC0000' />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.joinButton, { backgroundColor: CONST.MAIN_COLOR }, (loading || joined) && styles.disabledButton]}
              onPress={handleJoin}
              disabled={loading || joined}
              activeOpacity={0.7}
            >
              {loading
                ? <ActivityIndicator color='white' />
                : (
                  <>
                    <MaterialCommunityIcons name='account-plus' size={20} color='white' />
                    <Text style={styles.joinButtonText}>
                      {joined ? 'Joined!' : 'Join as Contributor'}
                    </Text>
                  </>
                  )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: theme.BORDER_LIGHT }]}
              onPress={() => router.back()}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelButtonText, { color: theme.TEXT_SECONDARY }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    padding: 24,
    alignItems: 'center'
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24
  },
  disclosureCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24
  },
  disclosureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12
  },
  disclosureTitle: {
    fontSize: 16,
    fontWeight: '600'
  },
  disclosureText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8
  },
  errorCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#CC0000'
  },
  buttonContainer: {
    width: '100%',
    gap: 12
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12
  },
  joinButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  disabledButton: {
    opacity: 0.6
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500'
  }
})
