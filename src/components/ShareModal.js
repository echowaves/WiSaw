import { FontAwesome, FontAwesome5, MaterialIcons } from '@expo/vector-icons'
import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import Toast from 'react-native-toast-message'

import * as CONST from '../consts'
import * as sharingHelper from '../utils/sharingHelper'

// App icons mapping
const APP_ICONS = {
  whatsapp: { name: 'whatsapp', library: 'FontAwesome', color: '#25D366' },
  telegram: { name: 'telegram', library: 'FontAwesome', color: '#0088cc' },
  facebook: { name: 'facebook', library: 'FontAwesome', color: '#1877F2' },
  twitter: { name: 'twitter', library: 'FontAwesome', color: '#1DA1F2' },
  instagram: { name: 'instagram', library: 'FontAwesome', color: '#E4405F' },
  linkedin: { name: 'linkedin', library: 'FontAwesome', color: '#0077B5' },
  pinterest: { name: 'pinterest', library: 'FontAwesome', color: '#BD081C' },
  snapchat: { name: 'snapchat', library: 'FontAwesome', color: '#FFFC00' },
  tiktok: { name: 'musical-note', library: 'MaterialIcons', color: '#000000' },
  imessage: { name: 'message', library: 'MaterialIcons', color: '#007AFF' },
  gmail: { name: 'email', library: 'MaterialIcons', color: '#DB4437' },
  outlook: { name: 'email', library: 'MaterialIcons', color: '#0078D4' },
  reddit: { name: 'reddit', library: 'FontAwesome', color: '#FF4500' },
  youtube: { name: 'youtube-play', library: 'FontAwesome', color: '#FF0000' },
  slack: { name: 'slack', library: 'FontAwesome', color: '#4A154B' },
  discord: { name: 'discord', library: 'FontAwesome5', color: '#5865F2' },
}

const ShareModal = ({ visible, onClose, shareData, topOffset = 100 }) => {
  const [availableApps, setAvailableApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [sharing, setSharing] = useState(false)

  useEffect(() => {
    if (visible) {
      loadAvailableApps()
    }
  }, [visible])

  const loadAvailableApps = async () => {
    try {
      setLoading(true)
      const apps = await sharingHelper.getAvailableApps()
      setAvailableApps(apps)
    } catch (error) {
      console.error('Error loading available apps:', error)
      Toast.show({
        text1: 'Error loading apps',
        text2: 'Unable to check available sharing apps',
        type: 'error',
        topOffset,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async (method, app = null) => {
    try {
      setSharing(true)

      let result
      if (method === 'native') {
        result = await sharingHelper.shareWithNativeSheet(shareData)
      } else if (method === 'app' && app) {
        result = await sharingHelper.shareToSpecificApp({
          app: app.name,
          ...shareData,
        })
      } else if (method === 'sms') {
        const content = sharingHelper.createShareContent
          ? sharingHelper.createShareContent(shareData)
          : { message: 'Check out this content from WiSaw!' }
        result = await sharingHelper.shareViaSMS({ content })
      }

      if (result?.success) {
        Toast.show({
          text1: 'Shared successfully!',
          text2: result.activityType ? `Shared via ${result.activityType}` : '',
          type: 'success',
          topOffset,
        })
        onClose()
      } else if (result?.dismissed) {
        // User dismissed the share sheet - this is normal, don't show error
        onClose()
      }
    } catch (error) {
      console.error('Share error:', error)
      Toast.show({
        text1: 'Sharing failed',
        text2: error.message || 'Unable to share content',
        type: 'error',
        topOffset,
      })
    } finally {
      setSharing(false)
    }
  }

  const renderIcon = (app) => {
    const iconConfig = APP_ICONS[app.name] || {
      name: 'share',
      library: 'MaterialIcons',
      color: CONST.MAIN_COLOR,
    }

    const IconComponent =
      iconConfig.library === 'FontAwesome'
        ? FontAwesome
        : iconConfig.library === 'FontAwesome5'
          ? FontAwesome5
          : MaterialIcons

    return (
      <IconComponent
        name={iconConfig.name}
        size={24}
        color={iconConfig.color}
      />
    )
  }

  const renderAppButton = (app) => (
    <TouchableOpacity
      key={app.name}
      style={styles.appButton}
      onPress={() => handleShare('app', app)}
      disabled={sharing}
    >
      <View style={styles.appIconContainer}>{renderIcon(app)}</View>
      <Text style={styles.appName} numberOfLines={1}>
        {app.displayName}
      </Text>
    </TouchableOpacity>
  )

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Share via</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={CONST.MAIN_COLOR} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={CONST.MAIN_COLOR} />
              <Text style={styles.loadingText}>Loading sharing options...</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {/* Native Share Option */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>System Share</Text>
                <TouchableOpacity
                  style={styles.nativeShareButton}
                  onPress={() => handleShare('native')}
                  disabled={sharing}
                >
                  <MaterialIcons name="share" size={24} color="white" />
                  <Text style={styles.nativeShareText}>
                    Open Native Share Sheet
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Quick Actions */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.quickActionsRow}>
                  <TouchableOpacity
                    style={styles.quickActionButton}
                    onPress={() => handleShare('sms')}
                    disabled={sharing}
                  >
                    <MaterialIcons
                      name="sms"
                      size={24}
                      color={CONST.MAIN_COLOR}
                    />
                    <Text style={styles.quickActionText}>SMS</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Available Apps */}
              {availableApps.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    Available Apps ({availableApps.length})
                  </Text>
                  <View style={styles.appsGrid}>
                    {availableApps.map(renderAppButton)}
                  </View>
                </View>
              )}

              {availableApps.length === 0 && !loading && (
                <View style={styles.noAppsContainer}>
                  <MaterialIcons
                    name="info"
                    size={48}
                    color={CONST.SECONDARY_COLOR}
                  />
                  <Text style={styles.noAppsText}>
                    No sharing apps detected. You can still use the native share
                    sheet above.
                  </Text>
                </View>
              )}
            </ScrollView>
          )}

          {sharing && (
            <View style={styles.sharingOverlay}>
              <ActivityIndicator size="large" color={CONST.MAIN_COLOR} />
              <Text style={styles.sharingText}>Sharing...</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: CONST.MAIN_COLOR,
  },
  closeButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    color: CONST.SECONDARY_COLOR,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: CONST.MAIN_COLOR,
    marginBottom: 15,
  },
  nativeShareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CONST.MAIN_COLOR,
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
  },
  nativeShareText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 10,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionButton: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
    minWidth: 80,
  },
  quickActionText: {
    marginTop: 5,
    fontSize: 12,
    color: CONST.MAIN_COLOR,
    fontWeight: '500',
  },
  appsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  appButton: {
    width: '22%',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
  },
  appIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  appName: {
    fontSize: 11,
    color: CONST.MAIN_COLOR,
    textAlign: 'center',
    fontWeight: '500',
  },
  noAppsContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noAppsText: {
    marginTop: 10,
    textAlign: 'center',
    color: CONST.SECONDARY_COLOR,
    lineHeight: 20,
  },
  sharingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sharingText: {
    marginTop: 10,
    color: CONST.MAIN_COLOR,
    fontWeight: '600',
  },
})

export default ShareModal
