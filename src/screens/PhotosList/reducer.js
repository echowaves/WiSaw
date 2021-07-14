// import { Platform } from 'react-native'

import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'

import * as SecureStore from 'expo-secure-store'

import * as FileSystem from 'expo-file-system'
import moment from 'moment'

import { CacheManager } from 'expo-cached-image'

import Toast from 'react-native-toast-message'

import { gql } from "@apollo/client"

import * as CONST from '../../consts.js'

import * as ACTION_TYPES from './action_types'

const UUID_KEY = 'wisaw_device_uuid'
//  date '+%Y%m%d%H%M%S'
const IS_TANDC_ACCEPTED_KEY = 'wisaw_is_tandc_accepted_on_this_device'

const ZERO_PHOTOS_LOADED_MESSAGE = '0 photos loaded'

export const initialState = {
  isTandcAccepted: true,
  uuid: null,
  location: null,
  photos: [],
  pendingPhotos: [],
  loading: false,
  errorMessage: '',
  pageNumber: -1, // have to start with -1, because will increment only in one place, when starting to get the next page
  orientation: 'portrait',
  activeSegment: 0,
  searchTerm: '',
  batch: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
  isLastPage: false,
  netAvailable: false,
  uploadingPhoto: false,
  zeroMoment: moment().format("YYYY-MM-DD-HH-mm-ss-SSS"),
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.GET_PHOTOS_STARTED:
      return {
        ...state,
        loading: true,
        pageNumber: state.pageNumber + 1,
        errorMessage: '',
      }
    case ACTION_TYPES.GET_PHOTOS_SUCCESS:
      return {
        ...state,
        photos:
        [...state.photos, ...action.photos],
        // .sort((a, b) => b.id - a.id),
        // this really stinks, need to figure out why there are duplicates in the first place
        // .filter((obj, pos, arr) => arr.map(mapObj => mapObj.id).indexOf(obj.id) === pos), // fancy way to remove duplicate photos
        // .sort((a, b) => b.id - a.id), // the sort should always happen on the server
        // pageNumber: state.pageNumber + 1,
        errorMessage: '',
      }
    case ACTION_TYPES.GET_PHOTOS_FAIL:
      return {
        ...state,
        // pageNumber: state.pageNumber + 1,
        errorMessage: action.errorMessage,
      }
    case ACTION_TYPES.GET_PHOTOS_FINISHED:
      return {
        ...state,
        loading: false,
        isLastPage: action.noMoreData

        //  (state.activeSegment === 0 && state.pageNumber > 1095) // 1095 days === 3 years
        // || (state.activeSegment === 1 && state.errorMessage === ZERO_PHOTOS_LOADED_MESSAGE)
        // || (state.activeSegment === 2 && state.errorMessage === ZERO_PHOTOS_LOADED_MESSAGE)
        ,
      }
    case ACTION_TYPES.RESET_STATE:
      return {
        ...state,
        location: action.location,
        photos: [],
        loading: false,
        loadMore: false,
        errorMessage: '',
        pageNumber: -1,
        isLastPage: false,
        batch: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
      }
    case ACTION_TYPES.SET_IS_TANDC_ACCEPTED:
      return {
        ...state,
        isTandcAccepted: action.isTandcAccepted,
      }
    case ACTION_TYPES.INIT_STATE:
      return {
        ...state,
        uuid: action.uuid,
        isTandcAccepted: action.isTandcAccepted,
      }
    case ACTION_TYPES.SET_ERROR:
      return {
        ...state,
        error: action.error,
      }
    case ACTION_TYPES.SET_ORIENTATION:
      return {
        ...state,
        orientation: action.orientation,
      }
    case ACTION_TYPES.PHOTO_LIKED:
      return {
        ...state,
        photos: state.photos.map(item => ((item.id === action.photoId) ? { ...item, likes: item.likes + 1 } : item)),
      }
    case ACTION_TYPES.PHOTO_BANNED:
      return {
        ...state,
        // photos: state.photos.filter(item => (item.id !== action.photoId)),
      }
    case ACTION_TYPES.PHOTO_DELETED:
      return {
        ...state,
        photos: state.photos.filter(item => (item.id !== action.photoId)),
      }
    case ACTION_TYPES.PHOTO_COMMENTS_LOADED:
      return {
        ...state,
        photos: state.photos.map(item => ((item.id === action.item.id) ? { ...item, comments: action.comments } : item)),
      }

    case ACTION_TYPES.PHOTO_RECOGNITIONS_LOADED:
      return {
        ...state,
        photos: state.photos.map(item => ((item.id === action.item.id) ? { ...item, recognitions: action.recognitions } : item)),
      }

    case ACTION_TYPES.PHOTO_UPLOADED_PREPEND:
      return {
        ...state,
        photos:
        [action.photo,
          ...state.photos,
        ],
      }
    case ACTION_TYPES.COMMENT_POSTED:
      return {
        ...state,
        photos: state.photos.map(
          item => ((item.id === action.photoId)
            ? {
              ...item,
              comments:
              [
                ...item.comments,
                {
                  ...action.comment,
                  hiddenButtons: true,
                },
              ],
              commentsCount: item.comments.length + 1,
            }
            : item)
        ),
      }

    case ACTION_TYPES.PHOTO_WATCHED:
      return {
        ...state,
        photos: state.photos.map(item => ((item.id === action.item.id) ? { ...item, watched: true } : item)),
      }
    case ACTION_TYPES.PHOTO_UNWATCHED:
      return {
        ...state,
        photos: state.photos.map(item => ((item.id === action.item.id) ? { ...item, watched: false } : item)),
      }

    case ACTION_TYPES.ZERO_MOMEMT:
      return {
        ...state,
        zeroMoment: action.zeroMoment,
      }

    case ACTION_TYPES.TOGGLE_COMMENT_BUTTONS:
      return {
        ...state,
        photos: state.photos.map(
          item => ((item.id === action.photoId)
            ? {
              ...item,
              comments: item.comments.map(
                comment => ((comment.id === action.commentId)
                  ? {
                    ...comment,
                    hiddenButtons: !comment.hiddenButtons,
                  }
                  : {
                    ...comment,
                    hiddenButtons: true,
                  }
                )
              )
              ,
            }
            : item)
        ),
      }
    case ACTION_TYPES.COMMENT_DELETED:
      return {
        ...state,
        photos: state.photos.map(
          item => ((item.id === action.photoId)
            ? {
              ...item,
              commentsCount: item.comments.length - 1,
              comments: item.comments.filter(
                comment => (comment.id !== action.commentId)
              )
              ,
            }
            : item)
        ),
      }
    case ACTION_TYPES.SET_ACTIVE_SEGMENT:
      return {
        ...state,
        isLastPage: false,
        searchTerm: '',
        activeSegment: action.activeSegment,
      }
    case ACTION_TYPES.SET_SEARCH_TERM:
      return {
        ...state,
        // photos: [],
        searchTerm: action.searchTerm,
      }
    case ACTION_TYPES.SET_NET_AVAILABLE:
      return {
        ...state,
        netAvailable: action.netAvailable,
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
      }
    case ACTION_TYPES.UPDATE_PENDING_PHOTOS:
      return {
        ...state,
        pendingPhotos: action.pendingPhotos,
      }

    default:
      return state
  }
}

