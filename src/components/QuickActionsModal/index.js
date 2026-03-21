import { useAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  InteractionManager,
  Modal,
  StyleSheet,
  TouchableOpacity
} from 'react-native'

import usePhotoActions from '../../hooks/usePhotoActions'
import useToastTopOffset from '../../hooks/useToastTopOffset'
import * as photoReducer from '../Photo/reducer'
import * as sharingHelper from '../../utils/simpleSharingHelper'
import * as STATE from '../../state'
import { getTheme } from '../../theme/sharedStyles'

import CloseButton from '../ui/CloseButton'
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
      const task = InteractionManager.runAfterInteractions(() => {
        photoReducer
          .getPhotoDetails({ photoId: String(photo.id), uuid })
          .then((details) => {
            if (details) {
              setPhotoDetails(details)
            }
          })
          .finally(() => setLoading(false))
      })
      return () => task.cancel()
    }
  }, [visible, photo?.id, uuid])

  const styles = useMemo(() => createStyles(theme), [theme])

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      onRequestClose={onClose}
    >
      {visible && photo && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <TouchableOpacity activeOpacity={1} style={styles.content}>
            <CloseButton onPress={onClose} />
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
      )}

      {visible && photo && (
        <WaveSelectorModal
          visible={waveModalVisible}
          onClose={() => setWaveModalVisible(false)}
          onSelectWave={handleWaveSelect}
          onRemoveFromWave={handleWaveRemove}
          onCreateWave={handleCreateWave}
          currentWaveUuid={photoDetails?.waveUuid}
          uuid={uuid}
        />
      )}
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
    }
  })

export default QuickActionsModal
