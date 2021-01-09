import { AsyncStorage } from 'react-native'

// import RNFetchBlob from 'rn-fetch-blob'

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
  return {
    type: ACTION_TYPES.SET_PREVIEW_URI,
    previewUri,
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
        console.log(1)
        // eslint-disable-next-line no-await-in-loop
        const item = JSON.parse(await AsyncStorage.getItem(keys[i]))
        console.log(2)
        // eslint-disable-next-line no-await-in-loop
        const { responseData } = await uploadFile(item)
        console.log(3)
        if (responseData.status === 200) {
          console.log(4)
          // eslint-disable-next-line no-await-in-loop
          await AsyncStorage.removeItem(keys[i])
          console.log(5)
          // eslint-disable-next-line no-await-in-loop
          pendingUploads = (await getMyKeys() || []).length
          console.log(6)
          dispatch({
            type: ACTION_TYPES.UPDATE_PHOTOS_PENDING_UPLOAD,
            // eslint-disable-next-line no-await-in-loop
            pendingUploads,
          })
          console.log(7)
          const photo = {
            getThumbUrl: item.asset.uri,
            fallback: true,
            id: item.asset.id,
          }
          console.log(8)
          // show the photo in the photo list immidiately
          dispatch({
            type: PHOTOS_LIST_ACTION_TYPES.PHOTO_UPLOADED_PREPEND,
            photo,
          })
          console.log(9)
        } else {
          alert("Error uploading file, try again.")
        }
      }
    } catch (error) {
      console.log(10)
      dispatch({
        type: ACTION_TYPES.FINISH_PHOTO_UPLOADING,
      })
      console.log(error)
      // dispatch(uploadPendingPhotos())
    }
    console.log(11)
    dispatch({
      type: ACTION_TYPES.FINISH_PHOTO_UPLOADING,
    })
    console.log(12)
    return Promise.resolve()
  }
}

const uploadFile = async item => {
  try {
    const {
      uuid, location, asset, uri,
    } = item
    console.log(item)
    console.log(20)
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
    console.log(21)
    const responseJson = await response.json()
    // console.log({ assetFile })
    // console.log({ responseJson })
    console.log(22)
    if (response.status === 401) {
      alert("Sorry, looks like you have been banned from WiSaw.")
      return
    }
    console.log(23)
    if (response.status === 201) {
      console.log(24)
      const { uploadURL } = responseJson
      console.log(25)
      console.log(uri)
      console.log(asset.uri)
      let picture = await fetch(asset.uri)
      console.log(26)
      picture = await picture.blob()
      console.log(27)
      const imageData = new File([picture], "file.jpeg")
      console.log(28)

      const responseData = await fetch(uploadURL, {
        method: 'PUT',
        body: imageData,
        headers: {
          "Content-Type": "image/jpeg",
        },
      })
      console.log(29)
      return { responseData }
    }
  } catch (error) {
    console.log(error)
  }
}