export function initState() {
  return async (dispatch, getState) => {
    const uuid = await _getUUID(getState)
    const isTandcAccepted = await _getTancAccepted()
    // await new Promise(r => setTimeout(r, 500)) // this is really weird, but seems to help with the order of the images
    dispatch({
      type: ACTION_TYPES.INIT_STATE,
      uuid,
      isTandcAccepted,
    })
    // await new Promise(r => setTimeout(r, 500)) // this is really weird, but seems to help with the order of the images
  }
}

export function zeroMoment() {
  return async (dispatch, getState) => {
    const { zeroMoment } = (await CONST.gqlClient
      .query({
        query: gql`
        query zeroMoment {
          zeroMoment
        }`,
      })).data
    // await new Promise(r => setTimeout(r, 500)) // this is really weird, but seems to help with the order of the images
    dispatch({
      type: ACTION_TYPES.ZERO_MOMEMT,
      zeroMoment,
    })
  }
}

async function _requestGeoPhotos(getState) {
  const {
    pageNumber, batch, zeroMoment, location: { coords: { latitude, longitude } },
  } = getState().photosList
  const whenToStop = moment(zeroMoment)
  try {
    const response = (await CONST.gqlClient
      .query({
        query: gql`
      query feedByDate($batch: Long!, $daysAgo: Int!, $lat: Float!, $lon: Float!, $whenToStop: AWSDateTime!) {
        feedByDate(batch: $batch, daysAgo: $daysAgo, lat: $lat, lon: $lon, whenToStop: $whenToStop){
          photos {
                  id
                  imgUrl
                  thumbUrl
                  commentsCount
                  likes
                }
          batch,
          noMoreData
        }
      }`,
        variables: {
          batch,
          daysAgo: pageNumber,
          lat: latitude,
          lon: longitude,
          whenToStop,
        },
      }))

    console.log({ response })

    return {
      photos: response.data.feedByDate.photos,
      batch: response.data.feedByDate.batch,
      noMoreData: response.data.feedByDate.noMoreData,
    }
  } catch (err) {
    console.log({ err })// eslint-disable-line
  }
}

