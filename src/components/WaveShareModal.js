import FontAwesome5 from '@react-native-vector-icons/fontawesome5'
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons'
import * as Haptics from 'expo-haptics'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Modal,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import Toast from 'react-native-toast-message'
import showErrorToast from '../utils/showErrorToast'
import showToast from '../utils/showToast'
import QRCode from 'react-qr-code'
import * as CONST from '../consts'
import { createWaveInvite } from '../screens/Waves/reducer'
import useSimpleFetch from '../hooks/useSimpleFetch'

const normalizeHours = (text) => {
  const parsed = Number.parseInt(text, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

const normalizeMaxUses = (text) => {
  const parsed = Number.parseInt(text, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

const buildApiParams = (expiryText, maxUsesText) => {
  const hours = normalizeHours(expiryText)
  const maxUses = normalizeMaxUses(maxUsesText)
  return {
    expiresAt: hours !== null
      ? new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
      : undefined,
    maxUses: maxUses ?? undefined
  }
}

const WaveShareModal = ({
  visible,
  onClose,
  wave,
  uuid,
  topOffset = 100
}) => {
  const [shareUrl, setShareUrl] = useState('')
  const [inviteExpiryHours, setInviteExpiryHours] = useState('24')
  const [inviteMaxUses, setInviteMaxUses] = useState('')
  // Normalized invite options committed to the live invite (null = unlimited)
  const [committedParams, setCommittedParams] = useState({ hours: 24, maxUses: null })

  const isOpen = wave?.open === true

  // Store invite params so the hook can access them at execution time
  const inviteParamsRef = useRef({ expiresAt: undefined, maxUses: undefined })
  // Mirrors the raw text state so the open-effect can read current values
  // without depending on them (keystrokes must not re-trigger the invite)
  const inviteExpiryHoursRef = useRef('24')
  const inviteMaxUsesRef = useRef('')

  const handleExpiryChange = useCallback((text) => {
    setInviteExpiryHours(text)
    inviteExpiryHoursRef.current = text
  }, [])

  const handleMaxUsesChange = useCallback((text) => {
    setInviteMaxUses(text)
    inviteMaxUsesRef.current = text
  }, [])

  const { loading, execute } = useSimpleFetch(
    async () => {
      const invite = await createWaveInvite({ waveUuid: wave.waveUuid, uuid, ...inviteParamsRef.current })
      setShareUrl(invite.deepLink)
    },
    { autoExecute: false }
  )

  // Committed options vs. current field values — gates the Regenerate button
  const currentParams = {
    hours: normalizeHours(inviteExpiryHours),
    maxUses: normalizeMaxUses(inviteMaxUses)
  }
  const inviteDirty = !isOpen &&
    (currentParams.hours !== committedParams.hours || currentParams.maxUses !== committedParams.maxUses)

  useEffect(() => {
    if (!visible || !wave) {
      setShareUrl('')
      return
    }

    if (isOpen && wave.joinUrl) {
      setShareUrl(wave.joinUrl)
      return
    }

    // Invite-only: create the invite exactly once when the modal opens,
    // committing the current option values. Keystrokes do not re-trigger;
    // only the explicit "Regenerate Invite" action does.
    inviteParamsRef.current = buildApiParams(inviteExpiryHoursRef.current, inviteMaxUsesRef.current)
    setCommittedParams({
      hours: normalizeHours(inviteExpiryHoursRef.current),
      maxUses: normalizeMaxUses(inviteMaxUsesRef.current)
    })

    execute().catch((err) => {
      console.error('Failed to create wave invite:', err)
      showErrorToast({
        title: 'Failed to create invite',
        message: err.message || 'Try again later',
        topOffset
      })
    })
  }, [visible, wave, isOpen, uuid, topOffset, execute])

  const handleRegenerateInvite = useCallback(() => {
    inviteParamsRef.current = buildApiParams(inviteExpiryHours, inviteMaxUses)
    setCommittedParams({
      hours: normalizeHours(inviteExpiryHours),
      maxUses: normalizeMaxUses(inviteMaxUses)
    })

    execute().catch((err) => {
      console.error('Failed to regenerate wave invite:', err)
      showErrorToast({
        title: 'Failed to create invite',
        message: err.message || 'Try again later',
        topOffset
      })
    })
  }, [inviteExpiryHours, inviteMaxUses, execute, topOffset])

  const handleShare = useCallback(async () => {
    if (!shareUrl) return

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

      const message = isOpen
        ? `Join my wave "${wave?.name}" on WiSaw!\n\n${shareUrl}`
        : `You're invited to join wave "${wave?.name}" on WiSaw!\n\n${shareUrl}`

      await Share.share({ message })

      showToast('Shared!', { text2: `Shared wave "${wave?.name}"`, type: 'success', visibilityTime: 2000, topOffset })
      onClose()
    } catch (error) {
      if (error.message !== 'User did not share') {
        console.error('Error sharing wave:', error)
        showErrorToast({
          title: 'Sharing failed',
          message: 'Unable to share wave',
          topOffset
        })
      }
    }
  }, [shareUrl, wave, isOpen, onClose, topOffset])

  return (
    <Modal visible={visible} transparent animationType='slide' onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Share Wave</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <FontAwesome5 name='times' iconStyle='solid' size={18} color='#666' />
            </TouchableOpacity>
          </View>

          <View style={styles.contentContainer}>
            {/* Wave Info */}
            <View style={styles.waveInfo}>
              <MaterialCommunityIcons name='waves' size={32} color={CONST.MAIN_COLOR} />
              <Text style={styles.waveName}>{wave?.name || 'Wave'}</Text>
              <Text style={styles.description}>
                {isOpen ? 'Anyone with this link can join' : 'Invite-only — share this invitation'}
              </Text>
            </View>

            {!isOpen && (
              <View style={styles.optionsPanel}>
                <Text style={styles.sectionTitle}>Invite Options</Text>
                <View style={styles.inputRow}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Expires In (hours)</Text>
                    <TextInput
                      style={styles.input}
                      value={inviteExpiryHours}
                      onChangeText={handleExpiryChange}
                      keyboardType='number-pad'
                      placeholder='24'
                      placeholderTextColor='#999'
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Max Uses</Text>
                    <TextInput
                      style={styles.input}
                      value={inviteMaxUses}
                      onChangeText={handleMaxUsesChange}
                      keyboardType='number-pad'
                      placeholder='Unlimited'
                      placeholderTextColor='#999'
                    />
                  </View>
                </View>
                {inviteDirty && (
                  <TouchableOpacity
                    style={[styles.regenerateButton, loading && styles.disabledButton]}
                    onPress={handleRegenerateInvite}
                    disabled={loading}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons name='refresh' size={16} color='white' />
                    <Text style={styles.regenerateButtonLabel}>Regenerate Invite</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* QR Code Section */}
            <View style={styles.qrSection}>
              <Text style={styles.sectionTitle}>QR Code</Text>
              <View style={styles.qrContainer}>
                <View style={styles.qrCodeWrapper}>
                  {loading
                    ? (
                      <View style={styles.qrPlaceholder}>
                        <ActivityIndicator size='large' color={CONST.MAIN_COLOR} />
                        <Text style={styles.placeholderText}>Generating invite...</Text>
                      </View>
                      )
                    : shareUrl
                      ? (
                        <QRCode
                          value={shareUrl}
                          size={160}
                          bgColor='#ffffff'
                          fgColor='#000000'
                          level='M'
                        />
                        )
                      : (
                        <View style={styles.qrPlaceholder}>
                          <FontAwesome5 name='qrcode' iconStyle='solid' size={40} color='#ccc' />
                          <Text style={styles.placeholderText}>Generating QR Code...</Text>
                        </View>
                        )}
                </View>
                <Text style={styles.qrDescription}>
                  Scan this code to join the wave
                </Text>
              </View>
            </View>

            {/* Share Button */}
            <View style={styles.optionsContainer}>
              <Text style={styles.sectionTitle}>Share</Text>

              <TouchableOpacity
                style={[styles.optionButton, (!shareUrl || loading) && styles.disabledButton]}
                onPress={handleShare}
                activeOpacity={0.7}
                disabled={!shareUrl || loading}
              >
                <View style={[styles.optionIcon, { backgroundColor: CONST.MAIN_COLOR }]}>
                  <FontAwesome5 name='share-alt' iconStyle='solid' size={18} color='white' />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>
                    {isOpen ? 'Share Join Link' : 'Share Invitation'}
                  </Text>
                  <Text style={styles.optionDescription}>
                    Send via text, email, or messaging app
                  </Text>
                </View>
                <FontAwesome5 name='chevron-right' iconStyle='solid' size={14} color='#ccc' />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
    maxHeight: '85%'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee'
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333'
  },
  closeButton: {
    padding: 4
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 16
  },
  waveInfo: {
    alignItems: 'center',
    marginBottom: 20
  },
  waveName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 8
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 4
  },
  qrSection: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10
  },
  qrContainer: {
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 20
  },
  qrCodeWrapper: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  qrPlaceholder: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center'
  },
  placeholderText: {
    fontSize: 13,
    color: '#999',
    marginTop: 8
  },
  qrDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 12,
    textAlign: 'center'
  },
  optionsContainer: {
    marginBottom: 10
  },
  optionsPanel: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10
  },
  inputGroup: {
    flex: 1
  },
  inputLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6
  },
  input: {
    borderWidth: 1,
    borderColor: '#e4e4e4',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#fff'
  },
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: CONST.MAIN_COLOR,
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 10
  },
  regenerateButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white'
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 14,
    gap: 12
  },
  disabledButton: {
    opacity: 0.5
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  optionContent: {
    flex: 1
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333'
  },
  optionDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 2
  }
})

export default WaveShareModal
