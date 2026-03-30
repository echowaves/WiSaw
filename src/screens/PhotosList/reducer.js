/* global console */
// import { Platform } from 'react-native'

import * as SecureStore from 'expo-secure-store'

import moment from 'moment'

import Toast from 'react-native-toast-message'

import { gql } from '@apollo/client'

import * as CONST from '../../consts'

export {
  addToQueue,
  clearQueue,
  ensureFileExists,
  generatePhoto,
  getQueue,
  initPendingUploads,
  processCompleteUpload,
  processQueuedFile,
  queueFileForUpload,
  removeFromQueue,
  updateQueueItem,
  uploadItem
} from './upload/photoUploadService'

// import * as ACTION_TYPES from './action_types'

// import { getUUID } from '../Secret/reducer'
//  date '+%Y%m%d%H%M%S'
// this is not a password or sensitive info, so SecureStore is used for simplicity
const IS_TANDC_ACCEPTED_KEY = 'wisaw_is_tandc_accepted_on_this_device'

export const initialState = {
  // isTandcAccepted: true, //
  // zeroMoment: null, //
  // photos: [], //
  // netAvailable: false,
  // searchTerm: '',
  // location: null,
  // pendingPhotos: [],
  // errorMessage: '',
  // pageNumber: -1, // have to start with -1, because will increment only in one place, when starting to get the next page
  // orientation: 'portrait',
  // batch: `${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)}`,
  // isLastPage: true,
  // uploadPendingPhotosloadingPhoto: false,
  // toastOffset: 100,
  // currentIndex: 0,
}

const FEED_BY_DATE_QUERY = gql`
  query feedByDate(
    $daysAgo: Int!
    $lat: Float!
    $lon: Float!
    $batch: String!
    $whenToStop: AWSDateTime!
    $searchTerm: String
  ) {
    feedByDate(
      daysAgo: $daysAgo
      lat: $lat
      lon: $lon
      batch: $batch
      whenToStop: $whenToStop
      searchTerm: $searchTerm
    ) {
      photos {
        row_number
        id
        uuid
        imgUrl
        thumbUrl
        videoUrl
        video
        commentsCount
        watchersCount
        lastComment
        createdAt
        width
        height
      }
      batch
      noMoreData
    }
  }
`

const FEED_FOR_WATCHER_QUERY = gql`
  query feedForWatcher($uuid: String!, $pageNumber: Int!, $batch: String!, $searchTerm: String) {
    feedForWatcher(uuid: $uuid, pageNumber: $pageNumber, batch: $batch, searchTerm: $searchTerm) {
      photos {
        row_number
        id
        uuid
        imgUrl
        thumbUrl
        videoUrl
        video
        commentsCount
        watchersCount
        lastComment
        createdAt
        width
        height
      }
      batch
      noMoreData
    }
  }
`

export async function getTancAccepted () {
  try {
    return (await SecureStore.getItemAsync(IS_TANDC_ACCEPTED_KEY)) === 'true'
  } catch (err) {
    console.error('T&C', { err })

    return false
  }
}

// this function return the time of the very first photo stored in the backend,
// so that we can tell when to stop requesting new photos while paging through the results
export async function getZeroMoment ({ netAvailable } = {}) {
  if (netAvailable === false) return 0
  try {
    const { zeroMoment } = (
      await CONST.gqlClient.query({
        query: gql`
          query zeroMoment {
            zeroMoment
          }
        `
      })
    ).data
    return zeroMoment
  } catch (qwenlcsd) {
    console.error({ qwenlcsd })
  }
  return 0
}

async function requestGeoPhotos ({ pageNumber, batch, location, zeroMoment, searchTerm }) {
  const { latitude, longitude } = location.coords
  const whenToStop = moment(zeroMoment || 0)
  try {
    const variables = {
      batch,
      daysAgo: pageNumber,
      lat: latitude,
      lon: longitude,
      whenToStop,
      searchTerm: searchTerm || undefined
    }
    const response = await CONST.gqlClient.query({
      query: FEED_BY_DATE_QUERY,
      variables
    })
    return {
      photos: response.data.feedByDate.photos,
      batch: response.data.feedByDate.batch,
      noMoreData: response.data.feedByDate.noMoreData
    }
  } catch (err) {
    console.error({ err })
  }
  return {
    photos: [],
    batch,
    noMoreData: true
  }
}

async function requestWatchedPhotos ({ uuid, pageNumber, batch, searchTerm }) {
  try {
    const variables = {
      uuid,
      pageNumber,
      batch,
      searchTerm: searchTerm || undefined
    }
    const response = await CONST.gqlClient.query({
      query: FEED_FOR_WATCHER_QUERY,
      variables
    })

    return {
      photos: response.data.feedForWatcher.photos,
      batch: response.data.feedForWatcher.batch,
      noMoreData: response.data.feedForWatcher.noMoreData
    }
  } catch (err5) {
    console.error({ err5 })
  }
  return {
    photos: [],
    batch,
    noMoreData: true
  }
}

export async function getPhotos (params) {
  const {
    uuid,
    zeroMoment,
    location,
    netAvailable,
    searchTerm,
    topOffset = 100,
    activeSegment,
    batch,
    pageNumber
  } = params

  if ((!location && activeSegment === 0) || netAvailable === false) {
    return {
      photos: [],
      batch,
      noMoreData: true
    }
  }

  try {
    const requestParams = {
      pageNumber,
      batch,
      location,
      zeroMoment,
      uuid,
      searchTerm
    }

    switch (activeSegment) {
      case 0:
        return await requestGeoPhotos(requestParams)
      case 1:
        return await requestWatchedPhotos(requestParams)
      default:
        break
    }
  } catch (err7) {
    console.error({ err7 })
    Toast.show({
      text1: 'Error',
      text2: `${err7}`,
      type: 'error',
      topOffset
    })
  }
  return {
    photos: [],
    batch,
    noMoreData: true
  }
}

export function acceptTandC () {
  try {
    SecureStore.setItemAsync(IS_TANDC_ACCEPTED_KEY, 'true')
    return true
  } catch (err8) {
    console.error({ err8 })
    return false
  }
}
