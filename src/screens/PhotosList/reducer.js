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
  ) {
    feedByDate(
      daysAgo: $daysAgo
      lat: $lat
      lon: $lon
      batch: $batch
      whenToStop: $whenToStop
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

const FEED_BY_DATE_WITH_WAVE_QUERY = gql`
  query feedByDate(
    $daysAgo: Int!
    $lat: Float!
    $lon: Float!
    $batch: String!
    $whenToStop: AWSDateTime!
    $waveUuid: String
  ) {
    feedByDate(
      daysAgo: $daysAgo
      lat: $lat
      lon: $lon
      batch: $batch
      whenToStop: $whenToStop
      waveUuid: $waveUuid
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
  query feedForWatcher($uuid: String!, $pageNumber: Int!, $batch: String!) {
    feedForWatcher(uuid: $uuid, pageNumber: $pageNumber, batch: $batch) {
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

const FEED_FOR_WATCHER_WITH_WAVE_QUERY = gql`
  query feedForWatcher($uuid: String!, $pageNumber: Int!, $batch: String!, $waveUuid: String) {
    feedForWatcher(uuid: $uuid, pageNumber: $pageNumber, batch: $batch, waveUuid: $waveUuid) {
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

const FEED_FOR_TEXT_SEARCH_QUERY = gql`
  query feedForTextSearch($searchTerm: String!, $pageNumber: Int!, $batch: String!) {
    feedForTextSearch(searchTerm: $searchTerm, pageNumber: $pageNumber, batch: $batch) {
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

const FEED_FOR_TEXT_SEARCH_WITH_WAVE_QUERY = gql`
  query feedForTextSearch($searchTerm: String!, $pageNumber: Int!, $batch: String!, $waveUuid: String) {
    feedForTextSearch(searchTerm: $searchTerm, pageNumber: $pageNumber, batch: $batch, waveUuid: $waveUuid) {
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
export async function getZeroMoment () {
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

async function requestGeoPhotos ({ pageNumber, batch, location, zeroMoment, waveUuid }) {
  const { latitude, longitude } = location.coords
  const whenToStop = moment(zeroMoment || 0)
  try {
    const query = waveUuid ? FEED_BY_DATE_WITH_WAVE_QUERY : FEED_BY_DATE_QUERY
    const variables = {
      batch,
      daysAgo: pageNumber,
      lat: latitude,
      lon: longitude,
      whenToStop
    }
    if (waveUuid) {
      variables.waveUuid = waveUuid
    }
    const response = await CONST.gqlClient.query({
      query,
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

async function requestWatchedPhotos ({ uuid, pageNumber, batch, waveUuid }) {
  try {
    const query = waveUuid ? FEED_FOR_WATCHER_WITH_WAVE_QUERY : FEED_FOR_WATCHER_QUERY
    const variables = {
      uuid,
      pageNumber,
      batch
    }
    if (waveUuid) {
      variables.waveUuid = waveUuid
    }
    const response = await CONST.gqlClient.query({
      query,
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

async function requestSearchedPhotos ({ pageNumber, searchTerm, batch, waveUuid }) {
  try {
    const query = waveUuid ? FEED_FOR_TEXT_SEARCH_WITH_WAVE_QUERY : FEED_FOR_TEXT_SEARCH_QUERY
    const variables = {
      searchTerm,
      batch,
      pageNumber
    }
    if (waveUuid) {
      variables.waveUuid = waveUuid
    }
    const response = await CONST.gqlClient.query({
      query,
      variables
    })

    return {
      photos: response.data.feedForTextSearch.photos,
      batch: response.data.feedForTextSearch.batch,
      noMoreData: response.data.feedForTextSearch.noMoreData
    }
  } catch (err6) {
    console.error({ err6 })
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
    pageNumber,
    activeWave
  } = params

  if (!location || netAvailable === false || (activeSegment === 2 && searchTerm.length < 3)) {
    return {
      photos: [],
      batch,
      noMoreData: true
    }
  }

  try {
    const waveUuid = activeWave?.waveUuid
    const requestParams = {
      pageNumber,
      batch,
      waveUuid,
      location,
      zeroMoment,
      uuid,
      searchTerm
    }

    const requestFn = [requestGeoPhotos, requestWatchedPhotos, requestSearchedPhotos][activeSegment]

    if (requestFn) {
      return await requestFn(requestParams)
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