async function _requestWatchedPhotos(getState) {
  const { pageNumber, uuid, batch } = getState().photosList
  // console.log(`_requestWatchedPhotos(${pageNumber})`)
  const response = await axios({
    method: 'POST',
    url: `${CONST.HOST}/photos/feedForWatcher`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      uuid,
      pageNumber,
      batch,
    },
  })

  return response.data
}

async function _requestSearchedPhotos(getState) {
  const { pageNumber, searchTerm, batch } = getState().photosList
  // console.log(`_requestSearchedPhotos(${pageNumber})`)
  const { uuid } = getState().photosList

  const response = await axios({
    method: 'POST',
    url: `${CONST.HOST}/photos/feedForTextSearch`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      uuid,
      searchTerm,
      pageNumber,
      batch,
    },
  })

  return response.data
}

export function getPhotos() {
  return async (dispatch, getState) => {
    // const {
    //   batch, loading, isLastPage, pageNumber, searchTerm,
    // } = getState().photosList
    // console.log(`getPhotos() batch:${batch} pageNumber:${pageNumber} loading:${loading} isLastPage:${isLastPage} searchTerm:${searchTerm}`)
    await new Promise(r => setTimeout(r, 200)) // this is really weird, but seems to help with the order of the images
    const {
      location, netAvailable, searchTerm,
    } = getState().photosList

    let noMoreData = false

    if (!location
    || netAvailable === false
    || (getState().photosList.activeSegment === 2
        && searchTerm.length < 3)
    ) {
      dispatch({
        type: ACTION_TYPES.GET_PHOTOS_FAIL,
        errorMessage: ZERO_PHOTOS_LOADED_MESSAGE,
      })
    } else {
      dispatch({
        type: ACTION_TYPES.GET_PHOTOS_STARTED,
      })
      try {
        let responseJson
        if (getState().photosList.activeSegment === 0) {
          responseJson = await _requestGeoPhotos(getState)
        } else if (getState().photosList.activeSegment === 1) {
          responseJson = await _requestWatchedPhotos(getState)
        } else if (getState().photosList.activeSegment === 2) {
          responseJson = await _requestSearchedPhotos(getState)
        }
        // console.log({ responseJson })
        noMoreData = responseJson?.noMoreData
        if (responseJson.batch === getState().photosList.batch) {
          if (responseJson?.photos?.length > 0) {
            dispatch({
              type: ACTION_TYPES.GET_PHOTOS_SUCCESS,
              photos: responseJson.photos,
            })
          } else {
            dispatch({
              type: ACTION_TYPES.GET_PHOTOS_FAIL,
              errorMessage: ZERO_PHOTOS_LOADED_MESSAGE,
            })
          }
        } // else { console.log('wrong batch') }
      } catch (err) {
        dispatch({
          type: ACTION_TYPES.GET_PHOTOS_FAIL,
          errorMessage: err.toString(),
        })
        Toast.show({
          text1: 'Error',
          text2: err.toString(),
          type: "error",
        })
      }
    }
    dispatch({
      type: ACTION_TYPES.GET_PHOTOS_FINISHED,
      noMoreData,
    })
  }
}

