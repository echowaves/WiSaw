import { FontAwesome, FontAwesome5, MaterialIcons } from '@expo/vector-icons'
import { useCallback, useEffect, useState } from 'react' // Added useCallback
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
  imessage: { name: 'message', library: 'MaterialIcons', color: '#007AFF' }, // Scheme is 'sms'
  gmail: { name: 'email', library: 'MaterialIcons', color: '#DB4437' },
  outlook: { name: 'email', library: 'MaterialIcons', color: '#0078D4' },
  reddit: { name: 'reddit', library: 'FontAwesome', color: '#FF4500' },
  youtube: { name: 'youtube-play', library: 'FontAwesome', color: '#FF0000' },
  slack: { name: 'slack', library: 'FontAwesome', color: '#4A154B' },
  discord: { name: 'discord', library: 'FontAwesome5', color: '#5865F2' },
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
    maxHeight: '85%',
    paddingBottom: 0,
  }, // Adjusted paddingBottom
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: { fontSize: 20, fontWeight: 'bold', color: CONST.MAIN_COLOR },
  closeButton: { padding: 5 },
  debugInfoContainer: {
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  debugInfoText: { fontSize: 12, color: '#333', marginBottom: 2 },
  debugInfoTextBold: {
    fontSize: 13,
    color: '#000',
    fontWeight: 'bold',
    marginBottom: 3,
  },
  debugErrorText: {
    fontSize: 12,
    color: 'red',
    marginTop: 3,
    fontWeight: 'bold',
  },
  scrollContent: {
    /* flex: 1 by default within its container if modalContent has fixed/max height */
  },
  scrollContentContainer: { paddingBottom: 20 },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: { marginTop: 10, fontSize: 14, color: CONST.SECONDARY_COLOR },
  section: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
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
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    justifyContent: 'center',
  },
  nativeShareText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 10,
    fontSize: 16,
  },
  quickActionsRow: { flexDirection: 'row' },
  quickActionButton: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
    marginRight: 10,
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
    justifyContent: 'flex-start',
  },
  appButton: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 15,
    marginRight: '2%',
  },
  appIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
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
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  noAppsText: {
    marginTop: 8,
    textAlign: 'center',
    color: CONST.SECONDARY_COLOR,
    lineHeight: 18,
    fontSize: 13,
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
  sharingText: { marginTop: 10, color: CONST.MAIN_COLOR, fontWeight: '600' },
})

const ShareModal = ({ visible, onClose, shareData, topOffset = 100 }) => {
  const [availableApps, setAvailableApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [sharing, setSharing] = useState(false)
  const [errorInfo, setErrorInfo] = useState(null)

  const loadAvailableApps = useCallback(async () => {
    setLoading(true)
    setErrorInfo(null)
    try {
      const apps = await sharingHelper.getAvailableApps()
      setAvailableApps(apps)
    } catch (error) {
      setErrorInfo(error.message || 'Unknown error loading apps')
      setAvailableApps([])
      Toast.show({
        text1: 'Error loading apps',
        text2: error.message || 'Unable to check available sharing apps',
        type: 'error',
        topOffset,
      })
    } finally {
      setLoading(false)
    }
  }, [topOffset])

  useEffect(() => {
    if (visible) {
      loadAvailableApps()
    } else {
      setLoading(true) // Reset to loading for next open
      setAvailableApps([])
      setErrorInfo(null)
    }
  }, [visible, loadAvailableApps])

  const handleShare = async (method, app = null) => {
    setSharing(true)
    setErrorInfo(null)
    try {
      let result
      const currentShareData = shareData || {}

      if (method === 'native') {
        result = await sharingHelper.shareWithNativeSheet(currentShareData)
      } else if (method === 'app' && app) {
        result = await sharingHelper.shareToSpecificApp({
          app: app.name, // Ensure app.name is passed
          ...currentShareData,
        })
      } else if (method === 'sms') {
        const content = sharingHelper.createShareContent
          ? sharingHelper.createShareContent(currentShareData)
          : { message: 'Check out this content from WiSaw!' }
        if (!content || !content.message) {
          setErrorInfo('Could not create content for SMS.')
          Toast.show({
            text1: 'SMS Error',
            text2: 'Could not create content for SMS.',
            type: 'error',
            topOffset,
          })
          setSharing(false)
          return
        }
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
        onClose()
      } else if (result && !result.success) {
        const message = result.reason || 'Sharing action was not successful.'
        setErrorInfo(message)
        Toast.show({
          text1: 'Sharing failed',
          text2: message,
          type: 'error',
          topOffset,
        })
      } else if (
        !result &&
        method !== 'native' &&
        method !== 'sms' &&
        !(method === 'app' && app?.name)
      ) {
        // Avoid showing error if result is undefined from a path that might not return one (e.g. some native dismissals)
      }
    } catch (error) {
      const message = error.message || 'Unable to share content'
      setErrorInfo(message)
      Toast.show({
        text1: 'Sharing failed',
        text2: message,
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
    let IconComponent = MaterialIcons
    if (iconConfig.library === 'FontAwesome') IconComponent = FontAwesome
    else if (iconConfig.library === 'FontAwesome5') IconComponent = FontAwesome5
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
      disabled={sharing || loading}
    >
      <View style={styles.appIconContainer}>{renderIcon(app)}</View>
      <Text style={styles.appName} numberOfLines={1}>
        {app.displayName}
      </Text>
    </TouchableOpacity>
  )

  let mainContent
  if (loading) {
    mainContent = (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={CONST.MAIN_COLOR} />
        <Text style={styles.loadingText}>Loading sharing options...</Text>
      </View>
    )
  } else {
    mainContent = (
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Share</Text>
          <TouchableOpacity
            style={styles.nativeShareButton}
            onPress={() => handleShare('native')}
            disabled={sharing}
          >
            <MaterialIcons name="share" size={24} color="white" />
            <Text style={styles.nativeShareText}>Open Native Share Sheet</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => handleShare('sms')}
              disabled={sharing}
            >
              <MaterialIcons name="sms" size={24} color={CONST.MAIN_COLOR} />
              <Text style={styles.quickActionText}>SMS</Text>
            </TouchableOpacity>
          </View>
        </View>
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
        {availableApps.length === 0 && (
          <View style={styles.noAppsContainer}>
            <MaterialIcons
              name="info"
              size={48}
              color={CONST.SECONDARY_COLOR}
            />
            <Text style={styles.noAppsText}>
              No specific sharing apps detected.
            </Text>
            {errorInfo && (
              <Text style={[styles.noAppsText, styles.debugErrorText]}>
                Error: {errorInfo}
              </Text>
            )}
            <Text style={styles.noAppsText}>
              Use Native Share or SMS options above.
            </Text>
          </View>
        )}
      </ScrollView>
    )
  }

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
          <View style={styles.debugInfoContainer}>
            <Text style={styles.debugInfoTextBold}>Debug Info:</Text>
            <Text style={styles.debugInfoText}>
              Loading: {loading.toString()}
            </Text>
            <Text style={styles.debugInfoText}>
              Apps Found: {availableApps.length}
            </Text>
            {errorInfo && (
              <Text style={styles.debugErrorText}>
                Error Details: {errorInfo}
              </Text>
            )}
          </View>
          {mainContent}
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

export default ShareModal
