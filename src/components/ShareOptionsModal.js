import { FontAwesome5 } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import React, { useEffect, useState } from 'react'
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import Toast from 'react-native-toast-message'
import QRCode from 'react-qr-code'
import * as CONST from '../consts'
import * as friendsHelper from '../screens/FriendsList/friends_helper'

const { width } = Dimensions.get('window')

const ShareOptionsModal = ({
  visible,
  onClose,
  friendshipUuid,
  friendName,
  uuid,
  topOffset = 100,
}) => {
  const [shareUrl, setShareUrl] = useState('')

  useEffect(() => {
    if (visible && friendshipUuid && friendName) {
      // Use the exact same URL format as the sharing helper for friendship invitations
      const url = `https://link.wisaw.com/friends/${friendshipUuid}`
      setShareUrl(url)

      console.log('Friendship invitation URL generated:', {
        shareUrl: url,
      })
    }
  }, [visible, friendshipUuid, friendName])

  const handleTextShare = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

      const result = await friendsHelper.shareFriendship({
        uuid,
        friendshipUuid,
        contactName: friendName,
      })

      if (result) {
        Toast.show({
          type: 'success',
          position: 'top',
          text1: 'Friendship Request Shared!',
          text2: `Shared ${friendName}'s friendship invitation`,
          visibilityTime: 2000,
          autoHide: true,
          topOffset,
        })
        onClose()
      }
    } catch (error) {
      console.error('Error sharing friendship:', error)
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Sharing failed',
        text2: 'Unable to share friendship request',
        visibilityTime: 3000,
        autoHide: true,
        topOffset,
      })
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Share Friendship Invitation</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <FontAwesome5 name="times" size={18} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.contentContainer}>
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
                Share this friendship invitation
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
                      <FontAwesome5 name="qrcode" size={40} color="#ccc" />
                      <Text style={styles.placeholderText}>
                        Generating QR Code...
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.qrDescription}>
                  Scan this code to accept the friendship request
                </Text>
              </View>
            </View>

            {/* Share Options */}
            <View style={styles.optionsContainer}>
              <Text style={styles.sectionTitle}>Share Methods</Text>

              <TouchableOpacity
                style={styles.optionButton}
                onPress={handleTextShare}
                activeOpacity={0.7}
              >
                <View
                  style={[styles.optionIcon, { backgroundColor: '#ff6b35' }]}
                >
                  <FontAwesome5 name="share-alt" size={18} color="white" />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Share Invitation</Text>
                  <Text style={styles.optionDescription}>
                    Send friendship invitation via text/message
                  </Text>
                </View>
                <FontAwesome5 name="chevron-right" size={14} color="#ccc" />
              </TouchableOpacity>
            </View>

            {/* Instructions */}
            <View style={styles.instructions}>
              <Text style={styles.instructionText}>
                • Scan the QR code above with another device's camera{'\n'}• Or
                tap "Share Invitation" to send via text/message{'\n'}• Recipient
                can accept the friendship request
              </Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34, // Safe area padding
    minHeight: 500,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 4,
  },
  contentContainer: {
    paddingVertical: 10,
  },
  scrollContainer: {
    flex: 1,
    minHeight: 400,
  },
  friendInfo: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  friendName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  qrSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  qrContainer: {
    alignItems: 'center',
  },
  qrCodeWrapper: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
  },
  qrPlaceholder: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  placeholderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  qrDescription: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    maxWidth: 280,
  },
  optionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 16,
  },
  instructions: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  instructionText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
})

export default ShareOptionsModal
