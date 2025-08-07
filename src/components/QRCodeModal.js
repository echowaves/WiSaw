import { FontAwesome5 } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import React, { useEffect, useState } from 'react'
import {
  Alert,
  Dimensions,
  Modal,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import Toast from 'react-native-toast-message'
import QRCode from 'react-qr-code'
import * as CONST from '../consts'
import {
  createFriendshipNameDeepLink,
  createFriendshipNameUniversalLink,
} from '../utils/qrCodeHelper'

const { width } = Dimensions.get('window')

const QRCodeModal = ({
  visible,
  onClose,
  friendshipUuid,
  friendName,
  topOffset = 100,
}) => {
  const [qrUrl, setQrUrl] = useState('') // For QR code (custom scheme)
  const [shareUrl, setShareUrl] = useState('') // For sharing (universal link)

  useEffect(() => {
    if (visible && friendshipUuid && friendName) {
      // Create QR-friendly deep link (custom scheme)
      const qrDeepLink = createFriendshipNameDeepLink({
        friendshipUuid,
        friendName,
      })
      setQrUrl(qrDeepLink)

      // Create share-friendly universal link
      const universalLink = createFriendshipNameUniversalLink({
        friendshipUuid,
        friendName,
      })
      setShareUrl(universalLink)

      console.log('QR Code URLs generated:', {
        qrUrl: qrDeepLink,
        shareUrl: universalLink,
      })
    }
  }, [visible, friendshipUuid, friendName])

  const handleShare = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

      const shareOptions = {
        message: `Share ${friendName || 'Unknown Friend'}'s friendship name in WiSaw\n\n${shareUrl}\n\nTap this link to update the friend name on your device.`,
        url: shareUrl,
      }

      // Use React Native's built-in Share API
      const result = await Share.share(shareOptions)

      if (result.action === Share.sharedAction) {
        Toast.show({
          text1: 'Shared successfully!',
          text2: `Shared ${friendName || 'Unknown Friend'}'s name link`,
          type: 'success',
          topOffset,
        })
      }
    } catch (error) {
      console.error('Share error:', error)
      Toast.show({
        text1: 'Sharing failed',
        text2: 'Unable to share link',
        type: 'error',
        topOffset,
      })
    }
  }

  const handleCopyLink = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

      // Show link in an alert since we don't have clipboard library
      Alert.alert(
        'Share Link',
        `${shareUrl}\n\nTap "Share" to send this link to another device.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Share',
            style: 'default',
            onPress: () => handleShare(),
          },
        ],
      )
    } catch (error) {
      console.error('Copy link error:', error)
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
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
              <FontAwesome5 name="times" size={18} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Friend Info */}
          <View style={styles.friendInfo}>
            <FontAwesome5
              name="user-circle"
              size={32}
              color={CONST.MAIN_COLOR}
            />
            <Text style={styles.friendName}>
              {friendName || 'Unknown Friend'}
            </Text>
            <Text style={styles.description}>
              Share this friend's name with another device
            </Text>
          </View>

          {/* QR Code */}
          <View style={styles.qrContainer}>
            <View style={styles.qrCodeWrapper}>
              {qrUrl ? (
                <QRCode
                  value={qrUrl}
                  size={180}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="M"
                />
              ) : (
                <View style={styles.qrPlaceholder}>
                  <FontAwesome5 name="qrcode" size={60} color="#ccc" />
                  <Text style={styles.placeholderText}>
                    Generating QR Code...
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.qrDescription}>
              Scan this QR code with another device to share{' '}
              {friendName || 'Unknown Friend'}'s name
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.shareButton]}
              onPress={handleShare}
            >
              <FontAwesome5 name="share-alt" size={16} color="white" />
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.copyButton]}
              onPress={handleCopyLink}
            >
              <FontAwesome5 name="copy" size={16} color={CONST.MAIN_COLOR} />
              <Text style={styles.copyButtonText}>Copy Link</Text>
            </TouchableOpacity>
          </View>

          {/* Instructions */}
          <View style={styles.instructions}>
            <Text style={styles.instructionText}>
              • Scan this QR code with your other device's camera{'\n'}• Or use
              "Share" to send the link directly{'\n'}• Both devices must have
              this friendship
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: width - 40,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  friendInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  friendName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  qrCodeWrapper: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  qrPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 180,
    height: 180,
  },
  placeholderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  qrDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  shareButton: {
    backgroundColor: CONST.MAIN_COLOR,
  },
  shareButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  copyButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: CONST.MAIN_COLOR,
  },
  copyButtonText: {
    color: CONST.MAIN_COLOR,
    fontWeight: '600',
    fontSize: 16,
  },
  instructions: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  instructionText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
})

export default QRCodeModal
