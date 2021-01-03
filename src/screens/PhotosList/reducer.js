import {
  Platform,
} from 'react-native'

import { v4 as uuidv4 } from 'uuid'

import RNSecureKeyStore, { ACCESSIBLE } from 'react-native-secure-key-store'
import {
  Toast,
} from 'native-base'

import * as CONST from '../../consts.js'

import * as ACTION_TYPES from './action_types'

const UUID_KEY = 'wisaw_device_uuid'
//  date '+%Y%m%d%H%M%S'
const IS_TANDC_ACCEPTED_KEY = 'wisaw_is_tandc_accepted_on_this_device'

const ZERO_PHOTOS_LOADED_MESSAGE = '0 photos loaded'

export const initialState = {
  isTandcAccepted: false,
  uuid: null,
  location: null,
  photos: [],
  loading: false,
  errorMessage: '',
  pageNumber: -1, // have to start with -1, because will increment only in one place, when starting to get the net page
  orientation: 'portrait',
  activeSegment: 0,
  searchTerm: null,
  batch: null,
  isLastPage: false,
  netAvailable: true,
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
        state.photos.concat(action.photos).sort((a, b) => b.id - a.id),
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
      // console.log(`${state.searchTerm} && ${state.errorMessage === ZERO_PHOTOS_LOADED_MESSAGE}`)
      return {
        ...state,
        loading: false,
        isLastPage:
        (state.searchTerm && state.errorMessage === ZERO_PHOTOS_LOADED_MESSAGE)
        || (state.activeSegment === 0 && state.pageNumber > 1095) // 1095 days === 3 years
        || (state.activeSegment === 1 && state.errorMessage === ZERO_PHOTOS_LOADED_MESSAGE)
        ,
      }
    case ACTION_TYPES.RESET_STATE:
      return {
        ...state,
        // location: null,
        photos: [],
        loading: false,
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
    case ACTION_TYPES.SET_UUID:
      return {
        ...state,
        uuid: action.uuid,
      }
    case ACTION_TYPES.SET_LOCATION:
      return {
        ...state,
        location: action.location,
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
        activeSegment: action.activeSegment,
      }
    case ACTION_TYPES.SET_SEARCH_TERM:
      return {
        ...state,
        photos: [],
        searchTerm: action.searchTerm,
      }
    case ACTION_TYPES.SET_NET_AVAILABLE:
      return {
        ...state,
        netAvailable: action.netAvailable,
      }
    default:
      return state
  }
}

export default reducer

export function initState() {
  return async (dispatch, getState) => {
    // force reset tandc
    // await RNSecureKeyStore.set(IS_TANDC_ACCEPTED_KEY, "false", { accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY })
    if (Platform.OS === 'ios') {
      await RNSecureKeyStore.setResetOnAppUninstallTo(false)
    }

    dispatch({
      type: ACTION_TYPES.SET_UUID,
      uuid: await _getUUID(getState),
    })

    dispatch({
      type: ACTION_TYPES.SET_IS_TANDC_ACCEPTED,
      isTandcAccepted: await _getTancAccepted(getState),
    })
  }
}

async function _requestGeoPhotos(getState) {
  const { latitude, longitude } = getState().photosList.location.coords

  const { pageNumber, uuid, batch } = getState().photosList

  // console.log(`_requestGeoPhotos(${pageNumber})`)

  const response = await fetch(`${CONST.HOST}/photos/feedByDate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      uuid,
      location: {
        type: 'Point',
        coordinates: [
          latitude,
          longitude,
        ],
      },
      daysAgo: pageNumber,
      batch,
    }),
  })
  const responseJson = await response.json()
  return responseJson
}

async function _requestWatchedPhotos(getState) {
  const { pageNumber, uuid, batch } = getState().photosList

  // console.log(`_requestWatchedPhotos(${pageNumber})`)

  const response = await fetch(`${CONST.HOST}/photos/feedForWatcher`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      uuid,
      pageNumber,
      batch,
    }),
  })
  const responseJson = await response.json()
  return responseJson
}

async function _requestSearchedPhotos(getState) {
  const { pageNumber, searchTerm, batch } = getState().photosList
  // console.log(`_requestSearchedPhotos(${pageNumber})`)
  let { uuid } = getState().photosList
  if (uuid === null) {
    uuid = 'initializing'
  }

  const response = await fetch(`${CONST.HOST}/photos/feedForTextSearch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      uuid,
      searchTerm,
      pageNumber,
      batch,
    }),
  })
  const responseJson = await response.json()
  return responseJson
}

