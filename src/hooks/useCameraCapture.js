import { useState } from 'react'

import * as ImagePicker from 'expo-image-picker'
import * as Linking from 'expo-linking'
import * as MediaLibrary from 'expo-media-library'
import { useAtomValue } from 'jotai'
import { Alert } from 'react-native'
import { showInfoToast, showErrorToast } from '../utils/showToast'

import * as STATE from '../state'
import { groupingAtom } from '../utils/groupingAtom'

export default function useCameraCapture ({ enqueueCapture, toastTopOffset }) {
  const [isCameraOpening, setIsCameraOpening] = useState(false)
  const locationState = useAtomValue(STATE.locationAtom)
  const netAvailable = useAtomValue(STATE.netAvailable)
  const grouping = useAtomValue(groupingAtom)

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
    console.log('[takePhoto] Starting camera flow, cameraType:', cameraType)
    let cameraReturn
    try {
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
      console.log('[takePhoto] Camera returned:', cameraReturn)
    } catch (error) {
      console.error('[takePhoto] Camera launch error:', error)
      showErrorToast('Camera Error', { text2: `${error}`, topOffset })
      return
    }

    if (cameraReturn.canceled === false) {
      if (locationState.status !== 'ready') {
        showInfoToast('Waiting for location...', { text2: 'Please wait until GPS coordinates are available.', topOffset: toastTopOffset })
        return
      }
      try {
        await MediaLibrary.saveToLibraryAsync(cameraReturn.assets[0].uri)
        console.log('[takePhoto] Saved to library:', cameraReturn.assets[0].uri)
      } catch (error) {
        console.error('[takePhoto] Save to library error:', error)
        // Continue anyway - the file might still be accessible from the temp URI
      }

      const captureArgs = {
        cameraImgUrl: cameraReturn.assets[0].uri,
        type: cameraReturn.assets[0].type,
        location: { coords: locationState.coords },
        waveUuid
      }

      console.log('[takePhoto] Calling enqueueCapture with:', captureArgs)
      // Grouping disabled: upload as ungrouped (no waveUuid)
      if (!grouping.enabled) {
        try {
          await enqueueCapture({ ...captureArgs })
          console.log('[takePhoto] enqueueCapture completed')
        } catch (error) {
          console.error('[takePhoto] enqueueCapture error:', error)
          showErrorToast('Upload Error', { text2: `${error}`, topOffset })
        }
        return
      }

      // Grouping enabled + offline: enqueue without waveUuid (decide at upload time)
      if (!netAvailable) {
        try {
          await enqueueCapture({ ...captureArgs })
          console.log('[takePhoto] enqueueCapture completed (offline)')
        } catch (error) {
          console.error('[takePhoto] enqueueCapture error (offline):', error)
          showErrorToast('Upload Error', { text2: `${error}`, topOffset })
        }
        return
      }

      // Grouping enabled + online: enqueue without waveUuid (wave assignment happens at upload time)
      try {
        await enqueueCapture({ ...captureArgs })
        console.log('[takePhoto] enqueueCapture completed (online)')
      } catch (error) {
        console.error('[takePhoto] enqueueCapture error (online):', error)
        showErrorToast('Upload Error', { text2: `${error}`, topOffset })
      }
    } else {
      console.log('[takePhoto] Camera was canceled')
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