export function acceptTandC() {
  try {
    SecureStore.setItemAsync(IS_TANDC_ACCEPTED_KEY, "true")
    return {
      type: ACTION_TYPES.SET_IS_TANDC_ACCEPTED,
      isTandcAccepted: true,
    }
  } catch (err) {
    return {
      type: ACTION_TYPES.SET_IS_TANDC_ACCEPTED,
      isTandcAccepted: false,
    }
  }
}

export function cancelPendingUpload({ fileName }) {
  return async dispatch => {
    await FileSystem.deleteAsync(`${CONST.PENDING_UPLOADS_FOLDER}${fileName}`, { idempotent: true })

    _updatePendingPhotos(dispatch)
  }
}

export function resetState(location) {
  return {
    type: ACTION_TYPES.RESET_STATE,
    location,
  }
}

export function setOrientation(orientation) {
  return {
    type: ACTION_TYPES.SET_ORIENTATION,
    orientation,
  }
}

export function setActiveSegment(activeSegment) {
  return ({
    type: ACTION_TYPES.SET_ACTIVE_SEGMENT,
    activeSegment,
  })
}

export function setSearchTerm(searchTerm) {
  return {
    type: ACTION_TYPES.SET_SEARCH_TERM,
    searchTerm,
  }
}

export function setNetAvailable(netAvailable) {
  return ({
    type: ACTION_TYPES.SET_NET_AVAILABLE,
    netAvailable,
  })
}

async function _getUUID(getState) {
  let { uuid } = getState().photosList
  if (uuid === null) {
    // try to retreive from secure store
    try {
      uuid = await SecureStore.getItemAsync(UUID_KEY)
    } catch (err) {
      // Toast.show({
      //   text: err.toString(),
      //   buttonText: "OK23",
      //   duration: 15000,
      // })
    }
    // no uuid in the store, generate a new one and store

    if (uuid === '' || uuid === null) {
      uuid = uuidv4()
      try {
        await SecureStore.setItemAsync(UUID_KEY, uuid)
      } catch (err) {
        // Toast.show({
        //   text: err.toString(),
        //   buttonText: "OK",
        //   duration: 15000,
        // })
      }
    }
  }
  return uuid
}

async function _getTancAccepted() {
  try {
    return await SecureStore.getItemAsync(IS_TANDC_ACCEPTED_KEY) === "true"
  } catch (err) {
    return false
  }
}

const _updatePendingPhotos = async dispatch => {
  const pendingFiles = await _getPendingUploadFiles()
  dispatch({
    type: ACTION_TYPES.UPDATE_PENDING_PHOTOS,
    pendingPhotos: pendingFiles,
  })
  return pendingFiles
}

const _makeSureDirectoryExists = async ({ directory }) => {
  const tmpDir = await FileSystem.getInfoAsync(directory)
  // create cacheDir if does not exist
  if (!tmpDir.exists) {
    await FileSystem.makeDirectoryAsync(directory)
  }
  return Promise.resolve()
}

export const queueFileForUpload = ({ uri }) => async (dispatch, getState) => {
  // move file to cacheDir
  await FileSystem.copyAsync({
    from: uri,
    to: `${CONST.PENDING_UPLOADS_FOLDER}/${moment().format("YYYY-MM-DD-HH-mm-ss-SSS")}`,
  })
  await FileSystem.deleteAsync(
    uri,
    { idempotent: true }
  )

  _updatePendingPhotos(dispatch)
}

const _getPendingUploadFiles = async () => {
  await _makeSureDirectoryExists({ directory: CONST.PENDING_UPLOADS_FOLDER })

  const files = await FileSystem.readDirectoryAsync(CONST.PENDING_UPLOADS_FOLDER)
  return files
}

