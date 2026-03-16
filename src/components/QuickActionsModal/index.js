import { useAtom } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import usePhotoActions from '../../hooks/usePhotoActions'
import useToastTopOffset from '../../hooks/useToastTopOffset'
import * as photoReducer from '../Photo/reducer'
import * as sharingHelper from '../../utils/simpleSharingHelper'
import * as STATE from '../../state'
import { getTheme } from '../../theme/sharedStyles'

import PhotoActionButtons from '../PhotoActionButtons'
import WaveSelectorModal from '../WaveSelectorModal'

const QuickActionsModal = ({ visible, photo, onClose, onPhotoDeleted }) => {
  const [darkMode] = useAtom(STATE.isDarkMode)
  const theme = getTheme(darkMode)
  const [uuid] = useAtom(STATE.uuid)
  const toastTopOffset = useToastTopOffset()

  const [photoDetails, setPhotoDetails] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleDeleted = useCallback(
    (photoId) => {
      onClose()
      if (onPhotoDeleted) {
        onPhotoDeleted(photoId)
      }
    },
    [onClose, onPhotoDeleted]
  )

  const {
    handleBan,
    handleDelete,
    handleFlipWatch,
    handleWaveButtonPress,
    handleWaveSelect,
    handleWaveRemove,
    handleCreateWave,
    isPhotoBannedByMe,
    isOwnPhoto,
    waveModalVisible,
    setWaveModalVisible
  } = usePhotoActions({
    photo,
    photoDetails,
    setPhotoDetails,
    uuid,
    toastTopOffset,
    onDeleted: handleDeleted
  })

  useEffect(() => {
    if (visible && photo) {
      setPhotoDetails(null)
      setLoading(true)
      photoReducer
        .getPhotoDetails({ photoId: String(photo.id), uuid })
        .then((details) => {
          if (details) {
            setPhotoDetails(details)
          }
        })
        .finally(() => setLoading(false))
    }
  }, [visible, photo?.id, uuid])

  if (!visible || !photo) return null

  const styles = createStyles(theme)

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} style={styles.content}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name='close' size={20} color={theme.TEXT_SECONDARY} />
          </TouchableOpacity>
          <Image
            source={{ uri: photo.thumbUrl }}
            style={styles.thumbnail}
            resizeMode='cover'
          />

          {loading && (
            <ActivityIndicator
              size='small'
              color={theme.TEXT_PRIMARY}
              style={styles.spinner}
            />
          )}

          {!loading && photoDetails && (
            <PhotoActionButtons
              photoDetails={photoDetails}
              isOwnPhoto={isOwnPhoto}
              isPhotoBannedByMe={isPhotoBannedByMe}
              theme={theme}
              toastTopOffset={toastTopOffset}
              onBan={handleBan}
              onDelete={handleDelete}
              onFlipWatch={handleFlipWatch}
              onWavePress={handleWaveButtonPress}
              onShare={() => sharingHelper.sharePhoto(photo, photoDetails, toastTopOffset)}
            />
          )}
        </TouchableOpacity>
      </TouchableOpacity>

      <WaveSelectorModal
        visible={waveModalVisible}
        onClose={() => setWaveModalVisible(false)}
        onSelectWave={handleWaveSelect}
        onRemoveFromWave={handleWaveRemove}
        onCreateWave={handleCreateWave}
        currentWaveUuid={photoDetails?.waveUuid}
        uuid={uuid}
      />
    </Modal>
  )
}

const createStyles = (theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center'
    },
    content: {
      backgroundColor: theme.SURFACE,
      borderRadius: 16,
      padding: 16,
      width: '85%',
      maxWidth: 360,
      alignItems: 'center',
      gap: 12
    },
    thumbnail: {
      width: '100%',
      aspectRatio: 1,
      borderRadius: 12
    },
    spinner: {
      marginVertical: 4
    },
    closeButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      zIndex: 10,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      justifyContent: 'center',
      alignItems: 'center'
    }
  })

export default QuickActionsModal
