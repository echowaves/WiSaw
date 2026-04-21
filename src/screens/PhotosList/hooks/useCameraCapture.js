import { useState } from 'react'

import * as ImagePicker from 'expo-image-picker'
import * as Linking from 'expo-linking'
import * as MediaLibrary from 'expo-media-library'
import { useAtomValue } from 'jotai'
import { Alert } from 'react-native'
import Toast from 'react-native-toast-message'

import * as STATE from '../../../state'

export default function useCameraCapture ({ enqueueCapture, toastTopOffset }) {
  const [isCameraOpening, setIsCameraOpening] = useState(false)
  const locationState = useAtomValue(STATE.locationAtom)

  async function checkPermission ({
    permissionFunction,
    alertHeader,
    alertBody,
    permissionFunctionArgument
  }) {
    const { status } = await permissionFunction(permissionFunctionArgument)
    if (status !== 'granted') {
      Alert.alert(alertHeader, alertBody, [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Open Settings',
          onPress: () => {
            Linking.openSettings()
          }
        }
      ])
    }
    return status
  }

  const takePhoto = async ({ cameraType, waveUuid }) => {
    let cameraReturn
    if (cameraType === 'camera') {
      cameraReturn = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 1.0,
        exif: true
      })
    } else {
      cameraReturn = await ImagePicker.launchCameraAsync({
        mediaTypes: ['videos'],
        videoMaxDuration: 5,
        quality: 1.0,
        exif: true
      })
    }

    if (cameraReturn.canceled === false) {
      if (locationState.status !== 'ready') {
        Toast.show({
          text1: 'Waiting for location...',
          text2: 'Please wait until GPS coordinates are available.',
          type: 'info',
          topOffset: toastTopOffset
        })
        return
      }
      await MediaLibrary.saveToLibraryAsync(cameraReturn.assets[0].uri)
      await enqueueCapture({
        cameraImgUrl: cameraReturn.assets[0].uri,
        type: cameraReturn.assets[0].type,
        location: { coords: locationState.coords },
        waveUuid
      })
    }
  }

  const checkPermissionsForPhotoTaking = async ({ cameraType, waveUuid }) => {
    if (isCameraOpening) {
      console.log('Camera already opening, ignoring duplicate request')
      return
    }

    setIsCameraOpening(true)

    try {
      const cameraPermission = await checkPermission({
        permissionFunction: ImagePicker.requestCameraPermissionsAsync,
        alertHeader: 'Camera Access',
        alertBody: 'WiSaw needs camera access to capture and share photos. You can enable it in Settings.'
      })

      if (cameraPermission === 'granted') {
        const photoAlbomPermission = await checkPermission({
          permissionFunction: ImagePicker.requestMediaLibraryPermissionsAsync,
          alertHeader: 'Photo Library Access',
          alertBody: 'WiSaw needs photo library access to save your captured photos. You can enable it in Settings.',
          permissionFunctionArgument: true
        })

        if (photoAlbomPermission === 'granted') {
          await takePhoto({ cameraType, waveUuid })
        }
      }
    } catch (error) {
      console.error('Error in checkPermissionsForPhotoTaking:', error)
    } finally {
      setIsCameraOpening(false)
    }
  }

  return { isCameraOpening, checkPermissionsForPhotoTaking }
}
