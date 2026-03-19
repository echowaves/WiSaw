import { useCallback, useState } from 'react'
import { Alert } from 'react-native'
import Toast from 'react-native-toast-message'

import * as reducer from '../components/Photo/reducer'
import { addPhotoToWave, removePhotoFromWave, createWave } from '../screens/Waves/reducer'

const usePhotoActions = ({ photo, photoDetails, setPhotoDetails, uuid, toastTopOffset, onDeleted }) => {
  const [bans, setBans] = useState([])
  const [waveModalVisible, setWaveModalVisible] = useState(false)

  const isOwnPhoto = photo?.uuid === uuid

  const isPhotoBannedByMe = useCallback(() => bans.includes(photo?.id), [bans, photo?.id])

  const handleDelete = useCallback(() => {
    if (photoDetails?.isPhotoWatched) {
      Toast.show({
        text1: 'Unable to delete Starred photo',
        text2: 'Un-Star photo first',
        type: 'error',
        topOffset: toastTopOffset
      })
      return
    }
    Alert.alert(
      'Will delete photo for everyone!',
      "This can't be undone. Are you sure? ",
      [
        { text: 'No', onPress: () => null, style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            const deleted = await reducer.deletePhoto({
              photo,
              uuid,
              topOffset: toastTopOffset
            })

            if (deleted && onDeleted) {
              onDeleted(photo.id)
            }
          }
        }
      ],
      { cancelable: true }
    )
  }, [photo, photoDetails?.isPhotoWatched, uuid, toastTopOffset, onDeleted])

  const handleBan = useCallback(() => {
    if (photoDetails?.isPhotoWatched) {
      Toast.show({
        text1: 'Unable to Report Starred photo',
        text2: 'Un-Star photo first',
        type: 'error',
        topOffset: toastTopOffset
      })
      return
    }
    if (isPhotoBannedByMe()) {
      Toast.show({
        text1: 'Looks like you already Reported this Photo',
        text2: 'You can only Report same Photo once',
        type: 'error',
        topOffset: toastTopOffset
      })
    } else {
      Alert.alert(
        'Report abusive Photo?',
        'The user who posted this photo will be banned. Are you sure?',
        [
          { text: 'No', onPress: () => null, style: 'cancel' },
          {
            text: 'Yes',
            onPress: async () => {
              await reducer.banPhoto({ photo, uuid, topOffset: toastTopOffset })
              setBans((prev) => [...prev, photo.id])
            }
          }
        ],
        { cancelable: true }
      )
    }
  }, [photo, photoDetails?.isPhotoWatched, uuid, toastTopOffset, isPhotoBannedByMe])

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
      Toast.show({
        text1: 'Unable to complete',
        text2: 'Network issue? Try again later',
        type: 'error',
        topOffset: toastTopOffset
      })
    }
  }, [photo, photoDetails, setPhotoDetails, uuid, toastTopOffset])

  const handleWaveButtonPress = useCallback(() => {
    if (!isOwnPhoto) {
      Toast.show({
        text1: 'Only your own photos can be added to waves',
        type: 'info',
        topOffset: toastTopOffset
      })
      return
    }
    setWaveModalVisible(true)
  }, [isOwnPhoto, toastTopOffset])

  const handleWaveSelect = useCallback(async (wave) => {
    setWaveModalVisible(false)
    const previousDetails = { ...photoDetails }
    setPhotoDetails({
      ...photoDetails,
      waveName: wave.name,
      waveUuid: wave.waveUuid
    })
    try {
      await addPhotoToWave({ waveUuid: wave.waveUuid, photoId: photo.id, uuid })
      Toast.show({
        text1: `Added to: ${wave.name}`,
        type: 'success',
        topOffset: toastTopOffset,
        visibilityTime: 1500
      })
    } catch (err) {
      setPhotoDetails(previousDetails)
      Toast.show({
        text1: 'Failed to add to wave',
        text2: 'Try again later',
        type: 'error',
        topOffset: toastTopOffset
      })
    }
  }, [photo, photoDetails, setPhotoDetails, uuid, toastTopOffset])

  const handleWaveRemove = useCallback(async () => {
    setWaveModalVisible(false)
    const previousDetails = { ...photoDetails }
    setPhotoDetails({
      ...photoDetails,
      waveName: null,
      waveUuid: null
    })
    try {
      await removePhotoFromWave({ waveUuid: previousDetails.waveUuid, photoId: photo.id })
      Toast.show({
        text1: 'Removed from wave',
        type: 'success',
        topOffset: toastTopOffset,
        visibilityTime: 1500
      })
    } catch (err) {
      setPhotoDetails(previousDetails)
      Toast.show({
        text1: 'Failed to remove from wave',
        text2: 'Try again later',
        type: 'error',
        topOffset: toastTopOffset
      })
    }
  }, [photo, photoDetails, setPhotoDetails, toastTopOffset])

  const handleCreateWave = useCallback(async (name) => {
    setWaveModalVisible(false)
    try {
      const newWave = await createWave({ name, description: '', uuid })
      setPhotoDetails({
        ...photoDetails,
        waveName: newWave.name,
        waveUuid: newWave.waveUuid
      })
      await addPhotoToWave({ waveUuid: newWave.waveUuid, photoId: photo.id, uuid })
      Toast.show({
        text1: `Added to new wave: ${name}`,
        type: 'success',
        topOffset: toastTopOffset,
        visibilityTime: 1500
      })
    } catch (err) {
      Toast.show({
        text1: 'Failed to create wave',
        text2: 'Try again later',
        type: 'error',
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
