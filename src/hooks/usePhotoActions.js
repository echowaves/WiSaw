import { useCallback, useState } from 'react'
import { Alert } from 'react-native'
import { showInfoToast, showSuccessToast } from '../utils/showToast'
import { showErrorToast } from '../utils/showToast'
import showConfirmAlert from '../utils/showConfirmAlert'
import { useSetAtom } from 'jotai'

import * as reducer from '../components/Photo/reducer'
import { addPhotoToWave, removePhotoFromWave, createWave, reportWavePhoto } from '../screens/Waves/reducer'
import { emitPhotoDeletion } from '../events/photoDeletionBus'
import * as STATE from '../state'

const usePhotoActions = ({ photo, photoDetails, setPhotoDetails, uuid, toastTopOffset, onDeleted, onRemovedFromWave }) => {
  const [bans, setBans] = useState([])
  const [waveModalVisible, setWaveModalVisible] = useState(false)
  const setUngroupedPhotosCount = useSetAtom(STATE.ungroupedPhotosCount)

  const isOwnPhoto = photo?.uuid === uuid
  const isFrozenWaveForNonOwner = Boolean(photo?.waveIsFrozen) && photo?.waveViewerRole !== 'owner'

  const isPhotoBannedByMe = useCallback(() => bans.includes(photo?.id), [bans, photo?.id])

  const handleDelete = useCallback(() => {
    if (isFrozenWaveForNonOwner && photoDetails?.waveUuid) {
      showToast('Wave is frozen', { type: 'info', topOffset: toastTopOffset })
      return
    }
    if (photoDetails?.isPhotoWatched) {
      showErrorToast({
        title: "Can't delete bookmarked photo",
        message: 'Remove bookmark first',
        topOffset: toastTopOffset
      })
      return
    }
    showConfirmAlert(
      'Will delete photo for everyone!',
      "This can't be undone. Are you sure? ",
      async () => {
        const deleted = await reducer.deletePhoto({
          photo,
          uuid,
          topOffset: toastTopOffset
        })

        if (deleted) {
          emitPhotoDeletion({ photoId: photo.id })
          if (onDeleted) {
            onDeleted(photo.id)
          }
        }
      },
      { destructiveText: 'Yes' }
    )
  }, [photo, photoDetails?.isPhotoWatched, photoDetails?.waveUuid, uuid, toastTopOffset, onDeleted, isFrozenWaveForNonOwner])

  const handleBan = useCallback(() => {
    if (photoDetails?.waveUuid) {
      if (isFrozenWaveForNonOwner) {
        showInfoToast('Wave is frozen', { text2: 'Reporting is disabled for frozen waves', topOffset: toastTopOffset })
        return
      }
      if (isPhotoBannedByMe()) {
        showErrorToast({
          title: 'Looks like you already Reported this Photo',
          message: 'You can only Report same Photo once',
          topOffset: toastTopOffset
        })
      } else {
        showConfirmAlert(
          'Report wave content?',
          'This photo will be reviewed by moderators and automated systems. Objectionable content will be removed. Continue?',
          async () => {
            try {
              await reportWavePhoto({ waveUuid: photoDetails.waveUuid, photoId: photo.id, uuid })
              setBans((prev) => [...prev, photo.id])
              showToast('Reported to moderators', { type: 'success', topOffset: toastTopOffset })
            } catch (err) {
              showErrorToast({
                title: 'Unable to report content',
                message: err,
                topOffset: toastTopOffset
              })
            }
          },
          { destructiveText: 'Yes' }
        )
      }
      return
    }

    if (photoDetails?.isPhotoWatched) {
      showErrorToast({
        title: "Can't report bookmarked photo",
        message: 'Remove bookmark first',
        topOffset: toastTopOffset
       })
      return
     }
    if (isPhotoBannedByMe()) {
      showErrorToast({
        title: 'Looks like you already Reported this Photo',
        message: 'You can only Report same Photo once',
        topOffset: toastTopOffset
      })
    } else {
      showConfirmAlert(
        'Report abusive Photo?',
        'This report will be reviewed by moderators and automated systems. Users reported 3 times will be blocked from posting new content. Are you sure?',
        async () => {
          await reducer.banPhoto({ photo, uuid, topOffset: toastTopOffset })
          setBans((prev) => [...prev, photo.id])
        },
        { destructiveText: 'Yes' }
      )
    }
  }, [photo, photoDetails?.isPhotoWatched, photoDetails?.waveUuid, uuid, toastTopOffset, isPhotoBannedByMe, isFrozenWaveForNonOwner])

  const handleFlipWatch = useCallback(async () => {
    try {
      if (photoDetails?.isPhotoWatched) {
        setPhotoDetails({
          ...photoDetails,
          watchersCount: await reducer.unwatchPhoto({
            photo,
            uuid,
            topOffset: toastTopOffset
          }),
          isPhotoWatched: !photoDetails?.isPhotoWatched
        })
      } else {
        setPhotoDetails({
          ...photoDetails,
          watchersCount: await reducer.watchPhoto({
            photo,
            uuid,
            topOffset: toastTopOffset
          }),
          isPhotoWatched: !photoDetails?.isPhotoWatched
        })
      }
    } catch (err) {
      showErrorToast({
        title: 'Unable to complete',
        message: err,
        topOffset: toastTopOffset
      })
    }
  }, [photo, photoDetails, setPhotoDetails, uuid, toastTopOffset])

  const handleWaveButtonPress = useCallback(() => {
    if (!isOwnPhoto) {
      showToast('Only your own photos can be added to waves', { type: 'info', topOffset: toastTopOffset })
      return
    }
    setWaveModalVisible(true)
  }, [isOwnPhoto, toastTopOffset])

  const handleWaveSelect = useCallback(async (wave) => {
    setWaveModalVisible(false)
    if (onRemovedFromWave) {
      onRemovedFromWave(photo.id)
    }
    const previousDetails = { ...photoDetails }
    setPhotoDetails({
      ...photoDetails,
      waveName: wave.name,
      waveUuid: wave.waveUuid
    })
    try {
      await addPhotoToWave({ waveUuid: wave.waveUuid, photoId: photo.id, uuid })
      setUngroupedPhotosCount(prev => Math.max((prev ?? 1) - 1, 0))
      showToast(`Added to: ${wave.name}`, { type: 'success', topOffset: toastTopOffset, visibilityTime: 1500 })
    } catch (err) {
      setPhotoDetails(previousDetails)
      showErrorToast({
        title: 'Failed to add to wave',
        message: err,
        topOffset: toastTopOffset
      })
    }
  }, [photo, photoDetails, setPhotoDetails, uuid, toastTopOffset, onRemovedFromWave])

  const handleWaveRemove = useCallback(async () => {
    if (isFrozenWaveForNonOwner && photoDetails?.waveUuid) {
      showToast('Wave is frozen', { type: 'info', text2: 'Only the wave owner can remove photos from a frozen wave', topOffset: toastTopOffset })
      return
    }
    setWaveModalVisible(false)
    if (onRemovedFromWave) {
      onRemovedFromWave(photo.id)
    }
    const previousDetails = { ...photoDetails }
    setPhotoDetails({
      ...photoDetails,
      waveName: null,
      waveUuid: null
    })
    try {
      await removePhotoFromWave({ waveUuid: previousDetails.waveUuid, photoId: photo.id, uuid })
      showToast('Removed from wave', { type: 'success', topOffset: toastTopOffset, visibilityTime: 1500 })
    } catch (err) {
      setPhotoDetails(previousDetails)
      showErrorToast({
        title: 'Failed to remove from wave',
        message: err,
        topOffset: toastTopOffset
      })
    }
  }, [photo, photoDetails, setPhotoDetails, toastTopOffset, onRemovedFromWave, isFrozenWaveForNonOwner])

  const handleCreateWave = useCallback(async (name, locationParams) => {
    setWaveModalVisible(false)
    try {
      const createParams = { name, description: '', uuid }
      if (locationParams) {
        createParams.lat = locationParams.lat
        createParams.lon = locationParams.lon
        createParams.radius = locationParams.radius
      }
      const newWave = await createWave(createParams)
      setPhotoDetails({
        ...photoDetails,
        waveName: newWave.name,
        waveUuid: newWave.waveUuid
      })
      await addPhotoToWave({ waveUuid: newWave.waveUuid, photoId: photo.id, uuid })
      setUngroupedPhotosCount(prev => Math.max((prev ?? 1) - 1, 0))
      showSuccessToast(`Added to new wave: ${name}`, { topOffset: toastTopOffset, visibilityTime: 1500 })
    } catch (err) {
      showErrorToast({
        title: 'Failed to create wave',
        message: err,
        topOffset: toastTopOffset
      })
    }
  }, [photo, photoDetails, setPhotoDetails, uuid, toastTopOffset])

  return {
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
    setWaveModalVisible,
    bans
  }
}

export default usePhotoActions