export function uploadPendingPhotos() {
  return async (dispatch, getState) => {
    const { location, uuid } = getState().photosList

    const pendingFiles = await _updatePendingPhotos(dispatch)

    if (getState().photosList.netAvailable === false) {
      return Promise.resolve()
    }

    if (getState().photosList.uploadingPhoto) {
      // already uploading photos, just exit here
      return Promise.resolve()
    }

    try {
      dispatch({
        type: ACTION_TYPES.START_PHOTO_UPLOADING,
      })

      let i = 0
      // here let's iterate over the items to upload and upload one file at a time
      for (; i < pendingFiles.length; i += 1) {
        const item = pendingFiles[i]
        // eslint-disable-next-line no-await-in-loop
        const { responseData, photo } = await _uploadFile({
          item,
          uuid,
          location,
        })
        if (responseData === "banned") {
          alert("Sorry, you've been banned.")
          // eslint-disable-next-line no-await-in-loop
          await FileSystem.deleteAsync(
            `${CONST.PENDING_UPLOADS_FOLDER}${item}`,
            { idempotent: true }
          )
          // dispatch(uploadPendingPhotos())
          return Promise.resolve()
        }

        if (responseData.status === 200) {
          // eslint-disable-next-line no-await-in-loop
          await CacheManager.addToCache({
            file: `${CONST.PENDING_UPLOADS_FOLDER}${item}`,
            key: `${photo.id}`,
          })
          // eslint-disable-next-line no-await-in-loop
          await CacheManager.addToCache({
            file: `${CONST.PENDING_UPLOADS_FOLDER}${item}`,
            key: `${photo.id}-thumb`,
          })

          photo.fallback = true
          // eslint-disable-next-line no-await-in-loop
          await FileSystem.deleteAsync(
            `${CONST.PENDING_UPLOADS_FOLDER}${item}`,
            { idempotent: true }
          )
          // eslint-disable-next-line no-await-in-loop
          await CacheManager.cleanupCache({ size: 400 })

          // eslint-disable-next-line no-await-in-loop
          await _updatePendingPhotos(dispatch)

          // show the photo in the photo list immidiately
          dispatch({
            type: ACTION_TYPES.PHOTO_UPLOADED_PREPEND,
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
      Toast.show({
        text1: 'Failed to upload file, refresh to try again.',
      })
      // console.log({ error }) // eslint-disable-line no-console
      // dispatch(uploadPendingPhotos())
    }
    dispatch({
      type: ACTION_TYPES.FINISH_PHOTO_UPLOADING,
    })

    if ((await _getPendingUploadFiles()).length > 0) {
      dispatch(uploadPendingPhotos())
    }
  }
}

const _uploadFile = async ({ item, uuid, location }) => {
  const assetUri = `${CONST.PENDING_UPLOADS_FOLDER}${item}`
  try {
    const newPhoto = (await CONST.gqlClient
      .mutate({
        mutation: gql`
        mutation createPhoto($lat: Float!, $lon: Float!, $uuid: String! ) {
          createPhoto(lat: $lat, lon: $lon, uuid: $uuid ) {
            active
            commentsCount
            createdAt
            id
            imgUrl
            likes
            location
            thumbUrl
            updatedAt
            uuid
        }
      }`,
        variables: {
          lat: location.coords.latitude,
          lon: location.coords.longitude,
          uuid,
        },
      })).data.createPhoto

    const uploadUrl = (await CONST.gqlClient
      .query({
        query: gql`
        query generateUploadUrl($photoId: ID!) {
          generateUploadUrl(photoId: $photoId)
        }`,
        variables: {
          photoId: `${newPhoto.id}.upload`,
        },
      })).data.generateUploadUrl

    const responseData = await FileSystem.uploadAsync(
      uploadUrl,
      assetUri,
      {
        httpMethod: 'PUT',
        headers: {
          "Content-Type": "image/jpeg",
        },
      }
    )
    return { responseData, photo: newPhoto }
  } catch (err) {
    if (err === 'banned') {
      return { responseData: "banned", err }
    }
    return { responseData: "something bad happened, unable to upload", err }
  }
}

export default reducer
