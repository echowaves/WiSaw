import { useState, useRef } from 'react'

import * as ImagePicker from 'expo-image-picker'
import * as Linking from 'expo-linking'
import * as MediaLibrary from 'expo-media-library'
import { useAtomValue, useSetAtom } from 'jotai'
import { Alert } from 'react-native'
import Toast from 'react-native-toast-message'

import * as STATE from '../../../state'
import { groupingAtom } from '../../../utils/groupingAtom'
import { isLocationInWave, autoGroupPhotos } from '../../Waves/reducer'
import { saveActiveWave } from '../../../utils/activeWaveStorage'

export default function useCameraCapture ({ enqueueCapture, toastTopOffset }) {
  const [isCameraOpening, setIsCameraOpening] = useState(false)
  const locationState = useAtomValue(STATE.locationAtom)
  const uuid = useAtomValue(STATE.uuid)
  const netAvailable = useAtomValue(STATE.netAvailable)
  const activeWave = useAtomValue(STATE.activeWaveAtom)
  const setActiveWave = useSetAtom(STATE.activeWaveAtom)
  const grouping = useAtomValue(groupingAtom)

  // Processing lock to serialize concurrent drift-check operations (task 5.1)
  const driftCheckRef = useRef(null)

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

  const runAutoGroupLoop = async (gl) => {
    let result
    do {
      result = await autoGroupPhotos({ uuid, groupingLevel: gl })
    } while (result.hasMore)
    return result
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

      const captureArgs = {
        cameraImgUrl: cameraReturn.assets[0].uri,
        type: cameraReturn.assets[0].type,
        location: { coords: locationState.coords }
      }

      // Task 5.7: If grouping is disabled, pass through waveUuid unchanged
      if (!grouping.enabled) {
        await enqueueCapture({ ...captureArgs, waveUuid })
        return
      }

      // Wait for any in-flight drift-check to complete (task 5.1)
      if (driftCheckRef.current) {
        await driftCheckRef.current
      }

      const driftCheckPromise = (async () => {
        const { latitude: lat, longitude: lon } = locationState.coords
        const checkWaveUuid = waveUuid || (activeWave ? activeWave.waveUuid : null)
        const gl = grouping.groupingLevel || 'CITY'

        // Task 5.6: If offline, skip drift check and enqueue ungrouped
        if (!netAvailable) {
          await enqueueCapture({ ...captureArgs })
          return
        }

        // Task 5.5: No active wave — enqueue ungrouped, then auto-group
        if (!checkWaveUuid) {
          await enqueueCapture({ ...captureArgs })
          try {
            const result = await runAutoGroupLoop(gl)
            if (result.isNewWave && result.waveUuid && result.name) {
              setActiveWave({ waveUuid: result.waveUuid, name: result.name })
              saveActiveWave({ waveUuid: result.waveUuid, name: result.name })
            }
          } catch (err) {
            console.warn('[useCameraCapture] auto-group after no-wave upload failed:', err)
          }
          return
        }

        // Task 5.2: Check if location is within the target wave
        let inWave
        try {
          inWave = await isLocationInWave({ lat, lon, waveUuid: checkWaveUuid, uuid })
        } catch (err) {
          console.warn('[useCameraCapture] isLocationInWave failed, enqueuing ungrouped:', err)
          await enqueueCapture({ ...captureArgs })
          return
        }

        // Task 5.3: Photo fits — enqueue with the wave UUID
        if (inWave) {
          await enqueueCapture({ ...captureArgs, waveUuid: checkWaveUuid })
          return
        }

        // Task 5.4: Drift detected — flush old, enqueue ungrouped, create new wave
        // Task 6.2: Toast for wave detail redirect
        if (waveUuid) {
          Toast.show({
            text1: 'Location changed',
            text2: 'Photo was not added to the viewed wave because your location has changed.',
            type: 'info',
            topOffset: toastTopOffset
          })
        }

        try {
          // Flush existing ungrouped photos to old wave
          await runAutoGroupLoop(gl)
        } catch (err) {
          console.warn('[useCameraCapture] flush auto-group failed:', err)
        }

        // Enqueue new photo as ungrouped
        await enqueueCapture({ ...captureArgs })

        // Auto-group again to create new wave from the uploaded photo
        try {
          const result = await runAutoGroupLoop(gl)
          if (result.isNewWave && result.waveUuid && result.name) {
            setActiveWave({ waveUuid: result.waveUuid, name: result.name })
            saveActiveWave({ waveUuid: result.waveUuid, name: result.name })
            // Task 6.1: Toast for new wave created
            Toast.show({
              text1: 'New wave created',
              text2: `Moved to new location — wave '${result.name}' created`,
              type: 'success',
              topOffset: toastTopOffset
            })
          }
        } catch (err) {
          console.warn('[useCameraCapture] post-drift auto-group failed:', err)
        }
      })()

      driftCheckRef.current = driftCheckPromise
      try {
        await driftCheckPromise
      } finally {
        driftCheckRef.current = null
      }
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
