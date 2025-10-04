import { FontAwesome5 } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useAtom } from 'jotai'
import React, { useEffect, useState } from 'react'
import { Modal, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Toast from 'react-native-toast-message'
import QRCode from 'react-qr-code'
import * as CONST from '../consts'
import * as STATE from '../state'
import { getTheme } from '../theme/sharedStyles'
import { createFriendshipNameUniversalLink } from '../utils/qrCodeHelper'

const ShareFriendNameModal = ({
  visible,
  onClose,
  friendshipUuid,
  friendName,
  topOffset = 100
}) => {
  const [shareUrl, setShareUrl] = useState('')
  const [isDarkMode] = useAtom(STATE.isDarkMode)

  const theme = getTheme(isDarkMode)

  useEffect(() => {
    if (visible && friendshipUuid && friendName) {
      // Use the QR-specific deep link for friend name sharing
      const universalLink = createFriendshipNameUniversalLink({
        friendshipUuid,
        friendName
      })
      setShareUrl(universalLink)

      console.log('Friend name share URL generated:', {
        shareUrl: universalLink
      })
    }
  }, [visible, friendshipUuid, friendName])

  const handleShareFriendName = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

      const message = `Share ${friendName}'s name in WiSaw\n\n${shareUrl}\n\nScan the QR code or tap this link to update the friend name on your device.`

      const shareOptions = {
        message,
        url: shareUrl
      }

      const result = await Share.share(shareOptions)

      if (result.action === Share.sharedAction) {
        Toast.show({
          text1: 'Friend name shared!',
          text2: `Shared ${friendName}'s name`,
          type: 'success',
          topOffset
        })
        onClose()
      }
    } catch (error) {
      console.error('Friend name share error:', error)
      Toast.show({
        text1: 'Sharing failed',
        text2: 'Unable to share friend name',
        type: 'error',
        topOffset
      })
    }
  }

  const createStyles = (theme) =>
    StyleSheet.create({
      overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end'
      },
      modalContainer: {
        backgroundColor: theme.BACKGROUND,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 34, // Safe area padding
        minHeight: 500,
        maxHeight: '85%'
      },
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.BORDER
      },
      title: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.TEXT_PRIMARY,
        flex: 1,
        textAlign: 'center'
      },
      closeButton: {
        padding: 4
      },
      contentContainer: {
        paddingVertical: 10
      },
      friendInfo: {
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 20
      },
      friendName: {
        fontSize: 20,
        fontWeight: '600',
        color: theme.TEXT_PRIMARY,
        marginTop: 12,
        marginBottom: 4
      },
      description: {
        fontSize: 14,
        color: theme.TEXT_SECONDARY,
        textAlign: 'center'
      },
      qrSection: {
        paddingHorizontal: 20,
        paddingBottom: 20
      },
      sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.TEXT_PRIMARY,
        marginBottom: 16
      },
      qrContainer: {
        alignItems: 'center'
      },
      qrCodeWrapper: {
        padding: 20,
        backgroundColor: isDarkMode ? '#FFFFFF' : '#FFFFFF', // Keep QR code background white for readability
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        marginBottom: 12
      },
      qrPlaceholder: {
        width: 160,
        height: 160,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.SURFACE,
        borderRadius: 8
      },
      placeholderText: {
        marginTop: 12,
        fontSize: 14,
        color: theme.TEXT_SECONDARY,
        textAlign: 'center'
      },
      qrDescription: {
        fontSize: 13,
        color: theme.TEXT_SECONDARY,
        textAlign: 'center',
        maxWidth: 280
      },
      optionsContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20
      },
      optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: theme.CARD_BACKGROUND,
        borderRadius: 12,
        marginBottom: 12
      },
      optionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16
      },
      optionContent: {
        flex: 1
      },
      optionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.TEXT_PRIMARY,
        marginBottom: 2
      },
      optionDescription: {
        fontSize: 13,
        color: theme.TEXT_SECONDARY,
        lineHeight: 16
      },
      instructions: {
        paddingHorizontal: 20,
        paddingBottom: 10
      },
      instructionText: {
        fontSize: 12,
        color: theme.TEXT_SECONDARY,
        textAlign: 'center',
        lineHeight: 16
      }
    })

  const styles = createStyles(theme)

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Share Friend Name</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <FontAwesome5 name="times" size={18} color={theme.TEXT_SECONDARY} />
            </TouchableOpacity>
          </View>

          <View style={styles.contentContainer}>
            {/* Friend Info */}
            <View style={styles.friendInfo}>
              <FontAwesome5 name="user-circle" size={32} color={CONST.MAIN_COLOR} />
              <Text style={styles.friendName}>{friendName || 'Unknown Friend'}</Text>
              <Text style={styles.description}>
                Share this friend's name to update it on another device
              </Text>
            </View>

            {/* QR Code Section */}
            <View style={styles.qrSection}>
              <Text style={styles.sectionTitle}>QR Code</Text>
              <View style={styles.qrContainer}>
                <View style={styles.qrCodeWrapper}>
                  {shareUrl ? (
                    <QRCode
                      value={shareUrl}
                      size={160}
                      bgColor="#ffffff"
                      fgColor="#000000"
                      level="M"
                    />
                  ) : (
                    <View style={styles.qrPlaceholder}>
                      <FontAwesome5 name="qrcode" size={40} color={theme.TEXT_SECONDARY} />
                      <Text style={styles.placeholderText}>Generating QR Code...</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.qrDescription}>
                  Scan this code to update the friend's name on another device
                </Text>
              </View>
            </View>

            {/* Share Options */}
            <View style={styles.optionsContainer}>
              <Text style={styles.sectionTitle}>Share Methods</Text>

              <TouchableOpacity
                style={styles.optionButton}
                onPress={handleShareFriendName}
                activeOpacity={0.7}
              >
                <View style={[styles.optionIcon, { backgroundColor: '#28a745' }]}>
                  <FontAwesome5 name="user-tag" size={18} color="white" />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Share Friend Name</Text>
                  <Text style={styles.optionDescription}>Send friend's name via text/message</Text>
                </View>
                <FontAwesome5 name="chevron-right" size={14} color={theme.TEXT_SECONDARY} />
              </TouchableOpacity>
            </View>

            {/* Instructions */}
            <View style={styles.instructions}>
              <Text style={styles.instructionText}>
                • Scan the QR code above with another device's camera{'\n'}• Or tap "Share Friend
                Name" to send via text/message{'\n'}• Both devices must have this friendship to
                update the name
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default ShareFriendNameModal