export function getPhotos() {
  return async (dispatch, getState) => {
    // const { batch } = getState().photosList
    // const {
    //   loading, isLastPage, pageNumber, searchTerm,
    // } = getState().photosList
    // console.log(`getPhotos() searchTerm:${searchTerm} loading:${loading} isLastPage:${isLastPage} batch:${batch} pageNumber:${pageNumber}`)
    if (!getState().photosList.location || getState().photosList.netAvailable === false) {
      dispatch({
        type: ACTION_TYPES.GET_PHOTOS_FAIL,
        errorMessage: ZERO_PHOTOS_LOADED_MESSAGE,
      })
    } else {
      const { activeSegment, searchTerm } = getState().photosList
      dispatch({
        type: ACTION_TYPES.GET_PHOTOS_STARTED,
      })
      try {
        let responseJson
        if (searchTerm !== null) {
          responseJson = await _requestSearchedPhotos(getState)
        } else if (activeSegment === 0) {
          responseJson = await _requestGeoPhotos(getState)
        } else if (activeSegment === 1) {
          responseJson = await _requestWatchedPhotos(getState)
        }

        // console.log(`${responseJson.batch}:${getState().photosList.batch}`)
        if (responseJson.batch === getState().photosList.batch) {
          if (responseJson.photos && responseJson.photos.length > 0) {
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
          text: err.toString(),
        })
      }
    }
    dispatch({
      type: ACTION_TYPES.GET_PHOTOS_FINISHED,
    })
  }
}

export function acceptTandC() {
  return async dispatch => {
    try {
      await RNSecureKeyStore.set(IS_TANDC_ACCEPTED_KEY, "true", { accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY })
      dispatch({
        type: ACTION_TYPES.SET_IS_TANDC_ACCEPTED,
        isTandcAccepted: true,
      })
    } catch (err) {
      dispatch({
        type: ACTION_TYPES.SET_IS_TANDC_ACCEPTED,
        isTandcAccepted: false,
      })
      Toast.show({
        text: err.toString(),
        buttonText: "OK",
        duration: 15000,
      })
    }
  }
}

export function resetState() {
  return {
    type: ACTION_TYPES.RESET_STATE,
  }
}
export function setLocation(location) {
  return ({
    type: ACTION_TYPES.SET_LOCATION,
    location,
  })
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
      uuid = await RNSecureKeyStore.get(UUID_KEY)
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
        await RNSecureKeyStore.set(UUID_KEY, uuid, { accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY })
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

async function _getTancAccepted(getState) {
  try {
    return JSON.parse(await RNSecureKeyStore.get(IS_TANDC_ACCEPTED_KEY))
  } catch (err) {
    return false
  }
}

// https://blog.bam.tech/developper-news/4-ways-to-dispatch-actions-with-redux
// https://hackernoon.com/react-native-basics-geolocation-adf3c0d10112

// https://medium.com/@stowball/a-dummys-guide-to-redux-and-thunk-in-react-d8904a7005d3
// https://medium.freecodecamp.org/avoiding-the-async-await-hell-c77a0fb71c4c

// https://medium.freecodecamp.org/scaling-your-redux-app-with-ducks-6115955638be

// https://blog.usejournal.com/understanding-react-native-component-lifecycle-api-d78e06870c6d
// https://medium.com/@talkol/redux-thunks-dispatching-other-thunks-discussion-and-best-practices-dd6c2b695ecf
