import AsyncStorage from '@react-native-community/async-storage'
import { Platform } from 'react-native'

import RNFetchBlob from 'rn-fetch-blob'

import * as CONST from '../../consts'

import * as PHOTOS_LIST_ACTION_TYPES from '../PhotosList/action_types'

import * as ACTION_TYPES from './action_types'

export const initialState = {
  previewUri: null,
  uploadingPhoto: false,
  pendingUploads: 0,
  flashMode: false,
  frontCam: false,
  zoom: 0,
  initialPinchValue: 0,
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case ACTION_TYPES.SET_PREVIEW_URI:
      return {
        ...state,
        previewUri: action.previewUri,
      }
    case ACTION_TYPES.START_PHOTO_UPLOADING:
      return {
        ...state,
        uploadingPhoto: true,
      }
    case ACTION_TYPES.FINISH_PHOTO_UPLOADING:
      return {
        ...state,
        uploadingPhoto: false,
        // pendingUploads: 0,
      }
    case ACTION_TYPES.UPDATE_PHOTOS_PENDING_UPLOAD:
      return {
        ...state,
        pendingUploads: action.pendingUploads,
      }
    case ACTION_TYPES.SET_FLASH:
      return {
        ...state,
        flashMode: action.flashMode,
      }
    case ACTION_TYPES.SET_FRONT_CAM:
      return {
        ...state,
        frontCam: action.frontCam,
      }
    case ACTION_TYPES.SET_ZOOM:
      return {
        ...state,
        zoom: action.zoom,
      }
    case ACTION_TYPES.SET_INITIAL_PINCH_VALUE:
      return {
        ...state,
        initialPinchValue: action.initialPinchValue,
      }

    default:
      return state
  }
}

export function setPreviewUri(previewUri) {
  return async (dispatch, getState) => {
    dispatch({
      type: ACTION_TYPES.SET_PREVIEW_URI,
      previewUri,
    })
  }
}

export function setFlashMode(flashMode) {
  return {
    type: ACTION_TYPES.SET_FLASH,
    flashMode,
  }
}

export function setFrontCam(frontCam) {
  return {
    type: ACTION_TYPES.SET_FRONT_CAM,
    frontCam,
  }
}

export function setZoom(zoom) {
  return {
    type: ACTION_TYPES.SET_ZOOM,
    zoom,
  }
}

export function setInitialPinchValue(initialPinchValue) {
  return {
    type: ACTION_TYPES.SET_INITIAL_PINCH_VALUE,
    initialPinchValue,
  }
}

async function getMyKeys() {
  const keys = await AsyncStorage.getAllKeys()
  const myKeys = keys.filter(key => key.startsWith("wisaw-pending-"))
  return myKeys
}

export function uploadPendingPhotos() {
  return async (dispatch, getState) => {
    const keys = await getMyKeys() || []
    let pendingUploads = keys.length
    dispatch({
      type: ACTION_TYPES.UPDATE_PHOTOS_PENDING_UPLOAD,
      pendingUploads,
    })
    if (getState().photosList.netAvailable === false) {
      return Promise.resolve()
    }
    if (getState().camera.uploadingPhoto) {
      // already uploading photos, just exit here
      return Promise.resolve()
    }

    try {
      dispatch({
        type: ACTION_TYPES.START_PHOTO_UPLOADING,
      })

      let i = 0
      // here let's iterate over the items to upload and upload one file at a time
      for (; i < keys.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
        const fileJson = JSON.parse(await AsyncStorage.getItem(keys[i]))
        // eslint-disable-next-line no-await-in-loop
        const { responseData, photo } = await uploadFile(fileJson)

        if (responseData.respInfo.status === 200) {
          // eslint-disable-next-line no-await-in-loop
          await AsyncStorage.removeItem(keys[i])
          // eslint-disable-next-line no-await-in-loop
          pendingUploads = (await getMyKeys() || []).length
          dispatch({
            type: ACTION_TYPES.UPDATE_PHOTOS_PENDING_UPLOAD,
            // eslint-disable-next-line no-await-in-loop
            pendingUploads,
          })
          photo.getThumbUrl = fileJson.uri
          photo.fallback = true
          // show the photo in the photo list immidiately
          dispatch({
            type: PHOTOS_LIST_ACTION_TYPES.PHOTO_UPLOADED_PREPEND,
            photo,
          })
        } else {
          alert("Error uploading file, try again.")
        }
      }
    } catch (error) {
      dispatch({
        type: ACTION_TYPES.FINISH_PHOTO_UPLOADING,
      })
      uploadPendingPhotos()
    }

    dispatch({
      type: ACTION_TYPES.FINISH_PHOTO_UPLOADING,
    })
    return Promise.resolve()
  }
}

async function uploadFile(fileJson) {
  const { uuid, location, uri } = fileJson
  const response = await fetch(`${CONST.HOST}/photos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      uuid,
      location,
    }),
  })

  const responseJson = await response.json()

  if (response.status === 401) {
    alert("Sorry, looks like you are banned from WiSaw.")
    return
  }
  if (response.status === 201) {
    const { uploadURL, photo } = responseJson

    let filePath = uri

    // ths has to be addressed by the rn-fetch-blob -- remove when rn-fetch-blob supports it
    if (Platform.OS === 'ios') {
      const ext = 'jpg' // or heic or png etc
      const newuri = uri.replace('ph://', '')
      const localuri = newuri.split('/')[0] // leaves 9F983DBA-EC35-42B8-8773-B597CF782EDD
      filePath = `assets-library://asset/asset.${ext}?id=${localuri}&ext=${ext}` // this you can pass into rn-fetch-blob stuff
    }

    const responseData = await RNFetchBlob.fetch('PUT', uploadURL, {
      "Content-Type": "image/jpeg",
    }, await RNFetchBlob.wrap(filePath))
    return { responseData, photo }
  }
}
